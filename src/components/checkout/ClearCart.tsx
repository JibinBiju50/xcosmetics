'use client';

import { useEffect } from 'react';

/**
 * A tiny client component to clear the shopping cart from localStorage.
 * Used on the order-confirmation page to ensure the cart is only emptied
 * AFTER a successful payment or COD placement, preserving it on failure.
 */
export default function ClearCart() {
  useEffect(() => {
    localStorage.removeItem('cart');
    localStorage.removeItem('checkoutFormData');
    window.dispatchEvent(new Event('cartUpdated'));
  }, []);

  return null;
}
