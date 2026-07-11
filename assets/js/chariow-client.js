/* ════════════════════════════════════════════════════════════
   NOUVORA LABS — Client Chariow (paiement temporaire, en
   attendant que Genius Pay soit branché en réel)
   ────────────────────────────────────────────────────────────
   Comme pour Genius Pay, la clé API SECRÈTE de Chariow
   (sk_live_...) ne doit JAMAIS apparaître ici (visible via
   "Voir le code source"). Le flux réel est donc :

   1. Le navigateur appelle notre Edge Function Supabase
      "create-chariow-payment" (elle seule connaît la clé
      secrète, stockée en secret Supabase côté serveur)
   2. Cette fonction appelle l'API Checkout de Chariow et
      récupère une checkout_url
   3. On redirige le client vers cette checkout_url pour qu'il
      paie sur la page hébergée par Chariow
   4. Chariow notifie notre Edge Function "chariow-webhook"
      (configurée comme "Pulse" côté Chariow) quand la vente
      est confirmée → le compte est automatiquement passé en
      Premium, même si le client ferme l'onglet avant de
      revenir sur le site.
   ════════════════════════════════════════════════════════════ */

const CHARIOW_PRODUCT_ID = 'prd_3koz0rx5'; // Produit "Nouvora Labs" sur Chariow

/* URL de la Edge Function — réutilise SUPABASE_URL défini dans supabase-client.js */
function _chariowEdgeFunctionUrl() {
  if (typeof SUPABASE_URL === 'undefined' || !SUPABASE_URL) return null;
  return `${SUPABASE_URL}/functions/v1/create-chariow-payment`;
}

function isChariowReady() {
  return !!CHARIOW_PRODUCT_ID && !!_chariowEdgeFunctionUrl();
}

/**
 * Lance le paiement via Chariow. Redirige le navigateur vers la
 * page de paiement hébergée — il n'y a donc pas de "onSuccess"
 * ici (le client quitte la page). La confirmation se fait via le
 * webhook côté serveur (voir chariow-webhook).
 *
 * @param {object}   customer  { prenom, nom, email, telephone, indicatif }
 * @param {function} onError   Callback appelé si la création du paiement échoue
 */
async function startChariowPayment(customer, onError) {
  if (!isChariowReady()) {
    console.error('[Chariow] Configuration incomplète (product id ou URL Supabase manquants).');
    if (onError) onError('Paiement indisponible pour le moment. Contactez le support.');
    return;
  }

  try {
    const res = await fetch(_chariowEdgeFunctionUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        product_id: CHARIOW_PRODUCT_ID,
        email: customer.email,
        first_name: customer.prenom,
        last_name: customer.nom,
        phone: {
          number: customer.telephone,
          country_code: customer.indicatif || '229',
        },
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success || !data.checkout_url) {
      console.error('[Chariow] Échec de création du paiement :', data);
      if (onError) onError(data.error || 'Erreur lors de la création du paiement');
      return;
    }

    console.log('[Chariow] Redirection vers la page de paiement…');
    window.location.href = data.checkout_url;

  } catch (err) {
    console.error('[Chariow] Erreur réseau lors de la création du paiement :', err);
    if (onError) onError(err);
  }
}
