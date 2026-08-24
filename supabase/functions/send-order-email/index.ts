// Supabase Edge Function: send-order-email
// Deploy: supabase functions deploy send-order-email --no-verify-jwt
// Env: RESEND_API_KEY, FROM_EMAIL=noreply@showy.jubair.bond
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const { to, order_number, total, items } = await req.json().catch(() => ({}));
  if (!to || !order_number) return new Response(JSON.stringify({ error: "Missing to/order_number" }), { status: 400 });
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) {
    console.log(`[stub] Would send email to ${to} for order ${order_number} — RESEND_API_KEY not set`);
    return new Response(JSON.stringify({ stub: true, to, order_number }), { headers: { "Content-Type": "application/json" } });
  }
  const from = Deno.env.get("FROM_EMAIL") || "Showy <noreply@showy.jubair.bond>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject: `Your Showy order ${order_number} is confirmed — ৳${total}`, html: `<h2>Thank you for shopping at Showy!</h2><p>Order <strong>${order_number}</strong> — ৳${total}<br>${(items || []).map((i:any)=>`${i.product_title} × ${i.quantity} — ৳${i.total_price}`).join("<br>")}</p><p>Track at https://showy.jubair.bond/orders</p>` }),
  });
  const data = await res.json().catch(() => ({}));
  return new Response(JSON.stringify(data), { status: res.status, headers: { "Content-Type": "application/json" } });
});
