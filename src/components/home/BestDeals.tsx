'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { Product } from '@/types';

interface BestDealsProps {
  products: Product[];
}

export default function BestDeals({ products }: BestDealsProps) {
  const handleAddToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex((item: { product: Product }) => item.product.id === product.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <section id="best-deals" style={{ padding: '60px 16px' }} className="bg-white">
      <div className="container mx-auto" style={{ padding: '0 8px' }}>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between" style={{ marginBottom: '24px', gap: '12px' }}>
          <h2 className="text-xl md:text-3xl font-bold text-gray-900">Products with Best Deals</h2>
          <Link
            href="/products"
            className="text-pink-500 hover:text-pink-600 font-medium flex items-center gap-1 text-sm md:text-base"
          >
            View All <ArrowRight size={18} />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6" style={{ gap: '12px' }}>
          {products.slice(0, 6).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
}