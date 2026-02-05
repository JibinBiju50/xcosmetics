import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, calculateDiscount } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const discount = calculateDiscount(product.original_price, product.offer_price);

  // Special case: Bluu products go to the toggle page
  const productUrl = product.slug.toLowerCase().includes('bluu')
    ? '/products/bluu'
    : `/products/${product.slug}`;

  return (
    <div
      className="bg-white rounded-xl shadow-md group relative overflow-hidden"
    >
      {/* Discount Badge */}
      {discount > 0 && (
        <span
          className="absolute bg-pink-500 text-white rounded-full text-xs font-bold z-20 shadow-md"
          style={{ top: '8px', left: '8px', padding: '4px 10px' }}
        >
          {discount}% OFF
        </span>
      )}

      {/* Image - Full width, no padding */}
      <Link href={productUrl}>
        <div
          className="relative overflow-hidden"
          style={{ height: '180px' }}
        >
          <Image
            src={product.image_url || '/images/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      {/* Content - With padding */}
      <div style={{ padding: '12px' }}>
        {/* Category */}
        <p
          className="text-xs text-gray-500 uppercase tracking-wider font-medium"
          style={{ marginBottom: '8px' }}
        >
          {product.category}
        </p>

        {/* Name */}
        <Link href={productUrl}>
          <h3
            className="font-semibold text-gray-800 hover:text-pink-600 transition-colors line-clamp-2 text-sm leading-snug"
            style={{ marginBottom: '8px', minHeight: '36px' }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1" style={{ marginBottom: '8px' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={12}
              className={star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">(4.5)</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2" style={{ marginBottom: '12px' }}>
          <span className="text-lg font-bold text-pink-500">{formatPrice(product.offer_price)}</span>
          <span className="text-xs text-gray-400 line-through">{formatPrice(product.original_price)}</span>
        </div>

        {/* Actions */}
        <div style={{ paddingTop: '6px' }}>
          <button
            onClick={() => onAddToCart?.(product)}
            className="w-full flex items-center justify-center gap-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors text-xs font-semibold"
            style={{ padding: '10px 12px' }}
          >
            <ShoppingCart size={14} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}