/* ════════════════════════════════════════════════════════════
   NOUVORA LABS — Client Genius Pay (préparation)
   ────────────────────────────────────────────────────────────
   Ce fichier centralise l'intégration du paiement.
   Tant que GENIUS_PAY_MERCHANT_ID n'est pas renseigné, le site
   reste en mode SIMULATION (paiement automatiquement validé
   après 1,5s, comme avant) — aucun argent n'est demandé.

   POUR ACTIVER GENIUS PAY :
   1. Créer un compte marchand sur Genius Pay
   2. Récupérer le Merchant ID / clé API publique
   3. Renseigner GENIUS_PAY_MERCHANT_ID ci-dessous
   4. Décommenter le chargement du SDK dans le <head> de
      index.html :
        <script src="https://cdn.geniuspay.io/v1/checkout.js"></script>
   5. Inclure ce fichier après config et avant le script de
      tunnel d'inscription :
        <script src="assets/js/geniuspay-client.js"></script>
   ════════════════════════════════════════════════════════════ */

const GENIUS_PAY_MERCHANT_ID = '';   // ← remplacer par votre Merchant ID réel
const GENIUS_PAY_CURRENCY    = 'XOF';

function isGeniusPayReady() {
  return !!GENIUS_PAY_MERCHANT_ID && typeof window.GeniusPay !== 'undefined';
}

/**
 * Lance le paiement.
 * @param {number}   amount    Montant en FCFA (issu de getActivePrice())
 * @param {object}   customer  { prenom, nom, email }
 * @param {function} onSuccess Callback appelé si le paiement réussit
 * @param {function} onError   Callback appelé si le paiement échoue
 */
function startGeniusPayment(amount, customer, onSuccess, onError) {

  if (isGeniusPayReady()) {
    /* ── Mode réel ── */
    window.GeniusPay.init({
      merchantId: GENIUS_PAY_MERCHANT_ID,
      amount:     amount,
      currency:   GENIUS_PAY_CURRENCY,
      customer:   customer,
      onSuccess:  (result) => {
        console.log('[GeniusPay] Paiement validé :', result);
        onSuccess(result);
      },
      onFailure: (err) => {
        console.error('[GeniusPay] Paiement échoué :', err);
        if (onError) onError(err);
      },
    });
    return;
  }

  /* ── Mode simulation (Genius Pay non encore connecté) ── */
  console.warn('[GeniusPay] Mode simulation — renseignez GENIUS_PAY_MERCHANT_ID pour activer les vrais paiements.');
  console.log('[GeniusPay] Montant simulé :', amount, GENIUS_PAY_CURRENCY);
  setTimeout(() => {
    onSuccess({ transactionId: 'SIMULATION_' + Date.now(), status: 'success', simulated: true });
  }, 1500);
}
