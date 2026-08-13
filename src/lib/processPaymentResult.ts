import { createAdminSupabaseClient } from '@/lib/supabase-server';
import { sendOrderConfirmation } from '@/lib/email';

interface ProcessResult {
  updated: boolean;
  alreadyProcessed: boolean;
  error?: string;
}

/**
 * Shared, idempotent payment result processor.
 *
 * Called by both the browser-redirect callback (`/api/payment/callback`)
 * and the server-to-server webhook (`/api/payment/webhook`).
 *
 * Idempotency guarantees:
 *  - If the order is already marked `paid`, the function skips the update
 *    and does NOT re-send the confirmation email.
 *  - If the order is already marked `failed`, a subsequent `paid` update
 *    WILL proceed (PayU may retry after an initial failure).
 *
 * Uses the admin Supabase client (service role key) to bypass RLS.
 */
export async function processPaymentResult(
  orderId: string,
  status: 'paid' | 'failed'
): Promise<ProcessResult> {
  const supabase = createAdminSupabaseClient();

  // ── 1. Fetch current order ────────────────────────────────────────────────
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (fetchError || !order) {
    console.error('processPaymentResult: order not found', orderId, fetchError);
    return { updated: false, alreadyProcessed: false, error: 'Order not found' };
  }

  // ── 2. Idempotency: skip if already in the target state ───────────────────
  if (order.payment_status === status) {
    console.log(`processPaymentResult: order ${orderId} already ${status}, skipping`);
    return { updated: false, alreadyProcessed: true };
  }

  // If already paid, don't downgrade to failed
  // (webhook might arrive after callback already marked it paid)
  if (order.payment_status === 'paid' && status === 'failed') {
    console.log(`processPaymentResult: order ${orderId} already paid, ignoring failed status`);
    return { updated: false, alreadyProcessed: true };
  }

  // ── 3. Update payment_status ──────────────────────────────────────────────
  const { error: updateError } = await supabase
    .from('orders')
    .update({ payment_status: status })
    .eq('order_id', orderId);

  if (updateError) {
    console.error('processPaymentResult: update failed', orderId, updateError);
    return { updated: false, alreadyProcessed: false, error: 'Database update failed' };
  }

  console.log(`processPaymentResult: payment_status updated to ${status} for order ${orderId}`);

  // ── 4. Send confirmation email on first successful payment ────────────────
  if (status === 'paid') {
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
      console.error('processPaymentResult: confirmation email failed:', emailError);
    }
  }

  return { updated: true, alreadyProcessed: false };
}
