create table conversions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  negative_text text not null,
  positive_text text not null,
  tone text not null default 'default',
  created_at timestamptz default now() not null
);

alter table conversions enable row level security;

create policy "Users can view own conversions"
  on conversions for select using (auth.uid() = user_id);

create policy "Users can insert own conversions"
  on conversions for insert with check (auth.uid() = user_id);

create policy "Users can delete own conversions"
  on conversions for delete using (auth.uid() = user_id);
