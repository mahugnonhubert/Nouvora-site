-- ════════════════════════════════════════════════════════════
--  NOUVORA LABS — Schéma Supabase (v2 — Auth réelle)
--
--  Ce schéma utilise désormais le vrai système d'authentification
--  Supabase (auth.users) au lieu de gérer les mots de passe
--  manuellement. Conséquences concrètes :
--    • Les mots de passe sont hashés et gérés en sécurité par
--      Supabase — ce projet ne les manipule plus jamais en clair.
--    • RLS (Row Level Security) peut enfin distinguer "votre"
--      profil de celui d'un autre utilisateur, via auth.uid().
--    • Le champ "statut" (visiteur/premium/admin) ne peut plus
--      être modifié directement par l'utilisateur lui-même —
--      seule la fonction claim_premium() le peut, après avoir
--      vérifié qu'un paiement validé existe réellement.
--
--  ⚠️ Limite encore présente (à traiter plus tard) :
--  Le paiement lui-même (table "payments") est encore inséré
--  par le navigateur du client, pas par un webhook serveur
--  Genius Pay vérifié. Tant que Genius Pay reste en simulation,
--  ce n'est pas un risque financier réel. À sécuriser via une
--  Edge Function + webhook le jour où Genius Pay sera connecté
--  pour de vrai.
--
--  Pour l'activer :
--    1. Aller dans l'éditeur SQL du projet Supabase
--    2. Coller et exécuter ce fichier intégralement
--       (remplace l'ancien schéma — voir section MIGRATION
--       en bas si une ancienne version existait déjà)
--    3. Vérifier que assets/js/supabase-client.js contient
--       bien l'URL + clé anonyme du projet
-- ════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── 1. PROFILS UTILISATEURS ──────────────────────────────────
-- Lié 1:1 à auth.users (id identique). Ne contient plus aucun
-- mot de passe — Supabase Auth s'en occupe dans auth.users.
create table if not exists users (
  id          uuid primary key references auth.users(id) on delete cascade,
  nom         text not null default '',
  prenom      text not null default '',
  email       text not null,
  statut      text not null default 'visiteur'
              check (statut in ('visiteur', 'premium', 'admin')),
  date        timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index if not exists idx_users_email  on users (email);
create index if not exists idx_users_statut on users (statut);

-- Création automatique du profil à l'inscription (auth.users → users)
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, nom, prenom, email, statut)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nom', ''),
    coalesce(new.raw_user_meta_data->>'prenom', ''),
    new.email,
    'visiteur'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Empêche un utilisateur de changer lui-même son propre "statut"
-- (auto-promotion). N'affecte PAS un admin qui modifie le compte
-- d'un AUTRE utilisateur depuis la page d'administration —
-- seul le cas "je modifie ma propre ligne" est concerné ici.
create or replace function prevent_statut_self_update()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.statut is distinct from old.statut
     and auth.uid() = old.id
     and current_setting('app.allow_statut_change', true) is distinct from 'on' then
    new.statut := old.statut; -- changement ignoré silencieusement
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_statut_self_update on users;
create trigger trg_prevent_statut_self_update
  before update on users
  for each row execute function prevent_statut_self_update();

-- Vérifie si l'utilisateur courant est admin (utilisé dans les policies RLS)
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists(select 1 from users where id = auth.uid() and statut = 'admin');
$$;

-- ── 2. PAIEMENTS ─────────────────────────────────────────────
create table if not exists payments (
  id              bigint generated always as identity primary key,
  user_id         uuid references users(id) on delete set null,
  nom             text,
  email           text,
  montant         integer not null default 0,      -- en FCFA
  devise          text not null default 'XOF',
  statut          text not null default 'en attente'
                  check (statut in ('en attente', 'validé', 'échoué')),
  methode         text default 'Genius Pay',
  transaction_id  text,                            -- ID retourné par Genius Pay
  consumed        boolean not null default false,  -- déjà utilisé pour activer le Premium ?
  date            timestamptz not null default now()
);

create index if not exists idx_payments_email  on payments (email);
create index if not exists idx_payments_statut on payments (statut);
create index if not exists idx_payments_user   on payments (user_id);

-- Active le Premium pour l'utilisateur connecté, UNIQUEMENT si un
-- paiement validé et pas encore consommé lui appartient réellement.
create or replace function claim_premium(p_payment_id bigint)
returns boolean
language plpgsql
security definer
as $$
declare
  v_found boolean;
begin
  update payments
     set consumed = true
   where id = p_payment_id
     and user_id = auth.uid()
     and statut = 'validé'
     and consumed = false;

  v_found := found;

  if not v_found then
    return false;
  end if;

  perform set_config('app.allow_statut_change', 'on', true);
  update users set statut = 'premium' where id = auth.uid();
  perform set_config('app.allow_statut_change', 'off', true);

  return true;
