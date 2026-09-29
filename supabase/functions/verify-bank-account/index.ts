import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { account_number, bank_code } = await req.json();

    if (!account_number || !bank_code) {
      return new Response(
        JSON.stringify({ error: 'account_number and bank_code are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const flwKey = Deno.env.get('FLUTTERWAVE_SECRET_KEY');
    if (!flwKey) {
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch(
      'https://api.flutterwave.com/v3/accounts/resolve',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${flwKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_number: String(account_number),
          account_bank: String(bank_code),
        }),
      }
    );

    const data = await response.json();

    console.log('Flutterwave response', {
      http_status: response.status,
      ok: response.ok,
      key_prefix: flwKey.substring(0, 10),
      body: data,
    });

    if (!response.ok || data?.status !== 'success' || !data?.data?.account_name) {
      const fallbackName = `ACCOUNT ${String(account_number).slice(-4)}`;
      return new Response(
        JSON.stringify({
          account_name: fallbackName,
          fallback: true,
          provider_status: response.status,
          provider_message: data?.message || 'Unknown error',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ account_name: data.data.account_name }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('verify-bank-account error', error);
    return new Response(
      JSON.stringify({ error: 'Verification failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
