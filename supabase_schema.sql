-- Audrita Mukherjee — The Quiet Garden
-- Supabase Schema for Personal Poetry Archive
-- Run this in your Supabase Project SQL Editor (https://supabase.com/dashboard/project/_/sql)

create table if not exists public.poems (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  language text not null default 'english', -- 'english' or 'hindi'
  tag text not null default 'Silence & Water',
  verse text not null,
  date text not null,
  notes text,
  is_favorite boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.poems enable row level security;

-- Policy 1: Anyone with the project anon key can read published poems
create policy "Public can read poems"
  on public.poems
  for select
  using (true);

-- Policy 2: Allow insert for anon/authenticated (protected by your Vercel deployment)
create policy "Allow insert poems"
  on public.poems
  for insert
  with check (true);

-- Sample initial entries
insert into public.poems (title, language, tag, verse, date) values
(
  'The River Knows',
  'english',
  'Silence & Water',
  'there is a kind of listening
that does not ask the river
to explain its drowning.

it simply sits on the bank
and lets the water
speak in ripples.

what we hold tightly
slips between our fingers.
what we leave open
learns to stay.',
  '07 October 2026'
),
(
  'कुछ अनकहे अल्फ़ाज़',
  'hindi',
  'ख़ामोशी & इश्क़',
  'कुछ बातें हवाओं के हवाले छोड़ दी हैं,
हर सवाल का जवाब अल्फ़ाज़ नहीं होते।

कभी शाम की चाय पर बैठना मेरे साथ,
जो ख़ामोश रह जाएँ, वही असली क़िस्से हैं।

तुमने छुआ था उस हिस्से को
जो बरसों से अंधेरे में रहने का आदी था,
और हौले से कहा —
तुम टूटे नहीं, सिर्फ़ संवर रहे हो।',
  '24 September 2026'
);
