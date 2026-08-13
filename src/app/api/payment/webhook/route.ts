import { NextRequest, NextResponse } from 'next/server';
import { verifyPayUHash } from '@/lib/payu';
import { processPaymentResult } from '@/lib/processPaymentResult';

/**
 * PayU server-to-server (S2S) webhook endpoint.
 *
 * Unlike the callback route (`/api/payment/callback`), this endpoint is called
 * directly by PayU's servers — NOT via a browser redirect. It fires even if the
 * user closes their browser mid-payment, ensuring the payment status is always
 * captured in the database.
 *
 * Configuration:
 *   1. Log in to PayU Dashboard → Developers → Webhooks
 *   2. Set URL to: https://your-domain.com/api/payment/webhook
 *   3. Select events: Payment Success, Payment Failure
 *
 * Security:
 *   - Same reverse-hash verification as the callback route.
 *   - Uses the shared `processPaymentResult` helper for idempotent processing.
 *   - Must return HTTP 200 within 10 seconds to acknowledge receipt.
 */
export async function POST(request: NextRequest) {
  try {
    // PayU webhooks use the same form-urlencoded format as the callback
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

    const orderId = udf1 || txnid;

    if (!orderId || !hash) {
      console.error('PayU webhook: missing orderId or hash');
      return NextResponse.json({ status: 'error', message: 'Missing required fields' }, { status: 400 });
    }

    // ── Security: verify reverse hash ───────────────────────────────────────
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
      console.error('PayU webhook: hash verification FAILED for order', orderId);
      return NextResponse.json({ status: 'error', message: 'Hash verification failed' }, { status: 403 });
    }

    // ── Process the payment result (idempotent) ─────────────────────────────
    const paymentStatus = (status === 'success' || status === 'SUCCESS') ? 'paid' : 'failed';
    const result = await processPaymentResult(orderId, paymentStatus);

    if (result.alreadyProcessed) {
      console.log(`PayU webhook: order ${orderId} already processed (likely by callback)`);
    } else if (result.updated) {
      console.log(`PayU webhook: order ${orderId} updated to ${paymentStatus}`);
    } else if (result.error) {
      console.error(`PayU webhook: failed to process order ${orderId}:`, result.error);
    }

    // Always return 200 to acknowledge receipt — PayU retries on non-200
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('PayU webhook error:', error);
    // Return 200 even on unexpected errors to prevent infinite retries.
    // The error is logged for investigation.
    return NextResponse.json({ status: 'ok' });
  }
}
