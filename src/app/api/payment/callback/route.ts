import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-server';
import { verifyPayUHash } from '@/lib/payu';
import { sendOrderConfirmation } from '@/lib/email';

/**
 * PayU sends payment result as an HTTP POST with application/x-www-form-urlencoded body.
 * Both success (surl) and failure (furl) point here — we differentiate via the `status` field.
 *
 * Uses the admin Supabase client (service role key) to bypass RLS, since this
 * route is called by a browser redirect from PayU — no user session cookie exists.
 * The PayU hash is verified BEFORE any database write to ensure authenticity.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the URL-encoded form body sent by PayU
    const formData = await request.formData();

    const status = (formData.get('status') as string) ?? '';
    const txnid = (formData.get('txnid') as string) ?? '';
    const amount = (formData.get('amount') as string) ?? '';
    const productinfo = (formData.get('productinfo') as string) ?? '';
    const firstname = (formData.get('firstname') as string) ?? '';
    const email = (formData.get('email') as string) ?? '';
    const udf1 = (formData.get('udf1') as string) ?? '';
    const key = (formData.get('key') as string) ?? '';
    const hash = (formData.get('hash') as string) ?? '';

    // orderId is stored in both txnid and udf1 (they should match)
    const orderId = udf1 || txnid;

    if (!orderId || !hash) {
      console.error('PayU callback: missing orderId or hash');
      return NextResponse.redirect(new URL('/cart', request.url));
    }

    // ── Security: verify reverse hash before trusting the status ─────────────
    const isValid = verifyPayUHash({
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      udf1,
      status,
      hash,
    });

    if (!isValid) {
      console.error('PayU callback: hash verification FAILED for order', orderId);
      return NextResponse.redirect(
        new URL('/checkout?error=verification_failed', request.url)
      );
    }

    // Admin client bypasses RLS — safe here because hash is already verified above
    const supabase = createAdminSupabaseClient();

    if (status === 'success' || status === 'SUCCESS') {
      // ── Payment succeeded ───────────────────────────────────────────────────
      const { error: updateError } = await supabase
        .from('orders')
        .update({ payment_status: 'paid' })
        .eq('order_id', orderId);

      if (updateError) {
        console.error('PayU callback: failed to update payment_status for order', orderId, updateError);
      } else {
        console.log('PayU callback: payment_status updated to paid for order', orderId);
      }

      // Fetch full order to send confirmation email
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (fetchError) {
        console.error('PayU callback: failed to fetch order for email', orderId, fetchError);
      }

      if (order) {
        try {
          await sendOrderConfirmation({
            orderId,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            items: order.items,
            subtotal: order.subtotal,
            shippingCharge: order.shipping_charge,
            total: order.total,
            shippingAddress: order.shipping_address,
            paymentMethod: order.payment_method,
            courierService: order.courier_service,
          });
        } catch (emailError) {
          // Log but don't fail — payment was successful regardless
          console.error('PayU callback: order confirmation email failed:', emailError);
        }
      }

      return NextResponse.redirect(
        new URL(`/order-confirmation/${orderId}`, request.url)
      );
    } else {
      // ── Payment failed or was cancelled ────────────────────────────────────
      const { error: updateError } = await supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('order_id', orderId);

      if (updateError) {
        console.error('PayU callback: failed to update payment_status to failed for order', orderId, updateError);
      }

      return NextResponse.redirect(
        new URL(
          `/checkout?error=payment_failed&order_id=${orderId}`,
          request.url
        )
      );
    }
  } catch (error) {
    console.error('PayU callback error:', error);
    return NextResponse.redirect(
      new URL('/checkout?error=verification_failed', request.url)
    );
  }
}