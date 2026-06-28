drop function if exists public.create_reservation(
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
);

alter table public.reservations
  rename column guest_email to representative_email;

alter table public.reservations
  rename column guest_phone to representative_phone;

alter table public.reservations
  add column representative_postal_code text,
  add column representative_address text;

alter table public.reservations
  add constraint reservations_representative_postal_code_check
    check (
      representative_postal_code is null
      or representative_postal_code ~ '^[0-9]{3}-?[0-9]{4}$'
    ),
  add constraint reservations_representative_address_check
    check (
      representative_address is null
      or btrim(representative_address) <> ''
    );

create table public.reservation_guests (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations (id) on delete cascade,
  full_name text not null check (btrim(full_name) <> ''),
  is_representative boolean not null default false,
  sort_order smallint not null check (sort_order > 0),
  created_at timestamptz not null default now(),
  unique (reservation_id, sort_order)
);

create unique index reservation_guests_representative_idx
  on public.reservation_guests (reservation_id)
  where is_representative;

insert into public.reservation_guests (
  reservation_id,
  full_name,
  is_representative,
  sort_order
)
select id, guest_name, true, 1
from public.reservations;

alter table public.reservations
  drop column guest_name;

create or replace function public.create_reservation(
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
  v_id uuid := gen_random_uuid();
  v_max_reserved integer;
  v_plan public.plans%rowtype;
  v_reservation public.reservations%rowtype;
  v_room_type public.room_types%rowtype;
begin
  if p_check_in_date is null
    or p_check_out_date is null
    or p_check_out_date <= p_check_in_date then
    raise exception '宿泊日を確認してください。';
  end if;

  if p_adults is null
    or p_children is null
    or p_room_count is null
    or p_adults < 1
    or p_children < 0
    or p_room_count < 1 then
    raise exception '宿泊人数・客室数を確認してください。';
  end if;

  if coalesce(cardinality(p_guest_names), 0) <> p_adults + p_children
    or exists (
      select 1
      from unnest(p_guest_names) as guest_name
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

  if p_payment_method is null
    or not (p_payment_method = any(v_plan.payment_methods)) then
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
    representative_email,
    representative_phone,
    representative_postal_code,
    representative_address,
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
    btrim(p_representative_email),
    btrim(p_representative_phone),
    btrim(p_representative_postal_code),
    btrim(p_representative_address),
    p_payment_method,
    v_room_type.base_price_yen,
    v_plan.adult_surcharge_yen,
    v_plan.cancellation_policy,
    now()
  )
  returning * into v_reservation;

  insert into public.reservation_guests (
    reservation_id,
    full_name,
    is_representative,
    sort_order
  )
  select
    v_id,
    btrim(guest_name),
    guest_order = 1,
    guest_order::smallint
  from unnest(p_guest_names) with ordinality as guests(guest_name, guest_order);

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
  text[],
  text,
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
  text[],
  text,
  text,
  text,
  text,
  public.payment_method
) to service_role;
