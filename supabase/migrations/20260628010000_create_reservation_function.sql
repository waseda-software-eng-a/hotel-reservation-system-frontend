create or replace function public.create_reservation(
  p_plan_id uuid,
  p_room_type_id uuid,
  p_check_in_date date,
  p_check_out_date date,
  p_adults smallint,
  p_children smallint,
  p_room_count smallint,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_payment_method public.payment_method
)
returns public.reservations
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := gen_random_uuid();
  v_max_reserved integer;
  v_plan public.plans%rowtype;
  v_reservation public.reservations%rowtype;
  v_room_type public.room_types%rowtype;
begin
  if p_check_out_date <= p_check_in_date then
    raise exception '宿泊日を確認してください。';
  end if;

  if p_adults < 1 or p_children < 0 or p_room_count < 1 then
    raise exception '宿泊人数・客室数を確認してください。';
  end if;

  select *
  into v_room_type
  from public.room_types
  where id = p_room_type_id
  for update;

  if not found then
    raise exception '選択した客室が見つかりません。';
  end if;

  select *
  into v_plan
  from public.plans
  where id = p_plan_id;

  if not found or not exists (
    select 1
    from public.plan_room_types
    where plan_id = p_plan_id
      and room_type_id = p_room_type_id
  ) then
    raise exception '選択したプラン・客室の組み合わせは予約できません。';
  end if;

  if not (p_payment_method = any(v_plan.payment_methods)) then
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
    from generate_series(
      p_check_in_date,
      p_check_out_date - 1,
      interval '1 day'
    ) as stay_dates(stay_date)
    left join public.reservations
      on reservations.room_type_id = p_room_type_id
      and reservations.status in ('pending', 'confirmed')
      and reservations.check_in_date <= stay_dates.stay_date::date
      and reservations.check_out_date > stay_dates.stay_date::date
    group by stay_dates.stay_date
  ) as daily_reserved;

  if v_room_type.total_rooms - v_max_reserved < p_room_count then
    raise exception '選択した客室は現在予約できません。';
  end if;

  insert into public.reservations (
    id,
    confirmation_code,
    plan_id,
    room_type_id,
    status,
    check_in_date,
    check_out_date,
    adults,
    children,
    room_count,
    guest_name,
    guest_email,
    guest_phone,
    payment_method,
    booked_room_price_yen,
    booked_adult_surcharge_yen,
    cancellation_policy_snapshot,
    terms_accepted_at
  )
  values (
    v_id,
    'WH-' || upper(substr(replace(v_id::text, '-', ''), 1, 10)),
    p_plan_id,
    p_room_type_id,
    'confirmed',
    p_check_in_date,
    p_check_out_date,
    p_adults,
    p_children,
    p_room_count,
    p_guest_name,
    p_guest_email,
    p_guest_phone,
    p_payment_method,
    v_room_type.base_price_yen,
    v_plan.adult_surcharge_yen,
    v_plan.cancellation_policy,
    now()
  )
  returning * into v_reservation;

  return v_reservation;
end;
$$;

revoke all on function public.create_reservation(
  uuid,
  uuid,
  date,
  date,
  smallint,
  smallint,
  smallint,
  text,
  text,
  text,
  public.payment_method
) from public, anon, authenticated;

grant execute on function public.create_reservation(
  uuid,
  uuid,
  date,
  date,
  smallint,
  smallint,
  smallint,
  text,
  text,
  text,
  public.payment_method
) to service_role;
