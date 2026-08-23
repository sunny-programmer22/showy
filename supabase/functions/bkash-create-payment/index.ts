// Supabase Edge Function: bkash-create-payment
// Creates a bKash Tokenized Checkout payment and returns { bkashURL, paymentID }.
//
// Deploy:
//   supabase functions deploy bkash-create-payment --project-ref <ref>
// Secrets (set once via `supabase secrets set`):
//   BKASH_APP_KEY, BKASH_APP_SECRET, BKASH_USERNAME, BKASH_PASSWORD
//   BKASH_MODE = "sandbox" | "live"
//   SITE_URL   = https://showy.jubair.bond

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

interface TokenCache {
  id_token: string;
  expires_at: number;
}
let tokenCache: TokenCache | null = null;

const BASE =
  (Deno.env.get('BKASH_MODE') ?? 'sandbox') === 'live'
    ? 'https://tokenized.pay.bka.sh/v1.2.0-beta'
    : 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';

async function grantToken(): Promise<string> {
  if (tokenCache && tokenCache.expires_at > Date.now() + 30_000) return tokenCache.id_token;

  const res = await fetch(`${BASE}/tokenized/checkout/token/grant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      username: Deno.env.get('BKASH_USERNAME')!,
      password: Deno.env.get('BKASH_PASSWORD')!,
    },
    body: JSON.stringify({
      app_key: Deno.env.get('BKASH_APP_KEY')!,
      app_secret: Deno.env.get('BKASH_APP_SECRET')!,
    }),
  });
  const data = await res.json();
  if (!data.id_token) throw new Error(data.statusMessage || 'bKash token grant failed');
  tokenCache = { id_token: data.id_token, expires_at: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return tokenCache.id_token;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { amount, phone } = await req.json();
    if (!amount || Number(amount) <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), { status: 400, headers: CORS });
    }

    const token = await grantToken();
    const siteUrl = Deno.env.get('SITE_URL') ?? 'https://showy.jubair.bond';

    const res = await fetch(`${BASE}/tokenized/checkout/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
        'X-App-Key': Deno.env.get('BKASH_APP_KEY')!,
      },
      body: JSON.stringify({
        mode: '0011',
        payerReference: phone ?? 'guest',
        callbackURL: `${siteUrl}/bkash/callback`,
        redirectURL: `${siteUrl}/order-confirmation`,
        amount: String(amount),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: `SHW${Date.now().toString(36).toUpperCase()}`,
      }),
    });
    const data = await res.json();
    if (!data.bkashURL || !data.paymentID) {
      return new Response(JSON.stringify({ error: data.statusMessage || 'Payment create failed' }), {
        status: 502,
        headers: CORS,
      });
    }
    return new Response(JSON.stringify({ bkashURL: data.bkashURL, paymentID: data.paymentID }), {
      headers: CORS,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: CORS });
  }
});
