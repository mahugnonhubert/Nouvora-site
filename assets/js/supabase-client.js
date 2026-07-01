/* ════════════════════════════════════════════════════════════
   NOUVORA LABS — Client Supabase
   ════════════════════════════════════════════════════════════ */

const SUPABASE_URL      = 'https://wylekbhumvnyoronwuwf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5bGVrYmh1bXZueW9yb253dXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0Nzc4NTgsImV4cCI6MjA5ODA1Mzg1OH0.rNAOAoeyCYBCUTU561AcnOkTRqe6iE7nUUw5WnD8K-Y';

/* Client exposé sur window pour être accessible depuis toutes les pages */
window._sbClient = null;

function _initSupabase() {
  if (window._sbClient) return;
  try {
    const lib = window.supabase;
    if (lib && typeof lib.createClient === 'function') {
      window._sbClient = lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  } catch(e) {
    console.error('[Nouvora] Erreur init Supabase:', e);
  }
}

_initSupabase();

/* Accessible depuis toutes les pages via isSupabaseReady() */
function isSupabaseReady() {
  if (!window._sbClient) _initSupabase();
  return window._sbClient !== null;
}

/* Raccourci global */
function getDb() {
  if (!window._sbClient) _initSupabase();
  return window._sbClient;
}

/* ── UTILISATEURS ──────────────────────────────────────────── */
async function getUsers() {
  if (!isSupabaseReady()) return [];
  const { data, error } = await getDb().from('users').select('*').order('date', { ascending: false });
  if (error) { console.error('[Supabase] getUsers:', error); return []; }
  return data || [];
}

async function changeUserRole(id, statut) {
  if (!isSupabaseReady()) return null;
  const { data, error } = await getDb().from('users').update({ statut }).eq('id', id).select().single();
  if (error) { console.error('[Supabase] changeUserRole:', error); return null; }
  return data;
}

/* ── PAIEMENTS ─────────────────────────────────────────────── */
async function getPayments() {
  if (!isSupabaseReady()) return [];
  const { data, error } = await getDb().from('payments').select('*').order('date', { ascending: false });
  if (error) { console.error('[Supabase] getPayments:', error); return []; }
  return data || [];
}

async function savePayment(payment) {
  if (!isSupabaseReady()) return null;
  const { data, error } = await getDb().from('payments').insert(payment).select().single();
  if (error) { console.error('[Supabase] savePayment:', error); return null; }
  return data;
}

/* ── TÉMOIGNAGES ───────────────────────────────────────────── */
async function getTestimonials() {
  if (!isSupabaseReady()) return [];
  const { data, error } = await getDb().from('testimonials').select('*').order('date', { ascending: false });
  if (error) { console.error('[Supabase] getTestimonials:', error); return []; }
  return data || [];
}

async function getApprovedTestimonials() {
  if (!isSupabaseReady()) return [];
  const { data, error } = await getDb().from('testimonials').select('*').eq('statut', 'approved').order('date', { ascending: false });
  if (error) { console.error('[Supabase] getApprovedTestimonials:', error); return []; }
  return data || [];
}

async function submitTestimonialToSupabase(nom, pays, texte) {
  if (!isSupabaseReady()) return null;
  const { data, error } = await getDb().from('testimonials').insert({ nom, pays, texte, statut: 'pending' }).select().single();
  if (error) { console.error('[Supabase] submitTestimonial:', error); return null; }
  return data;
}

async function updateTestimonialStatus(id, statut) {
  if (!isSupabaseReady()) return null;
  const { data, error } = await getDb().from('testimonials').update({ statut }).eq('id', id).select().single();
  if (error) { console.error('[Supabase] updateTestimonialStatus:', error); return null; }
  return data;
}

async function deleteTestimonial(id) {
  if (!isSupabaseReady()) return false;
  const { error } = await getDb().from('testimonials').delete().eq('id', id);
  if (error) { console.error('[Supabase] deleteTestimonial:', error); return false; }
  return true;
}

/* ── RESSOURCES ────────────────────────────────────────────── */
async function getResources() {
  if (!isSupabaseReady()) return [];
  const { data, error } = await getDb().from('resources').select('*');
  if (error) { console.error('[Supabase] getResources:', error); return []; }
  return data || [];
}

async function saveResources(resources) {
  if (!isSupabaseReady()) return;
  for (const res of resources) {
    await getDb().from('resources').upsert({
      id: String(res.id || res.num),
      nom: res.nom,
      description: res.description || res.desc || '',
      lien: res.lien
    });
  }
}

/* ── TARIFICATION ──────────────────────────────────────────── */
async function getPricingFromDB() {
  if (!isSupabaseReady()) return null;
  const { data, error } = await getDb().from('pricing').select('*').eq('id', 1).single();
  if (error) { console.error('[Supabase] getPricing:', error); return null; }
  if (data) return { prixNormal: data.prix_normal, promoActive: data.promo_active, prixPromo: data.prix_promo, badgePromo: data.badge_promo };
  return null;
}

async function savePricingToDB(p) {
  if (!isSupabaseReady()) return;
  await getDb().from('pricing').update({
    prix_normal: p.prixNormal, promo_active: p.promoActive,
    prix_promo: p.prixPromo, badge_promo: p.badgePromo,
    updated_at: new Date().toISOString()
  }).eq('id', 1);
}

/* ── CAPTURES ──────────────────────────────────────────────── */
async function getCaptures() {
  if (!isSupabaseReady()) return [];
  const { data, error } = await getDb().from('captures').select('*').order('date', { ascending: false });
  if (error) { console.error('[Supabase] getCaptures:', error); return []; }
  return data || [];
}

async function updateCaptureStatus(id, statut) {
  if (!isSupabaseReady()) return null;
  const { data, error } = await getDb().from('captures').update({ statut }).eq('id', id).select().single();
  if (error) { console.error('[Supabase] updateCaptureStatus:', error); return null; }
  return data;
}
