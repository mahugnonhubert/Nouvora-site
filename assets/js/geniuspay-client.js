/* ════════════════════════════════════════════════════════════
   NOUVORA LABS — Client Genius Pay
   ────────────────────────────────────────────────────────────
   IMPORTANT : Genius Pay n'a pas de SDK JavaScript côté client.
   La création d'un paiement exige la clé SECRÈTE, qui ne doit
   JAMAIS apparaître dans ce fichier (visible par tout visiteur
   via "Voir le code source").

   Le flux réel est donc :
   1. Le navigateur appelle notre Supabase Edge Function
      "create-genius-payment" (elle seule connaît la clé secrète,
      stockée en tant que secret Supabase côté serveur)
   2. Cette fonction appelle Genius Pay et récupère une checkout_url
   3. On redirige le client vers cette checkout_url pour qu'il paie
      sur la page hébergée par Genius Pay (Wave/Orange/MTN/carte)

   Tant que GENIUS_PAY_MERCHANT_ID est vide OU que la Edge Function
   n'est pas déployée/accessible, le site reste en mode SIMULATION
   (paiement automatiquement validé après 1,5s) — aucun argent
   n'est demandé.

   ⚠️ NON CONFIRMÉ : le comportement exact de la redirection retour
   (le client revient-il automatiquement sur Nouvora Labs après
   paiement ?) n'est pas documenté publiquement pour ton compte.
   À vérifier avec le support Genius Pay.
   ════════════════════════════════════════════════════════════ */

const GENIUS_PAY_MERCHANT_ID = 'GPAY-V7SI';   // Code Public Genius Pay (Nouvora Labs)
const GENIUS_PAY_CURRENCY    = 'XOF';

/* ⚠️ Mettre à `true` UNIQUEMENT une fois la Edge Function déployée
   (supabase functions deploy create-genius-payment) ET les secrets
   GENIUS_API_KEY / GENIUS_API_SECRET configurés côté Supabase.
   Tant que c'est `false`, le site reste en mode simulation, même
   si GENIUS_PAY_MERCHANT_ID est rempli — ça évite que de vrais
   visiteurs tombent sur une erreur pendant que tu prépares tout. */
const GENIUS_PAY_LIVE_MODE = false;

/* URL de la Edge Function — réutilise SUPABASE_URL défini dans supabase-client.js */
function _geniusEdgeFunctionUrl() {
  if (typeof SUPABASE_URL === 'undefined' || !SUPABASE_URL) return null;
  return `${SUPABASE_URL}/functions/v1/create-genius-payment`;
}

function isGeniusPayReady() {
  return GENIUS_PAY_LIVE_MODE && !!GENIUS_PAY_MERCHANT_ID && !!_geniusEdgeFunctionUrl();
}

/**
 * Lance le paiement.
 * @param {number}   amount    Montant en FCFA (issu de getActivePrice())
 * @param {object}   customer  { prenom, nom, email }
 * @param {function} onSuccess Callback appelé si le paiement réussit (mode simulation uniquement —
 *                              en mode réel, le client quitte la page pour payer, voir onError)
 * @param {function} onError   Callback appelé si la création du paiement échoue
 */
async function startGeniusPayment(amount, customer, onSuccess, onError) {

  if (isGeniusPayReady()) {
    /* ── Mode réel : on demande une checkout_url à notre Edge Function ── */
    try {
      const res = await fetch(_geniusEdgeFunctionUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          amount,
          description: 'Achat Nouvora Labs',
          customer,
          metadata: { source: 'nouvora-labs-site' },
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.checkout_url) {
        console.error('[GeniusPay] Échec de création du paiement :', data);
        if (onError) onError(data.error || 'Erreur lors de la création du paiement');
        return;
      }

      console.log('[GeniusPay] Redirection vers la page de paiement :', data.reference);
      /* On quitte la page pour rejoindre la page de paiement hébergée par Genius Pay */
      window.location.href = data.checkout_url;

    } catch (err) {
      console.error('[GeniusPay] Erreur réseau lors de la création du paiement :', err);
      if (onError) onError(err);
    }
    return;
  }

  /* ── Mode simulation (Genius Pay / Edge Function non encore connectés) ── */
  console.warn('[GeniusPay] Mode simulation — la Edge Function create-genius-payment n\'est pas accessible.');
  console.log('[GeniusPay] Montant simulé :', amount, GENIUS_PAY_CURRENCY);
  setTimeout(() => {
    onSuccess({ transactionId: 'SIMULATION_' + Date.now(), status: 'success', simulated: true });
  }, 1500);
}
