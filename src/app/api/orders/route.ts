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
      payment_method,
      courier_service,
    } = body;

    const supabase = await createServerSupabaseClient();
    const orderId = generateOrderId();
    // Helper to calculate item price securely on the server
    const getItemUnitPrice = (item: any, method: string) => {
      const isFaceCream =
        item.product_id === 'face-cream' ||
        item.slug === 'face-cream' ||
        String(item.name).toLowerCase().includes('face cream');
      if (method === 'cod' && isFaceCream) {
        return 799;
      }
      return Number(item.price);
    };

    const calculated_items = items.map((item: any) => ({
      ...item,
      price: getItemUnitPrice(item, payment_method),
    }));

    // Calculate totals securely on the server
    const calculated_subtotal = calculated_items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const calculated_shipping_charge = payment_method === 'cod' ? 100 : (courier_service === 'dtdc' ? 60 : 0);
    const calculated_total = calculated_subtotal + calculated_shipping_charge;

    // Create order in database
    const { error } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        customer_name,
        customer_phone,
        customer_email,
        shipping_address,
        items: calculated_items,
        subtotal: calculated_subtotal,
        shipping_charge: calculated_shipping_charge,
        total: calculated_total,
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

    // ── Generate PayU params for both Online and Partial COD ────────────────────
    try {
      // For COD, charge the ₹100 advance shipping fee; for Online, charge full total
      const payableAmount = payment_method === 'cod' ? calculated_shipping_charge : calculated_total;
      const amountStr = Number(payableAmount).toFixed(2);

      // PayU's `firstname` field should contain only the first name
      const firstname = String(customer_name).trim().split(' ')[0] || 'Customer';
      const productinfo = payment_method === 'cod' ? 'xcosmetics COD Advance Delivery Fee' : 'xcosmetics order';

      const hash = generatePayUHash({
        txnid: orderId,
        amount: amountStr,
        productinfo,
        firstname,
        email: customer_email,
        udf1: orderId, // store orderId for retrieval in callback
      });

      const payuParams: PayUFormParams = {
        key: getMerchantKey(),
        txnid: orderId,
        amount: amountStr,
        productinfo,
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
      return NextResponse.json({
        error: 'Failed to initialize payment gateway. Please try again.',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Order API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}