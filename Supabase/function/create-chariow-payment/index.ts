// ════════════════════════════════════════════════════════════
// NOUVORA LABS — Edge Function : create-chariow-payment
// ────────────────────────────────────────────────────────────
// Rôle : recevoir les infos du client depuis le site, appeler
// l'API Chariow avec la clé SECRÈTE (jamais exposée au
// navigateur), et renvoyer l'URL de paiement hébergée.
//
// Secret à configurer AVANT de déployer :
//   supabase secrets set CHARIOW_API_KEY=sk_live_xxxxxxxx
//   (Dashboard Supabase → Edge Functions → Secrets, si tu
//   préfères le faire depuis le navigateur plutôt qu'en CLI)
//
// ⚠️ À VÉRIFIER avant mise en prod : l'URL exacte de l'API
// Chariow et les noms de champs ci-dessous viennent de la
// documentation publique (chariow.dev/fr/guides/checkout).
// Si Chariow renvoie une erreur, regarde le message dans les
// logs de la fonction (Dashboard → Edge Functions → Logs) et
// ajuste CHARIOW_API_BASE / le corps de la requête en
// conséquence — la doc officielle fait foi.
// ════════════════════════════════════════════════════════════

const CHARIOW_API_BASE = 'https://api.chariow.com/v1';
const SITE_URL = 'https://nouvora-labs.onrender.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { product_id, email, first_name, last_name, phone } = body;

    if (!product_id || !email || !first_name || !last_name || !phone?.number) {
      return new Response(
        JSON.stringify({ success: false, error: 'Champs manquants (product_id, email, first_name, last_name, phone.number requis).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const CHARIOW_API_KEY = Deno.env.get('CHARIOW_API_KEY');
    if (!CHARIOW_API_KEY) {
      console.error('[create-chariow-payment] CHARIOW_API_KEY manquant dans les secrets.');
      return new Response(
        JSON.stringify({ success: false, error: 'Configuration serveur incomplète.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const chariowRes = await fetch(`${CHARIOW_API_BASE}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHARIOW_API_KEY}`,
      },
      body: JSON.stringify({
        product_id,
        email,
        first_name,
        last_name,
        phone: {
          number: phone.number,
          country_code: phone.country_code || '229',
        },
        redirect_url: `${SITE_URL}/app.html?chariow_pending=1`,
      }),
    });

    const chariowData = await chariowRes.json();

    if (!chariowRes.ok) {
      console.error('[create-chariow-payment] Erreur API Chariow :', chariowRes.status, chariowData);
      return new Response(
        JSON.stringify({ success: false, error: chariowData?.message || 'Erreur API Chariow' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Le nom du champ renvoyé par Chariow peut varier (checkout_url / url / data.checkout_url)
    const checkoutUrl = chariowData.checkout_url || chariowData.url || chariowData.data?.checkout_url;

    if (!checkoutUrl) {
      console.error('[create-chariow-payment] Réponse Chariow inattendue :', chariowData);
      return new Response(
        JSON.stringify({ success: false, error: "Impossible de récupérer l'URL de paiement." }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, checkout_url: checkoutUrl }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[create-chariow-payment] Erreur inattendue :', err);
    return new Response(
      JSON.stringify({ success: false, error: String(err?.message || err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
