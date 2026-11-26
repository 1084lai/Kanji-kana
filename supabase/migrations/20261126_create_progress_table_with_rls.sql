-- Progressi di studio: una riga per utente, accessibile solo al proprietario (RLS).
create table public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  flashcards jsonb not null default '{}'::jsonb,
  known jsonb not null default '{}'::jsonb,
  schema_version integer not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

create policy "progress_select_own" on public.progress
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "progress_insert_own" on public.progress
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "progress_update_own" on public.progress
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "progress_delete_own" on public.progress
  for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.progress from anon;