end;
$$;

-- ── 3. TÉMOIGNAGES ───────────────────────────────────────────
create table if not exists testimonials (
  id          bigint generated always as identity primary key,
  nom         text not null,
  pays        text,
  texte       text not null,
  statut      text not null default 'pending'
              check (statut in ('pending', 'approved', 'refused')),
  date        timestamptz not null default now()
);

create index if not exists idx_testimonials_statut on testimonials (statut);

-- ── 4. RESSOURCES (bibliothèques) ───────────────────────────
create table if not exists resources (
  id          text primary key,        -- ex: 'mega', 'kit', 'idees500'
  nom         text not null,
  desc        text,
  lien        text,                     -- lien Google Drive
  updated_at  timestamptz not null default now()
);

-- ── 5. TARIFICATION ──────────────────────────────────────────
create table if not exists pricing (
  id            integer primary key default 1,
  prix_normal   integer not null default 2000,
  promo_active  boolean not null default false,
  prix_promo    integer not null default 2000,
  badge_promo   text default 'PROMO',
  updated_at    timestamptz not null default now(),
  constraint single_row check (id = 1)
);

insert into pricing (id, prix_normal, promo_active, prix_promo, badge_promo)
values (1, 2000, false, 2000, 'PROMO')
on conflict (id) do nothing;

-- ── 6. CAPTURES (preuves de paiement uploadées) ─────────────
create table if not exists captures (
  id          bigint generated always as identity primary key,
  email       text,
  prenom      text,
  nom         text,
  image_url   text,
  statut      text not null default 'pending'
              check (statut in ('pending', 'published', 'refused')),
  date        timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════
--  SÉCURITÉ (Row Level Security) — ACTIVÉE
-- ════════════════════════════════════════════════════════════

alter table users        enable row level security;
alter table payments     enable row level security;
alter table testimonials enable row level security;
alter table resources    enable row level security;
alter table pricing      enable row level security;
alter table captures     enable row level security;

-- ── users ──
create policy "Voir son propre profil ou être admin"
  on users for select
  using (auth.uid() = id or is_admin());

create policy "Modifier son propre profil ou être admin"
  on users for update
  using (auth.uid() = id or is_admin())
  with check (auth.uid() = id or is_admin());
-- Note : le changement du champ "statut" est filtré par le trigger
-- trg_prevent_statut_self_update ci-dessus, pas par cette policy.

-- Pas de policy INSERT : la création du profil se fait uniquement
-- via le trigger handle_new_user() (sécurisé, déclenché par Auth).

-- ── payments ──
create policy "Voir ses propres paiements ou être admin"
  on payments for select
  using (auth.uid() = user_id or is_admin());

create policy "Créer un paiement pour soi-même"
  on payments for insert
  with check (auth.uid() = user_id);

create policy "Seul l'admin modifie les paiements directement"
  on payments for update
  using (is_admin());
-- Note : claim_premium() modifie aussi "consumed" mais en passant par
-- security definer, donc bypass cette policy (comportement voulu).

-- ── testimonials ──
create policy "Lecture publique des témoignages approuvés"
  on testimonials for select
  using (statut = 'approved' or is_admin());

create policy "Tout le monde peut soumettre un témoignage"
  on testimonials for insert
  with check (statut = 'pending');

create policy "Seul l'admin modère les témoignages"
  on testimonials for update
  using (is_admin());

-- ── resources ──
create policy "Lecture publique des ressources"
  on resources for select
  using (true);

create policy "Seul l'admin modifie les ressources"
  on resources for all
  using (is_admin())
  with check (is_admin());

-- ── pricing ──
create policy "Lecture publique du prix"
  on pricing for select
  using (true);

create policy "Seul l'admin modifie le prix"
  on pricing for update
  using (is_admin())
  with check (is_admin());

-- ── captures ──
create policy "Lecture publique des captures publiées"
  on captures for select
  using (statut = 'published' or is_admin());

create policy "Tout le monde peut soumettre une capture"
  on captures for insert
  with check (statut = 'pending');

create policy "Seul l'admin modère les captures"
  on captures for update
  using (is_admin());

-- ════════════════════════════════════════════════════════════
--  MIGRATION — si l'ancien schéma (v1, avec mot de passe en
--  clair et id bigint) existait déjà dans ce projet Supabase :
--
--  1. Exporter/vérifier qu'aucune donnée réelle n'est à conserver
--     (normal à ce stade : Genius Pay encore en simulation).
--  2. Exécuter au préalable :
--       drop table if exists users cascade;
--       drop table if exists payments cascade;
--     puis relancer ce fichier en entier.
-- ════════════════════════════════════════════════════════════
