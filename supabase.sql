-- CLASS 8G QUIZ — Supabase schema
-- Jalankan seluruh isi file ini di Supabase SQL Editor (Project > SQL Editor > New query).

create extension if not exists "pgcrypto";

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  correct integer not null default 0,
  elapsed numeric not null default 0,
  violations integer not null default 0,
  violation_events jsonb not null default '[]'::jsonb,
  score integer not null default 0,
  clean boolean not null default false,
  status text not null default 'CLEAN',
  created_at timestamptz not null default now()
);

create index if not exists submissions_leaderboard_idx
  on submissions (clean, score desc, elapsed asc);

-- Row Level Security: aktifkan RLS dan JANGAN buat policy untuk anon/authenticated.
-- Semua akses ke tabel ini HARUS melalui Vercel Serverless Functions (api/*.js) yang
-- memakai SUPABASE_SERVICE_ROLE_KEY, yang secara otomatis melewati RLS.
-- Dengan begitu, browser peserta tidak pernah bisa membaca/menulis tabel ini secara langsung.
alter table submissions enable row level security;

-- (Sengaja tidak ada "create policy" di sini — itu artinya anon key tidak punya akses sama sekali.)
