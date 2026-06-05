import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import {
  generatePayUHash,
  getMerchantKey,
  getPayUUrl,
  type PayUFormParams,
} from '@/lib/payu';
import { sendOrderConfirmation } from '@/lib/email';

function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `XC${timestamp}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_name,
      customer_phone,
      customer_email,
      shipping_address,
      items,
      subtotal,
      shipping_charge,
      total,
      payment_method,
      courier_service,
    } = body;

    const supabase = await createServerSupabaseClient();
    const orderId = generateOrderId();

    // Create order in database
    const { error } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        customer_name,
        customer_phone,
        customer_email,
        shipping_address,
        items,
        subtotal,
        shipping_charge,
        total,
        payment_method,
        courier_service,
        payment_status: 'pending',
        order_status: 'not_yet_shipped',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // ── Online payment: generate PayU params ──────────────────────────────────
    if (payment_method === 'online') {
      try {
        // PayU requires amount as a string with exactly 2 decimal places
        const amountStr = Number(total).toFixed(2);

        // PayU's `firstname` field should contain only the first name
        const firstname = String(customer_name).split(' ')[0];

        const hash = generatePayUHash({
          txnid: orderId,
          amount: amountStr,
          productinfo: 'xcosmetics order',
          firstname,
          email: customer_email,
          udf1: orderId, // store orderId for retrieval in callback
        });

        const payuParams: PayUFormParams = {
          key: getMerchantKey(),
          txnid: orderId,
          amount: amountStr,
          productinfo: 'xcosmetics order',
          firstname,
          email: customer_email,
          phone: customer_phone,
          surl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/callback`,
          furl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/callback`,
          udf1: orderId,
          hash,
          action: getPayUUrl(),
        };

        return NextResponse.json({
          order_id: orderId,
          payu_params: payuParams,
        });
      } catch (payuError) {
        console.error('PayU hash generation error:', payuError);
        // Graceful fallback — treat as COD
        return NextResponse.json({
          order_id: orderId,
          message: 'Payment gateway error. Order placed as COD.',
        });
      }
    }

    // ── COD: send confirmation email immediately ───────────────────────────────
    await sendOrderConfirmation({
      orderId,
      customerName: customer_name,
      customerEmail: customer_email,
      items,
      subtotal,
      shippingCharge: shipping_charge,
      total,
      shippingAddress: shipping_address,
      paymentMethod: payment_method,
      courierService: courier_service,
    });

    return NextResponse.json({ order_id: orderId });
  } catch (error) {
    console.error('Order API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}