-- Create Notes table (for Clipboard)
create table if not exists public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  content text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Create Documents table (for Docs)
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.notes enable row level security;
alter table public.documents enable row level security;

-- Policies for Notes
create policy "Users can view their own notes" on public.notes
  for select using (auth.uid() = user_id);

create policy "Users can insert their own notes" on public.notes
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own notes" on public.notes
  for update using (auth.uid() = user_id);

-- Policies for Documents
create policy "Users can view their own documents" on public.documents
  for select using (auth.uid() = user_id);

create policy "Users can insert their own documents" on public.documents
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own documents" on public.documents
  for update using (auth.uid() = user_id);

create policy "Users can delete their own documents" on public.documents
  for delete using (auth.uid() = user_id);

-- Enable Realtime
alter publication supabase_realtime add table public.notes;
alter publication supabase_realtime add table public.documents;
