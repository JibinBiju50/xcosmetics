'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Banknote, Truck, Trash2 } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { trackInitiateCheckout } from '@/lib/pixel';

interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * Creates a hidden HTML form and auto-submits it to PayU's payment page.
 * This is the standard, secure integration method for PayU Biz.
 * The `action` field in params contains the PayU endpoint URL.
 */
function submitPayUForm(params: Record<string, string>) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = params.action;

  Object.entries(params).forEach(([key, value]) => {
    if (key !== 'action') {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }
  });

  document.body.appendChild(form);
  form.submit();
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Payment & Shipping
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [courierService, setCourierService] = useState<'dtdc' | 'postal'>('dtdc');

  useEffect(() => {
    setMounted(true);

    const savedFormData = localStorage.getItem('checkoutFormData');
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        if (parsed.name) setName(parsed.name);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.city) setCity(parsed.city);
        if (parsed.state) setState(parsed.state);
        if (parsed.pincode) setPincode(parsed.pincode);
      } catch (e) {
        console.error(e);
      }
    }
    
    // Check for URL errors safely on client
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    if (errorParam) {
      setPaymentError(errorParam);
      // Clean up URL without reloading
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (parsedCart.length === 0) {
        router.push('/cart');
      }
      setCart(parsedCart);

      // Meta Pixel: track checkout initiation
      if (parsedCart.length > 0) {
        const totalItems = parsedCart.reduce(
          (sum: number, item: CartItem) => sum + item.quantity,
          0
        );
        const totalValue = parsedCart.reduce(
          (sum: number, item: CartItem) =>
            sum + item.product.offer_price * item.quantity,
          0
        );
        trackInitiateCheckout({
          content_ids: parsedCart.map((item: CartItem) => item.product.id),
          num_items: totalItems,
          value: totalValue,
        });
      }
    } else {
      router.push('/cart');
    }
  }, [router]);

  const getItemUnitPrice = (product: Product, method: 'online' | 'cod') => {
    if (method === 'cod' && (product.slug === 'face-cream' || product.name.toLowerCase().includes('face cream'))) {
      return 799;
    }
    return product.offer_price;
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + getItemUnitPrice(item.product, paymentMethod) * item.quantity,
    0
  );

  const onlineSubtotal = cart.reduce(
    (sum, item) => sum + item.product.offer_price * item.quantity,
    0
  );

  const handleRemoveItem = (productId: string) => {
    const newCart = cart.filter(item => item.product.id !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
    if (newCart.length === 0) {
      router.push('/cart');
    }
  };

  // Shipping charges based on payment method and courier
  const getShippingCharge = () => {
    if (paymentMethod === 'cod') {
      return 100; // COD fixed advance shipping fee: ₹100
    }
    // Online payment
    return courierService === 'dtdc' ? 60 : 0; // DTDC ₹60, Postal free
  };

  const shippingCharge = getShippingCharge();
  const total = subtotal + shippingCharge;
  const advanceAmount = paymentMethod === 'cod' ? 100 : total;
  const balanceCodAmount = paymentMethod === 'cod' ? subtotal : 0;

  // Auto-set courier to postal when COD is selected
  useEffect(() => {
    if (paymentMethod === 'cod') {
      setCourierService('postal');
    }
  }, [paymentMethod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Save form data for recovery in case of payment failure
    localStorage.setItem('checkoutFormData', JSON.stringify({
      name, phone, email, address, city, state, pincode
    }));

    const orderData = {
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      shipping_address: `${address}, ${city}, ${state} - ${pincode}`,
      items: cart.map((item) => ({
        product_id: item.product.id,
        name: item.product.name,
        price: getItemUnitPrice(item.product, paymentMethod),
        quantity: item.quantity,
      })),
      subtotal,
      shipping_charge: shippingCharge,
      total,
      payment_method: paymentMethod,
      courier_service: courierService,
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok && data.payu_params) {
        // Auto-submit hidden form to PayU's payment page (for both Online and Partial COD ₹100 advance)
        submitPayUForm(data.payu_params);
      } else {
        alert(data.error || 'Error creating order. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return <LoadingSpinner fullScreen text="Loading checkout..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto" style={{ padding: '32px 24px' }}>
        {/* Back Link */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-500"
          style={{ marginBottom: '24px', display: 'inline-flex' }}
        >
          <ArrowLeft size={18} />
          Back to Cart
        </Link>

        <h1
          className="text-2xl font-bold text-gray-900 md:text-3xl"
          style={{ marginBottom: '32px' }}
        >
          Checkout
        </h1>

        {paymentError === 'payment_failed' && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
            <p className="font-semibold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Payment Failed
            </p>
            <p className="text-sm mt-1">Your previous payment attempt was unsuccessful. Your cart has been preserved so you can try again or choose a different payment method.</p>
          </div>
        )}
        {paymentError === 'verification_failed' && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
            <p className="font-semibold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Security Verification Failed
            </p>
            <p className="text-sm mt-1">We could not verify the payment response from the gateway. Please try again.</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '32px' }}>
            {/* Form Sections */}
            <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Contact Information */}
              <div className="bg-white rounded-2xl shadow-lg" style={{ padding: '28px' }}>
                <h2
                  className="text-lg font-bold text-gray-900"
                  style={{ marginBottom: '20px' }}
                >
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '20px' }}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                      placeholder="10-digit mobile number"
                      pattern="[0-9]{10}"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl shadow-lg" style={{ padding: '28px' }}>
                <h2
                  className="text-lg font-bold text-gray-900"
                  style={{ marginBottom: '20px' }}
                >
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '20px' }}>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <textarea
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                      placeholder="House/Flat No., Building, Street"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                      placeholder="6-digit pincode"
                      pattern="[0-9]{6}"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method - FIRST */}
              <div className="bg-white rounded-2xl shadow-lg" style={{ padding: '28px' }}>
                <h2
                  className="text-lg font-bold text-gray-900"
                  style={{ marginBottom: '20px' }}
                >
                  Payment Method
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '16px' }}>
                  {/* Option 1: Pay Online (Full Prepaid) */}
                  <label
                    className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'online'
                      ? 'border-pink-500 bg-pink-50/50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="text-pink-500 mt-1"
                    />
                    <CreditCard size={24} className="text-pink-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-gray-900">Pay Online (100% Prepaid)</p>
                        <span className="bg-green-100 text-green-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                          EXTRA DISCOUNT + FREE SHIP
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">UPI, GPay, PhonePe, Cards & Netbanking</p>
                      <p className="text-xs text-green-700 font-semibold mt-1">
                        ✓ Best Value • Face Cream at ₹749 (Save ₹150 vs COD)
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Partial Cash on Delivery */}
                  <label
                    className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod'
                      ? 'border-pink-500 bg-pink-50/50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="text-pink-500 mt-1"
                    />
                    <Banknote size={24} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-gray-900">Cash on Delivery</p>
                        <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                          ₹100 ADVANCE
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Pay ₹100 courier fee now • ₹{subtotal} at door (Total: ₹{total})</p>
                      <p className="text-xs text-emerald-700 font-semibold mt-1.5 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                        💡 Tip: Pay Online to get it for just ₹{onlineSubtotal} & Save ₹{total - onlineSubtotal}!
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Courier Selection - Only for Online Payment */}
              {paymentMethod === 'online' && (
                <div className="bg-white rounded-2xl shadow-lg" style={{ padding: '28px' }}>
                  <h2
                    className="text-lg font-bold text-gray-900 flex items-center gap-2"
                    style={{ marginBottom: '20px' }}
                  >
                    <Truck size={20} />
                    Shipping Method
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '16px' }}>
                    <label
                      className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${courierService === 'postal'
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <input
                        type="radio"
                        name="courier"
                        value="postal"
                        checked={courierService === 'postal'}
                        onChange={() => setCourierService('postal')}
                        className="text-pink-500"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">India Post</p>
                        <p className="text-sm text-gray-500">7-10 business days</p>
                      </div>
                      <span className="font-semibold text-green-600">FREE</span>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${courierService === 'dtdc'
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <input
                        type="radio"
                        name="courier"
                        value="dtdc"
                        checked={courierService === 'dtdc'}
                        onChange={() => setCourierService('dtdc')}
                        className="text-pink-500"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">DTDC Express</p>
                        <p className="text-sm text-gray-500">3-5 business days</p>
                      </div>
                      <span className="font-semibold">₹60</span>
                    </label>
                  </div>
                </div>
              )}

              {/* COD Explainer Info & Online Tempting Banner */}
              {paymentMethod === 'cod' && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <Truck size={22} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-amber-900">Partial COD Breakdown</p>
                      <p className="text-sm text-amber-800 leading-relaxed">
                        To confirm your COD order, a <strong>₹100 advance delivery fee</strong> is payable right now online. The remaining product price of <strong>₹{subtotal}</strong> will be collected in <strong>CASH</strong> by the courier upon delivery (Total: <strong>₹{total}</strong>).
                      </p>
                    </div>
                  </div>

                  {/* Tempt the customer to switch to Online */}
                  <div className="bg-white/90 backdrop-blur-sm border-2 border-pink-300 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-pink-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                          EXCLUSIVE OFFER
                        </span>
                        <p className="text-sm font-bold text-gray-900">
                          Save ₹{total - onlineSubtotal} with Online Payment!
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 leading-tight">
                        Pay ₹{onlineSubtotal} online and get <strong>FREE Postal Shipping</strong> + <strong>Instant Priority Dispatch</strong>.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('online')}
                      className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow transition-all whitespace-nowrap"
                    >
                      Switch to Pay Online
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div
                className="bg-white rounded-2xl shadow-lg sticky top-4"
                style={{ padding: '28px' }}
              >
                <h2
                  className="text-lg font-bold text-gray-900"
                  style={{ marginBottom: '20px' }}
                >
                  Order Summary
                </h2>

                {/* Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {cart.map((item) => {
                    const unitPrice = getItemUnitPrice(item.product, paymentMethod);
                    return (
                      <div key={item.product.id} className="flex gap-3 relative">
                        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={item.product.image_url || '/images/placeholder.jpg'}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 pr-8">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          <p className="text-sm font-semibold text-pink-500">
                            {formatPrice(unitPrice * item.quantity)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.product.id)}
                          className="absolute right-0 top-0 text-gray-400 hover:text-red-500 p-1"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product Subtotal</span>
                    <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {paymentMethod === 'cod' ? 'Courier / COD Fee' : `Shipping (${courierService?.toUpperCase()})`}
                    </span>
                    <span className={shippingCharge === 0 ? 'text-green-600 font-semibold' : 'font-medium text-gray-900'}>
                      {shippingCharge === 0 ? 'FREE' : formatPrice(shippingCharge)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t text-base">
                    <span>Order Total</span>
                    <span className="text-gray-900">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Partial COD Payment Split Breakdown */}
                {paymentMethod === 'cod' ? (
                  <div className="mt-4 p-3 bg-pink-50 rounded-xl border border-pink-200 space-y-1.5 text-sm">
                    <div className="flex justify-between text-pink-700 font-semibold">
                      <span>Payable Online Now (Advance Fee):</span>
                      <span>₹100</span>
                    </div>
                    <div className="flex justify-between text-gray-700 font-medium text-xs pt-1 border-t border-pink-200">
                      <span>Payable in Cash on Delivery:</span>
                      <span>{formatPrice(balanceCodAmount)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200 text-xs text-green-800 font-medium">
                    ✓ Total {formatPrice(total)} paid online • ₹0 payable at delivery
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-center"
                >
                  {loading
                    ? 'Processing...'
                    : paymentMethod === 'cod'
                      ? 'Pay ₹100 Advance & Confirm COD'
                      : `Pay ${formatPrice(total)} Online`}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}