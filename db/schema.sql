-- Hermes content engine schema
-- Structured on purpose: signals, drafts, sections, assets.

create extension if not exists pgcrypto;

create table if not exists signal_items (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_item_id text not null,
  title text not null,
  canonical_url text not null,
  source_url text,
  published_at timestamptz,
  summary text not null,
  practical_tip text not null,
  topic text not null,
  score numeric(5, 4) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, source_item_id)
);

create index if not exists signal_items_score_idx on signal_items (score desc, published_at desc nulls last);

create table if not exists signal_evidence (
  id uuid primary key default gen_random_uuid(),
  signal_item_id uuid not null references signal_items(id) on delete cascade,
  sort_order integer not null,
  evidence_text text not null,
  created_at timestamptz not null default now(),
  unique (signal_item_id, sort_order)
);

create table if not exists draft_posts (
  id uuid primary key default gen_random_uuid(),
  signal_item_id uuid not null references signal_items(id) on delete cascade,
  title text not null,
  slug text not null unique,
  excerpt text not null,
  topic text not null,
  status text not null default 'draft',
  generated_at timestamptz not null default now(),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists draft_posts_status_idx on draft_posts (status, generated_at desc);

create table if not exists draft_sections (
  id uuid primary key default gen_random_uuid(),
  draft_post_id uuid not null references draft_posts(id) on delete cascade,
  sort_order integer not null,
  section_key text not null,
  heading text not null,
  body text not null,
  created_at timestamptz not null default now(),
  unique (draft_post_id, sort_order)
);

create table if not exists draft_assets (
  id uuid primary key default gen_random_uuid(),
  draft_post_id uuid not null references draft_posts(id) on delete cascade,
  sort_order integer not null,
  kind text not null,
  asset_url text not null,
  prompt text,
  alt_text text not null,
  created_at timestamptz not null default now(),
  unique (draft_post_id, sort_order)
);
