-- Chat threads are keyed by reservation confirmation_code for guest lookup.
-- DB persistence is prepared here; the app currently uses an in-memory DAO until Supabase is wired.

create type public.chat_sender as enum (
  'guest',
  'hotel'
);

create table public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  confirmation_code text not null unique,
  guest_email text not null,
  last_read_at_guest timestamptz,
  last_read_at_hotel timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chat_threads_confirmation_code_not_blank check (btrim(confirmation_code) <> ''),
  constraint chat_threads_guest_email_not_blank check (btrim(guest_email) <> '')
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads (id) on delete cascade,
  sender public.chat_sender not null,
  body text not null,
  created_at timestamptz not null default now(),
  constraint chat_messages_body_not_blank check (btrim(body) <> ''),
  constraint chat_messages_body_length check (char_length(body) <= 1000)
);

create index chat_messages_thread_id_created_at_idx
  on public.chat_messages (thread_id, created_at);

create index chat_threads_updated_at_idx
  on public.chat_threads (updated_at desc);

revoke all on table public.chat_threads from public, anon, authenticated;
revoke all on table public.chat_messages from public, anon, authenticated;
grant select, insert, update, delete on table public.chat_threads to service_role;
grant select, insert, update, delete on table public.chat_messages to service_role;
