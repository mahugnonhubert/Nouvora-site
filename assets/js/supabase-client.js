/* ════════════════════════════════════════════════════════════
   NOUVORA LABS — Client Supabase (préparation)
   ────────────────────────────────────────────────────────────
   Ce fichier n'est PAS chargé par défaut dans index.html /
   app.html / admin.html. Le site continue de fonctionner avec
   localStorage tant que ce fichier n'est pas branché.

   POUR ACTIVER SUPABASE :
   1. Créer un projet sur https://supabase.com
   2. Exécuter supabase/schema.sql dans l'éditeur SQL
   3. Renseigner SUPABASE_URL et SUPABASE_ANON_KEY ci-dessous
   4. Ajouter dans le <head> de index.html / app.html / admin.html :
        <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
        <script src="assets/js/supabase-client.js"></script>
   5. Remplacer les appels localStorage par les fonctions de ce
      fichier (mêmes noms, même forme de données retournée)
   ════════════════════════════════════════════════════════════ */

const SUPABASE_URL      = 'https://wylekbhumvnyoronwuwf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jPImGCmPHOAaktC1gILm0A_HLMca26X';

let supabase = null;
if (typeof window !== 'undefined' && window.supabase && SUPABASE_URL.includes('supabase.co')) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function isSupabaseReady() {
  return supabase !== null && !SUPABASE_URL.includes('VOTRE-PROJET');
}

/* ── UTILISATEURS ─────────────────────────────────────────── */

async function getUsers() {
  if (!isSupabaseReady()) return [];
  const { data, error } = await supabase.from('users').select('*').order('date', { ascending: false });
  if (error) { console.error('[Supabase] getUsers:', error); return []; }
  return data;
}

/* Note : la création d'utilisateurs se fait désormais exclusivement
   via supabase.auth.signUp() (voir index.html, fonction onPaymentSuccess)
   — il n'existe plus de fonction saveUser() qui insère directement
   dans la table users, puisque celle-ci ne contient plus de mot de
   passe et que sa clé primaire est liée à auth.users. */

async function changeUserRole(id, statut) {
  if (!isSupabaseReady()) return null;
  const { data, error } = await supabase.from('users').update({ statut }).eq('id', id).select().single();
  if (error) { console.error('[Supabase] changeUserRole:', error); return null; }
  return data;
}

/* ── PAIEMENTS ────────────────────────────────────────────── */

async function getPayments() {
  if (!isSupabaseReady()) return [];
  const { data, error } = await supabase.from('payments').select('*').order('date', { ascending: false });
  if (error) { console.error('[Supabase] getPayments:', error); return []; }
  return data;
}

async function savePayment(payment) {
  if (!isSupabaseReady()) return null;
  const { data, error } = await supabase.from('payments').insert(payment).select().single();
  if (error) { console.error('[Supabase] savePayment:', error); return null; }
  return data;
}

/* ── TÉMOIGNAGES ──────────────────────────────────────────── */

async function getTestimonials() {
  if (!isSupabaseReady()) return [];
  const { data, error } = await supabase.from('testimonials').select('*').order('date', { ascending: false });
  if (error) { console.error('[Supabase] getTestimonials:', error); return []; }
  return data;
}

async function getApprovedTestimonials() {
  if (!isSupabaseReady()) return [];
  const { data, error } = await supabase.from('testimonials').select('*').eq('statut', 'approved').order('date', { ascending: false });
  if (error) { console.error('[Supabase] getApprovedTestimonials:', error); return []; }
  return data;
}

async function submitTestimonialToSupabase(nom, pays, texte) {
  if (!isSupabaseReady()) return null;
  const { data, error } = await supabase.from('testimonials').insert({ nom, pays, texte, statut: 'pending' }).select().single();
  if (error) { console.error('[Supabase] submitTestimonial:', error); return null; }
  return data;
}

async function moderateTestimonial(id, statut) {
  if (!isSupabaseReady()) return null;
  const { data, error } = await supabase.from('testimonials').update({ statut }).eq('id', id).select().single();
  if (error) { console.error('[Supabase] moderateTestimonial:', error); return null; }
  return data;
}

/* ── RESSOURCES ───────────────────────────────────────────── */

async function getResources() {
  if (!isSupabaseReady()) return [];
  const { data, error } = await supabase.from('resources').select('*');
  if (error) { console.error('[Supabase] getResources:', error); return []; }
  return data;
}

async function saveResource(resource) {
  if (!isSupabaseReady()) return null;
  const { data, error } = await supabase.from('resources').upsert(resource).select().single();
  if (error) { console.error('[Supabase] saveResource:', error); return null; }
  return data;
}

/* ── TARIFICATION ─────────────────────────────────────────── */

async function getPricingFromSupabase() {
  if (!isSupabaseReady()) return { prixNormal: 2000, promoActive: false, prixPromo: 2000, badgePromo: 'PROMO' };
  const { data, error } = await supabase.from('pricing').select('*').eq('id', 1).single();
  if (error) { console.error('[Supabase] getPricing:', error); return { prixNormal: 2000, promoActive: false, prixPromo: 2000, badgePromo: 'PROMO' }; }
  return {
    prixNormal:  data.prix_normal,
    promoActive: data.promo_active,
    prixPromo:   data.prix_promo,
    badgePromo:  data.badge_promo,
  };
}

async function savePricingToSupabase(pricing) {
  if (!isSupabaseReady()) return null;
  const { data, error } = await supabase.from('pricing').update({
    prix_normal:  pricing.prixNormal,
    promo_active: pricing.promoActive,
    prix_promo:   pricing.prixPromo,
    badge_promo:  pricing.badgePromo,
    updated_at:   new Date().toISOString(),
  }).eq('id', 1).select().single();
  if (error) { console.error('[Supabase] savePricing:', error); return null; }
  return data;
}

/* ════════════════════════════════════════════════════════════
   NOTE DE MIGRATION
   ────────────────────────────────────────────────────────────
   Les fonctions ci-dessus sont volontairement nommées de façon
   proche des fonctions localStorage déjà présentes dans
   index.html / admin.html (getUsers, getPricing, getResources,
   getTestimonials...) afin de faciliter le remplacement :
   il suffira de remplacer les appels synchrones existants par
   leurs équivalents asynchrones (await) ci-dessus.
   ════════════════════════════════════════════════════════════ */
