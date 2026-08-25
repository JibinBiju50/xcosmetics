import { createServerSupabaseClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Mail, Phone } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import PurchaseTracker from '@/components/tracking/PurchaseTracker';
import ClearCart from '@/components/checkout/ClearCart';

interface PageProps {
  params: Promise<{ orderId: string }>;
}

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

async function getOrder(orderId: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }

  return data;
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { orderId } = await params;
  const order = await getOrder(orderId);

  if (!order) {
    notFound();
  }

  const orderItems = order.items as OrderItem[];
  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  const isCod = order.payment_method === 'cod';
  const advancePaid = order.advance_paid_amount ?? (isCod ? order.shipping_charge : order.total);
  const balanceCod = order.balance_cod_amount ?? (isCod ? order.subtotal : 0);

  const whatsappMessage = encodeURIComponent(
    `Hi creamXstore, I just placed order #${order.order_id} (${isCod ? `Partial COD - ₹${advancePaid} advance paid` : 'Prepaid'}). Please share updates!`
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <ClearCart />
      {/* Meta Pixel: track purchase */}
      <PurchaseTracker
        contentIds={orderItems.map((item) => item.name)}
        numItems={totalItems}
        value={order.total}
      />
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2 md:text-3xl">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600">
            Thank you for your order. We&apos;ve sent a confirmation to your email.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between mb-6 pb-4 border-b">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="text-xl font-bold text-pink-500">{order.order_id}</p>
            </div>
            <div className="text-left md:text-right mt-2 md:mt-0">
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium">
                {new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50 rounded-xl">
            <Package size={24} className="text-blue-500" />
            <div>
              <p className="font-semibold text-blue-900">Order Status</p>
              <p className="text-sm text-blue-700 capitalize">
                {order.order_status.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Items */}
          <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
          <div className="space-y-3 mb-6">
            {(order.items as OrderItem[]).map((item: OrderItem, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                {isCod ? 'Advance Delivery Fee (Paid Online)' : `Shipping (${order.courier_service?.toUpperCase()})`}
              </span>
              <span>{formatPrice(order.shipping_charge)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Order Total</span>
              <span className="text-pink-500">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Payment Info Card */}
          {isCod ? (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold text-amber-900">
                <span>Advance Delivery Fee:</span>
                <span className="text-green-600">₹{formatPrice(advancePaid)} (PAID ✓)</span>
              </div>
              <div className="flex justify-between items-center text-base font-bold text-amber-800 pt-2 border-t border-amber-200">
                <span>Cash to Pay on Delivery:</span>
                <span className="text-pink-600">{formatPrice(balanceCod)}</span>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                Please keep {formatPrice(balanceCod)} ready in cash when the delivery executive arrives.
              </p>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm font-semibold text-green-900">
                ✓ Full Payment Received Online: {formatPrice(order.total)}
              </p>
              <p className="text-xs text-green-700 mt-1">
                Zero doorstep payment required. Your order will be dispatched with priority!
              </p>
            </div>
          )}

          {/* Shipping Address */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
            <p className="text-gray-600">{order.customer_name}</p>
            <p className="text-gray-600 text-sm">{order.shipping_address}</p>
            <div className="flex flex-col md:flex-row gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Phone size={14} /> {order.customer_phone}
              </span>
              <span className="flex items-center gap-1">
                <Mail size={14} /> {order.customer_email}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href={`https://wa.me/918089641028?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold text-center transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            Track / Support on WhatsApp
          </a>
          <Link
            href="/products"
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold text-center transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold text-center transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}