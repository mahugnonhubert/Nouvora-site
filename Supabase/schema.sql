-- ════════════════════════════════════════════════════════════
--  NOUVORA LABS — Schéma Supabase (v15 — corrigé)
--  Pour l'activer :
--    1. Aller dans l'éditeur SQL de ton projet Supabase
--    2. Coller et exécuter ce fichier (Sans RLS)
--    3. Renseigner l'URL + clé anonyme dans
--       assets/js/supabase-client.js
-- ════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── 1. UTILISATEURS ──────────────────────────────────────────
create table if not exists users (
  id          bigint generated always as identity primary key,
  nom         text not null,
  prenom      text not null,
  email       text not null unique,
  password    text not null,
  statut      text not null default 'visiteur'
              check (statut in ('visiteur', 'premium', 'admin')),
  date        timestamptz not null default now(),
  created_at  timestamptz not null default now()
);
create index if not exists idx_users_email  on users (email);
create index if not exists idx_users_statut on users (statut);

-- ── 2. PAIEMENTS ─────────────────────────────────────────────
create table if not exists payments (
  id             bigint generated always as identity primary key,
  user_id        bigint references users (id) on delete set null,
  nom            text,
  email          text,
  montant        integer not null default 0,
  devise         text not null default 'XOF',
  statut         text not null default 'en attente'
                 check (statut in ('en attente', 'validé', 'échoué')),
  methode        text default 'Genius Pay',
  transaction_id text,
  date           timestamptz not null default now()
);
create index if not exists idx_payments_email  on payments (email);
create index if not exists idx_payments_statut on payments (statut);

-- ── 3. TÉMOIGNAGES ───────────────────────────────────────────
create table if not exists testimonials (
  id      bigint generated always as identity primary key,
  nom     text not null,
  pays    text,
  texte   text not null,
  statut  text not null default 'pending'
          check (statut in ('pending', 'approved', 'refused')),
  date    timestamptz not null default now()
);
create index if not exists idx_testimonials_statut on testimonials (statut);

-- ── 4. RESSOURCES (bibliothèques) ────────────────────────────
-- NOTE : "desc" est un mot réservé SQL → renommé en "description"
create table if not exists resources (
  id          text primary key,
  nom         text not null,
  description text,
  lien        text,
  updated_at  timestamptz not null default now()
);

-- ── 5. TARIFICATION ──────────────────────────────────────────
create table if not exists pricing (
  id            integer primary key default 1,
  prix_normal   integer not null default 1500,
  promo_active  boolean not null default false,
  prix_promo    integer not null default 1500,
  badge_promo   text default 'PROMO',
  updated_at    timestamptz not null default now(),
  constraint single_row check (id = 1)
);
insert into pricing (id, prix_normal, promo_active, prix_promo, badge_promo)
values (1, 1500, false, 1500, 'PROMO')
on conflict (id) do nothing;

-- ── 6. CAPTURES (preuves de paiement) ────────────────────────
create table if not exists captures (
  id        bigint generated always as identity primary key,
  email     text,
  prenom    text,
  nom       text,
  image_url text,
  statut    text not null default 'pending'
            check (statut in ('pending', 'published', 'refused')),
  date      timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════
--  SÉCURITÉ (Row Level Security) — désactivée pour l'instant
--  À activer une fois l'auth Supabase branchée.
-- ════════════════════════════════════════════════════════════
-- alter table users        enable row level security;
-- alter table payments     enable row level security;
-- alter table testimonials enable row level security;
-- alter table resources    enable row level security;
-- alter table pricing      enable row level security;
-- alter table captures     enable row level security;
