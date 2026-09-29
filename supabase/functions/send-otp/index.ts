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
    const { email, name } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
          <tr><td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,hsl(158,64%,45%),hsl(158,74%,38%));padding:32px 40px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">Cash<span style="opacity:0.85;">Pay</span></h1>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Secure Your Account</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:40px 40px 32px;">
                  <p style="margin:0 0 8px;color:#1a2332;font-size:18px;font-weight:700;">Hi ${name || 'there'} 👋</p>
                  <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                    Use the verification code below to complete your CashPay registration. This code expires in <strong>10 minutes</strong>.
                  </p>
                  <!-- OTP Box -->
                  <div style="background:#f0fdf4;border:2px dashed hsl(158,64%,45%);border-radius:12px;padding:28px;text-align:center;margin:0 0 24px;">
                    <p style="margin:0 0 4px;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your OTP Code</p>
                    <p style="margin:0;color:hsl(158,64%,38%);font-size:40px;font-weight:900;letter-spacing:12px;">${otp}</p>
                  </div>
                  <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.5;">
                    If you didn't create a CashPay account, please ignore this email. Never share this code with anyone.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                  <p style="margin:0;color:#9ca3af;font-size:12px;">© 2025 CashPay · All rights reserved</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CashPay <onboarding@resend.dev>',
        to: [email],
        subject: `${otp} is your CashPay verification code`,
        html: emailHtml,
      }),
    });

    const resendData = await resendRes.json();
    if (!resendRes.ok) {
      console.error('Resend error:', resendData);
      // If Resend sandbox restriction (can only send to own email), still return OTP so dev can test
      if (resendData?.name === 'validation_error' || resendData?.statusCode === 403) {
        return new Response(
          JSON.stringify({ success: true, otp, warning: 'Email delivery restricted in sandbox mode' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: resendData?.message || 'Failed to send email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, otp }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('send-otp error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
