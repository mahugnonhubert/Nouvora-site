// ════════════════════════════════════════════════════════════
// NOUVORA LABS — Edge Function : chariow-webhook
// ────────────────────────────────────────────────────────────
// Rôle : recevoir la notification ("Pulse") envoyée par Chariow
// quand une vente est confirmée, puis activer automatiquement
// le compte Premium correspondant dans public.users.
//
// À configurer côté Chariow (Dashboard → Paramètres → Pulses
// / Webhooks) :
//   URL à appeler : https://<ton-projet>.supabase.co/functions/v1/chariow-webhook
//   Événement     : vente confirmée / sale.completed
//
// Secret à configurer AVANT de déployer (si Chariow fournit un
// "signing secret" lors de la création du Pulse — copie-le ici) :
//   supabase secrets set CHARIOW_WEBHOOK_SECRET=whsec_xxxxxxxx
//
// ⚠️ À VÉRIFIER : le nom exact du header de signature envoyé par
// Chariow (ex. "X-Chariow-Signature") et le nom exact de
// l'événement dans le payload. Regarde le payload brut reçu
// dans les logs (Dashboard → Edge Functions → Logs) lors de ta
// première vente test, et ajuste EVENT_NAMES / la vérification
// de signature ci-dessous si besoin.
// ════════════════════════════════════════════════════════════

import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const CHARIOW_WEBHOOK_SECRET = Deno.env.get('CHARIOW_WEBHOOK_SECRET');

// Noms d'événement acceptés (au cas où Chariow utilise un libellé différent)
const EVENT_NAMES_OK = ['sale.completed', 'order.completed', 'payment.completed'];

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function verifySignature(rawBody, signatureHeader) {
  if (!CHARIOW_WEBHOOK_SECRET) {
    console.warn('[chariow-webhook] CHARIOW_WEBHOOK_SECRET non configuré — vérification de signature ignorée (à faire avant la mise en prod réelle).');
    return true;
  }
  if (!signatureHeader) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(CHARIOW_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody));
  const computed = Array.from(new Uint8Array(sigBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

  return computed === signatureHeader.replace(/^sha256=/, '');
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const rawBody = await req.text();
  const signatureHeader = req.headers.get('x-chariow-signature') || req.headers.get('x-signature');

  const isValid = await verifySignature(rawBody, signatureHeader);
  if (!isValid) {
    console.error('[chariow-webhook] Signature invalide — requête rejetée.');
    return new Response('Invalid signature', { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  console.log('[chariow-webhook] Payload reçu :', JSON.stringify(payload));

  const eventName = payload.event || payload.type;
  if (!EVENT_NAMES_OK.includes(eventName)) {
    // On répond 200 pour ne pas faire retenter Chariow sur des événements qu'on ignore volontairement.
    console.log('[chariow-webhook] Événement ignoré :', eventName);
    return new Response(JSON.stringify({ received: true, ignored: true }), { status: 200 });
  }

  const data = payload.data || payload;
  const customer = data.customer || {};
  const email = (customer.email || data.email || '').toLowerCase().trim();
  const montant = data.amount || data.sale?.amount || data.product?.price || 1500;
  const transactionId = data.sale?.id || data.id || null;

  if (!email) {
    console.error('[chariow-webhook] Aucun email trouvé dans le payload.');
    return new Response(JSON.stringify({ received: true, error: 'no email in payload' }), { status: 200 });
  }

  try {
    /* 1. Retrouver le compte utilisateur */
    const { data: userRow, error: userErr } = await sb
      .from('users')
      .select('id, nom, prenom, statut')
      .eq('email', email)
      .single();

    if (userErr || !userRow) {
      console.error('[chariow-webhook] Aucun compte trouvé pour', email, userErr);
      return new Response(JSON.stringify({ received: true, error: 'user not found' }), { status: 200 });
    }

    /* 2. Enregistrer le paiement (évite les doublons si le webhook est renvoyé) */
    if (transactionId) {
      const { data: existing } = await sb
        .from('payments')
        .select('id')
        .eq('transaction_id', transactionId)
        .maybeSingle();
      if (existing) {
        console.log('[chariow-webhook] Paiement déjà traité, on ignore.');
        return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
      }
    }

    await sb.from('payments').insert({
      user_id: userRow.id,
      nom: `${userRow.prenom || ''} ${userRow.nom || ''}`.trim(),
      email,
      montant,
      statut: 'validé',
      methode: 'Chariow',
      transaction_id: transactionId,
    });

    /* 3. Activer le Premium */
    await sb.from('users').update({ statut: 'premium' }).eq('id', userRow.id);

    console.log('[chariow-webhook] Compte activé en Premium :', email);
    return new Response(JSON.stringify({ received: true, activated: true }), { status: 200 });

  } catch (err) {
    console.error('[chariow-webhook] Erreur inattendue :', err);
    return new Response(JSON.stringify({ received: true, error: String(err?.message || err) }), { status: 500 });
  }
});
