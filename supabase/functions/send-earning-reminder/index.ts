import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { email, name } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const firstName = (name || 'there').split(' ')[0];

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 6px 28px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,hsl(158,64%,45%),hsl(158,74%,38%));padding:28px 36px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Cash<span style="opacity:0.85;">Pay</span></h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.9);font-size:13px;">Your Earning Opportunities Are Waiting 💰</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 36px 16px;">
            <p style="margin:0 0 6px;color:#1a2332;font-size:20px;font-weight:700;">Hi ${firstName} 👋</p>
            <p style="margin:0 0 22px;color:#6b7280;font-size:15px;line-height:1.6;">
              Don't miss out on this week's earning opportunities on CashPay. Here's what you can claim right now:
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;">
              <tr>
                <td style="background:#f0fdf4;border-left:4px solid hsl(158,64%,45%);border-radius:10px;padding:16px 18px;">
                  <p style="margin:0;color:#1a2332;font-size:15px;font-weight:700;">🎁 Weekly Reward — ₦125,000</p>
                  <p style="margin:4px 0 0;color:#6b7280;font-size:13px;line-height:1.5;">Claim your free weekly bonus. 4 claims available every month.</p>
                </td>
              </tr>
              <tr><td style="height:10px;"></td></tr>
              <tr>
                <td style="background:#eff6ff;border-left:4px solid #3b82f6;border-radius:10px;padding:16px 18px;">
                  <p style="margin:0;color:#1a2332;font-size:15px;font-weight:700;">👥 Refer & Earn — ₦25,000 per friend</p>
                  <p style="margin:4px 0 0;color:#6b7280;font-size:13px;line-height:1.5;">Share your referral code on WhatsApp and earn instantly when friends join.</p>
                </td>
              </tr>
              <tr><td style="height:10px;"></td></tr>
              <tr>
                <td style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:10px;padding:16px 18px;">
                  <p style="margin:0;color:#1a2332;font-size:15px;font-weight:700;">⚡ Withdraw to Your Bank</p>
                  <p style="margin:4px 0 0;color:#6b7280;font-size:13px;line-height:1.5;">Cash out your balance directly to any Nigerian bank account.</p>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="https://cashpay-28854.lovable.app/dashboard" style="display:inline-block;background:linear-gradient(135deg,hsl(158,64%,45%),hsl(158,74%,38%));color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:12px;box-shadow:0 4px 14px rgba(16,185,129,0.35);">Open CashPay →</a>
              </td></tr>
            </table>

            <p style="margin:24px 0 0;color:#9ca3af;font-size:12px;line-height:1.5;text-align:center;">
              You're receiving this because your email is registered with CashPay. Rewards reset weekly — claim before they expire.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:18px 36px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">© 2025 CashPay · Secured Nigerian Fintech</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'CashPay <onboarding@resend.dev>',
        to: [email],
        subject: '💰 Your CashPay earning opportunities this week',
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Resend error:', data);
      if (data?.statusCode === 403 || data?.name === 'validation_error') {
        return new Response(JSON.stringify({ success: true, warning: 'Sandbox mode' }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: data?.message || 'Failed' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('send-earning-reminder error:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
