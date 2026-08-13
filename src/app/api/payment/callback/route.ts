import { NextRequest, NextResponse } from 'next/server';
import { verifyPayUHash } from '@/lib/payu';
import { processPaymentResult } from '@/lib/processPaymentResult';

/**
 * PayU sends payment result as an HTTP POST with application/x-www-form-urlencoded body.
 * Both success (surl) and failure (furl) point here — we differentiate via the `status` field.
 *
 * Uses the shared `processPaymentResult` helper for idempotent DB updates and
 * email sending. If the webhook already processed this payment, the helper
 * will skip the duplicate update and email.
 *
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

    if (status === 'success' || status === 'SUCCESS') {
      // ── Payment succeeded ───────────────────────────────────────────────────
      const result = await processPaymentResult(orderId, 'paid');

      if (result.alreadyProcessed) {
        console.log('PayU callback: order', orderId, 'already processed (likely by webhook)');
      }

      return NextResponse.redirect(
        new URL(`/order-confirmation/${orderId}`, request.url)
      );
    } else {
      // ── Payment failed or was cancelled ────────────────────────────────────
      await processPaymentResult(orderId, 'failed');

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