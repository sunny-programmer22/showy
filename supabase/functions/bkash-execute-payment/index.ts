// Supabase Edge Function: bkash-execute-payment
// Executes a completed bKash checkout and returns { trxID, status }.
//
// Deploy:
//   supabase functions deploy bkash-execute-payment --project-ref <ref>
// Secrets: same as bkash-create-payment.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

const BASE =
  (Deno.env.get('BKASH_MODE') ?? 'sandbox') === 'live'
    ? 'https://tokenized.pay.bka.sh/v1.2.0-beta'
    : 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';

async function grantToken(): Promise<string> {
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
  return data.id_token;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { paymentID } = await req.json();
    if (!paymentID) {
      return new Response(JSON.stringify({ error: 'paymentID required' }), { status: 400, headers: CORS });
    }

    const token = await grantToken();
    const exec = await fetch(`${BASE}/tokenized/checkout/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
        'X-App-Key': Deno.env.get('BKASH_APP_KEY')!,
      },
      body: JSON.stringify({ paymentID }),
    });
    const data = await exec.json();

    if (data.transactionStatus === 'Completed' && data.trxID) {
      return new Response(JSON.stringify({ status: 'success', trxID: data.trxID }), { headers: CORS });
    }
    return new Response(
      JSON.stringify({ status: 'failed', error: data.statusMessage || 'Payment not completed' }),
      { headers: CORS }
    );
  } catch (e) {
    return new Response(JSON.stringify({ status: 'failed', error: (e as Error).message }), {
      status: 500,
      headers: CORS,
    });
  }
});
