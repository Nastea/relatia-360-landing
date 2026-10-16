import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getProduct } from '@/lib/products';

/**
 * Trimite emailul de după plată (dacă produsul are `paidEmail`) prin Resend.
 *
 * Se apelează din toate locurile care marchează o comandă `paid` (callback,
 * check-status, reconcile, confirm-test). Cheia de idempotență `order-paid/<id>`
 * face ca Resend să trimită un singur email per comandă, chiar dacă mai multe
 * căi îl declanșează. Nu aruncă niciodată — o eroare de email nu strică plata.
 *
 * Env: RESEND_API_KEY (obligatoriu), RESEND_FROM, EMAIL_REPLY_TO (opționale).
 */
export async function sendPaidEmail(orderId: string): Promise<void> {
  try {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('id, product_id, status, customer_email, customer_first_name')
      .eq('id', orderId)
      .single();
    if (error || !order || order.status !== 'paid') return;

    const product = getProduct(order.product_id);
    if (!product?.paidEmail || !order.customer_email) return;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('PAID_EMAIL_SKIPPED: RESEND_API_KEY not set', { orderId });
      return;
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `order-paid/${order.id}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'Lilia Dubița <noreply@liliadubita.md>',
        to: order.customer_email,
        reply_to: process.env.EMAIL_REPLY_TO || undefined,
        subject: product.paidEmail.subject,
        html: product.paidEmail.html(order.customer_first_name ?? ''),
      }),
    });

    if (!res.ok) {
      console.error('PAID_EMAIL_FAILED', { orderId, status: res.status, body: await res.text() });
      return;
    }
    console.log('PAID_EMAIL_SENT', { orderId });
  } catch (e) {
    console.error('PAID_EMAIL_ERROR', { orderId, e });
  }
}
