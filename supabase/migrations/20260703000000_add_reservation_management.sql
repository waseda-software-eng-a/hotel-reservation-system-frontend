create or replace function public.update_reservation(
  p_confirmation_code text,
  p_current_email text,
  p_plan_id uuid,
  p_room_type_id uuid,
  p_check_in_date date,
  p_check_out_date date,
  p_adults smallint,
  p_children smallint,
  p_room_count smallint,
  p_guest_names text[],
  p_representative_email text,
  p_representative_phone text,
  p_representative_postal_code text,
  p_representative_address text,
  p_payment_method public.payment_method
)
returns public.reservations
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_max_reserved integer;
  v_plan public.plans%rowtype;
  v_reservation public.reservations%rowtype;
  v_room_type public.room_types%rowtype;
begin
  select * into v_reservation
  from public.reservations
  where confirmation_code = upper(btrim(p_confirmation_code))
    and lower(representative_email) = lower(btrim(p_current_email))
  for update;

  if not found then
    raise exception '予約番号またはメールアドレスが正しくありません。';
  end if;

  if v_reservation.status <> 'confirmed' then
    raise exception 'この予約は変更できません。';
  end if;

  if p_check_in_date is null or p_check_out_date is null
    or p_check_out_date <= p_check_in_date then
    raise exception '宿泊日を確認してください。';
  end if;

  if p_adults is null or p_children is null or p_room_count is null
    or p_adults < 1 or p_children < 0 or p_room_count < 1 then
    raise exception '宿泊人数・客室数を確認してください。';
  end if;

  if coalesce(cardinality(p_guest_names), 0) <> p_adults + p_children
    or exists (
      select 1 from unnest(p_guest_names) as guest_name
      where btrim(guest_name) = ''
    ) then
    raise exception '宿泊者全員の氏名を入力してください。';
  end if;

  if coalesce(btrim(p_representative_email), '') = ''
    or coalesce(btrim(p_representative_phone), '') = ''
    or coalesce(btrim(p_representative_address), '') = ''
    or coalesce(p_representative_postal_code, '') !~ '^[0-9]{3}-?[0-9]{4}$' then
    raise exception '代表者情報を確認してください。';
  end if;

  -- 変更前後の客室タイプを同じ順序でロックし、同時更新時の競合を防ぐ。
  perform id
  from public.room_types
  where id in (v_reservation.room_type_id, p_room_type_id)
  order by id
  for update;

  select * into v_room_type
  from public.room_types
  where id = p_room_type_id;

  if not found then
    raise exception '選択した客室が見つかりません。';
  end if;

  select * into v_plan from public.plans where id = p_plan_id;

  if not found or not exists (
    select 1 from public.plan_room_types
    where plan_id = p_plan_id and room_type_id = p_room_type_id
  ) then
    raise exception '選択したプラン・客室の組み合わせは予約できません。';
  end if;

  if p_payment_method is null or not (p_payment_method = any(v_plan.payment_methods)) then
    raise exception '選択した支払方法は利用できません。';
  end if;

  if p_adults + p_children > v_room_type.max_occupancy * p_room_count then
    raise exception '選択した客室の定員を超えています。';
  end if;

  select coalesce(max(daily_reserved.reserved_count), 0)
  into v_max_reserved
  from (
    select
      stay_dates.stay_date::date,
      coalesce(sum(reservations.room_count), 0)::integer as reserved_count
    from generate_series(p_check_in_date, p_check_out_date - 1, interval '1 day')
      as stay_dates(stay_date)
    left join public.reservations
      on reservations.room_type_id = p_room_type_id
      and reservations.id <> v_reservation.id
      and reservations.status in ('pending', 'confirmed')
      and reservations.check_in_date <= stay_dates.stay_date::date
      and reservations.check_out_date > stay_dates.stay_date::date
    group by stay_dates.stay_date
  ) as daily_reserved;

  if v_room_type.total_rooms - v_max_reserved < p_room_count then
    raise exception '選択した客室は現在予約できません。';
  end if;

  update public.reservations set
    plan_id = p_plan_id,
    room_type_id = p_room_type_id,
    check_in_date = p_check_in_date,
    check_out_date = p_check_out_date,
    adults = p_adults,
    children = p_children,
    room_count = p_room_count,
    representative_email = btrim(p_representative_email),
    representative_phone = btrim(p_representative_phone),
    representative_postal_code = btrim(p_representative_postal_code),
    representative_address = btrim(p_representative_address),
    payment_method = p_payment_method,
    booked_room_price_yen = v_room_type.base_price_yen,
    booked_adult_surcharge_yen = v_plan.adult_surcharge_yen,
    cancellation_policy_snapshot = v_plan.cancellation_policy,
    updated_at = now()
  where id = v_reservation.id
  returning * into v_reservation;

  delete from public.reservation_guests where reservation_id = v_reservation.id;
  insert into public.reservation_guests (
    reservation_id, full_name, is_representative, sort_order
  )
  select
    v_reservation.id,
    btrim(guest_name),
    guest_order = 1,
    guest_order::smallint
  from unnest(p_guest_names) with ordinality as guests(guest_name, guest_order);

  return v_reservation;
end;
$$;

create or replace function public.cancel_reservation(
  p_confirmation_code text,
  p_email text
)
returns public.reservations
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reservation public.reservations%rowtype;
begin
  select * into v_reservation
  from public.reservations
  where confirmation_code = upper(btrim(p_confirmation_code))
    and lower(representative_email) = lower(btrim(p_email))
  for update;

  if not found then
    raise exception '予約番号またはメールアドレスが正しくありません。';
  end if;

  if v_reservation.status = 'cancelled' then
    raise exception 'この予約はすでにキャンセルされています。';
  end if;

  if v_reservation.status <> 'confirmed' then
    raise exception 'この予約はキャンセルできません。';
  end if;

  update public.reservations set
    status = 'cancelled',
    cancelled_at = now(),
    updated_at = now()
  where id = v_reservation.id
  returning * into v_reservation;

  return v_reservation;
end;
$$;

revoke all on function public.update_reservation(
  text, text, uuid, uuid, date, date, smallint, smallint, smallint,
  text[], text, text, text, text, public.payment_method
) from public, anon, authenticated;
grant execute on function public.update_reservation(
  text, text, uuid, uuid, date, date, smallint, smallint, smallint,
  text[], text, text, text, text, public.payment_method
) to service_role;

revoke all on function public.cancel_reservation(text, text) from public, anon, authenticated;
grant execute on function public.cancel_reservation(text, text) to service_role;
