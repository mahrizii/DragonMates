-- Creates DB-level match detection and deduplicated notifications.

alter table public.notifications
  add column if not exists related_user_id uuid;

alter table public.notifications
  add column if not exists type text;

create unique index if not exists likes_unique_liker_liked_idx
  on public.likes (liker_id, liked_id);

create unique index if not exists notifications_match_unique_user_related_idx
  on public.notifications (user_id, related_user_id)
  where type = 'match';

create or replace function public.create_match_notifications_on_like()
returns trigger
language plpgsql
as $$
declare
  reciprocal_exists boolean;
  liker_name text;
  liked_name text;
begin
  select exists (
    select 1
    from public.likes l
    where l.liker_id = new.liked_id
      and l.liked_id = new.liker_id
  )
  into reciprocal_exists;

  if not reciprocal_exists then
    return new;
  end if;

  select concat_ws(' ', u.first_name, u.last_name)
  into liker_name
  from public.users u
  where u.id = new.liker_id;

  select concat_ws(' ', u.first_name, u.last_name)
  into liked_name
  from public.users u
  where u.id = new.liked_id;

  insert into public.notifications (user_id, type, related_user_id, title, body, read)
  values (
    new.liker_id,
    'match',
    new.liked_id,
    'It''s a match!',
    format('You and %s have matched.', coalesce(nullif(liked_name, ''), 'someone')),
    false
  )
  on conflict (user_id, related_user_id) where type = 'match' do nothing;

  insert into public.notifications (user_id, type, related_user_id, title, body, read)
  values (
    new.liked_id,
    'match',
    new.liker_id,
    'It''s a match!',
    format('You and %s have matched.', coalesce(nullif(liker_name, ''), 'someone')),
    false
  )
  on conflict (user_id, related_user_id) where type = 'match' do nothing;

  return new;
end;
$$;

drop trigger if exists likes_create_match_notifications on public.likes;

create trigger likes_create_match_notifications
after insert on public.likes
for each row
execute function public.create_match_notifications_on_like();
