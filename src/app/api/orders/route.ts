import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Cashfree, CFEnvironment, CreateOrderRequest } from 'cashfree-pg';
import { sendOrderConfirmation } from '@/lib/email';

// Initialize Cashfree v5.x with positional arguments: (environment, clientId, clientSecret)
const cashfree = new Cashfree(
  process.env.NODE_ENV === 'production' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
  process.env.CASHFREE_APP_ID!,
  process.env.CASHFREE_SECRET_KEY!
);

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
    const { data: order, error } = await supabase
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
        payment_status: payment_method === 'cod' ? 'pending' : 'pending',
        order_status: 'not_yet_shipped',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // If online payment, create Cashfree order
    if (payment_method === 'online') {
      try {
        const cashfreeOrderRequest: CreateOrderRequest = {
          order_id: orderId,
          order_amount: total,
          order_currency: 'INR',
          customer_details: {
            customer_id: `cust_${Date.now()}`,
            customer_name,
            customer_email,
            customer_phone,
          },
          order_meta: {
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/callback?order_id=${orderId}`,
          },
        };

        // v5.x takes CreateOrderRequest directly (no version string)
        const response = await cashfree.PGCreateOrder(cashfreeOrderRequest);

        // Update order with Cashfree order ID
        await supabase
          .from('orders')
          .update({ cashfree_order_id: response.data?.cf_order_id })
          .eq('order_id', orderId);

        // Send order confirmation email
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

        return NextResponse.json({
          order_id: orderId,
          payment_session_id: response.data?.payment_session_id,
        });
      } catch (cashfreeError) {
        console.error('Cashfree error:', cashfreeError);
        // Fallback to COD if payment fails
        return NextResponse.json({
          order_id: orderId,
          message: 'Payment gateway error. Order placed as COD.',
        });
      }
    }

    // COD order - send confirmation email
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