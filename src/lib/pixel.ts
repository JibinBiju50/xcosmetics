/**
 * Meta Pixel (Facebook Pixel) helper utilities.
 *
 * The base pixel code is loaded in layout.tsx. These helpers provide
 * a type-safe way to fire standard events from React client components.
 */

// Extend the Window interface so TypeScript knows about fbq
declare global {
  interface Window {
    fbq: (
      action: string,
      event: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

/**
 * Safely calls fbq() only when available (client-side, pixel loaded).
 */
function safeFbq(
  action: string,
  event: string,
  params?: Record<string, unknown>
) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq(action, event, params);
  }
}

// ─── Standard Events ────────────────────────────────────────────────

/** User views a product detail page */
export function trackViewContent(product: {
  id: string;
  name: string;
  category?: string;
  offer_price: number;
}) {
  safeFbq('track', 'ViewContent', {
    content_name: product.name,
    content_ids: [product.id],
    content_category: product.category,
    content_type: 'product',
    value: product.offer_price,
    currency: 'INR',
  });
}

/** User adds an item to their cart */
export function trackAddToCart(product: {
  id: string;
  name: string;
  category?: string;
  offer_price: number;
  quantity?: number;
}) {
  safeFbq('track', 'AddToCart', {
    content_name: product.name,
    content_ids: [product.id],
    content_type: 'product',
    value: product.offer_price * (product.quantity ?? 1),
    currency: 'INR',
  });
}

/** User lands on the checkout page */
export function trackInitiateCheckout(data: {
  content_ids: string[];
  num_items: number;
  value: number;
}) {
  safeFbq('track', 'InitiateCheckout', {
    content_ids: data.content_ids,
    content_type: 'product',
    num_items: data.num_items,
    value: data.value,
    currency: 'INR',
  });
}

/** Order is confirmed / purchase completed */
export function trackPurchase(data: {
  content_ids: string[];
  num_items: number;
  value: number;
}) {
  safeFbq('track', 'Purchase', {
    content_ids: data.content_ids,
    content_type: 'product',
    num_items: data.num_items,
    value: data.value,
    currency: 'INR',
  });
}

/** User visits the contact page */
export function trackContact() {
  safeFbq('track', 'Contact');
}

/** User performs a search */
export function trackSearch(searchQuery: string) {
  safeFbq('track', 'Search', {
    search_string: searchQuery,
  });
}
