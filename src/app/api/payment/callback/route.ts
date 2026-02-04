import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Cashfree, CFEnvironment } from 'cashfree-pg';

// Initialize Cashfree v5.x with positional arguments: (environment, clientId, clientSecret)
const cashfree = new Cashfree(
    process.env.NODE_ENV === 'production' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
    process.env.CASHFREE_APP_ID!,
    process.env.CASHFREE_SECRET_KEY!
);

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('order_id');

    if (!orderId) {
        return NextResponse.redirect(new URL('/cart', request.url));
    }

    try {
        // Verify payment with Cashfree v5.x
        const response = await cashfree.PGOrderFetchPayments(orderId);
        const payments = response.data;

        const supabase = await createServerSupabaseClient();

        if (payments && payments.length > 0) {
            const lastPayment = payments[payments.length - 1];

            if (lastPayment.payment_status === 'SUCCESS') {
                // Update order payment status
                await supabase
                    .from('orders')
                    .update({ payment_status: 'paid' })
                    .eq('order_id', orderId);

                // Clear cart and redirect to confirmation
                return NextResponse.redirect(
                    new URL(`/order-confirmation/${orderId}`, request.url)
                );
            } else {
                // Payment failed
                await supabase
                    .from('orders')
                    .update({ payment_status: 'failed' })
                    .eq('order_id', orderId);

                return NextResponse.redirect(
                    new URL(`/checkout?error=payment_failed&order_id=${orderId}`, request.url)
                );
            }
        }

        return NextResponse.redirect(new URL(`/order-confirmation/${orderId}`, request.url));
    } catch (error) {
        console.error('Payment callback error:', error);
        return NextResponse.redirect(new URL('/checkout?error=verification_failed', request.url));
    }
}