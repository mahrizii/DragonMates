alter table public.users
  add column if not exists can_receive_notifications boolean not null default true;
