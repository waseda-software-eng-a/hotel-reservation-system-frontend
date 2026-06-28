create type public.room_kind as enum (
  'single',
  'double',
  'twin',
  'suite'
);

create type public.bed_kind as enum (
  'single',
  'double',
  'twin'
);

create type public.meal_type as enum (
  'room_only',
  'breakfast',
  'half_board'
);

create type public.payment_method as enum (
  'onsite',
  'web'
);

create type public.reservation_status as enum (
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show'
);

create table public.room_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  room_kind public.room_kind not null,
  bed_kind public.bed_kind not null,
  max_occupancy smallint not null check (max_occupancy > 0),
  total_rooms smallint not null check (total_rooms >= 0),
  base_price_yen integer not null check (base_price_yen >= 0),
  description text not null default '',
  wing text,
  floor_label text,
  size_sqm numeric(5, 2) check (size_sqm > 0),
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.amenities (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  category text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.room_type_amenities (
  room_type_id uuid not null references public.room_types (id) on delete cascade,
  amenity_id uuid not null references public.amenities (id) on delete restrict,
  primary key (room_type_id, amenity_id)
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  summary text not null default '',
  meal_type public.meal_type not null,
  payment_methods public.payment_method[] not null
    check (cardinality(payment_methods) > 0),
  check_in_time time not null,
  check_out_time time not null,
  adult_surcharge_yen integer not null default 0 check (adult_surcharge_yen >= 0),
  cancellation_policy text not null,
  tags text[] not null default '{}',
  image_path text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plan_room_types (
  plan_id uuid not null references public.plans (id) on delete cascade,
  room_type_id uuid not null references public.room_types (id) on delete restrict,
  primary key (plan_id, room_type_id)
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  confirmation_code text not null unique,
  plan_id uuid not null,
  room_type_id uuid not null,
  status public.reservation_status not null default 'confirmed',
  check_in_date date not null,
  check_out_date date not null,
  adults smallint not null check (adults >= 1),
  children smallint not null default 0 check (children >= 0),
  room_count smallint not null check (room_count >= 1),
  guest_name text not null,
  guest_email text not null,
  guest_phone text not null,
  payment_method public.payment_method not null,
  booked_room_price_yen integer not null check (booked_room_price_yen >= 0),
  booked_adult_surcharge_yen integer not null default 0
    check (booked_adult_surcharge_yen >= 0),
  cancellation_policy_snapshot text not null,
  terms_accepted_at timestamptz not null,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (plan_id, room_type_id)
    references public.plan_room_types (plan_id, room_type_id)
    on delete restrict,
  check (check_out_date > check_in_date)
);

create index reservations_availability_idx
  on public.reservations (room_type_id, check_in_date, check_out_date)
  where status in ('pending', 'confirmed');
