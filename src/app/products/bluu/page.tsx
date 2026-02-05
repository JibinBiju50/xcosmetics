'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, ArrowLeft, Minus, Plus, Check, User, Users } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

// Product data for Bluu cream variants
const bluuProduct = {
    basePrice: 599,
    offerPrice: 399,
    discount: 33,
    sharedDescription: "Unveil your natural glow. Let your skin feel as confident as you. Choose Bluu E-Radiance Cream - because your skincare should feel like self-care.",
    sharedBenefits: [
        "Sandalwood Extract - Calms inflammation & evens skin tone",
        "Turmeric Extract - Fights acne & brightens skin",
        "Glutathione - Boosts glow & detoxifies skin",
        "Niacinamide (Vitamin B3) - Minimizes pores & balances oil",
        "Biotin (Vitamin B7) - Strengthens skin barrier",
        "Kojic Acid - Fades dark spots & pigmentation",
        "Collagen - Improves skin elasticity & firmness",
        "Glycerin - Deep hydration & moisture lock",
        "Vitamins A, B, C, E - Repair, protect, and renew skin",
        "Alpha Arbutin - Reduces tanning and hyperpigmentation",
    ],
    variants: {
        women: {
            name: "Bluu E-Radiance Cream - Women",
            tagline: "Essence Women by Bluu",
            image: "/images/cream/cream-bluu-women.jpeg",
            specificBenefits: [
                "Ultra-lightweight yet deeply hydrating",
                "Brings out a soft, dewy, healthy glow",
                "Gentle on skin, powerful in results",
                "Perfect for daily use under makeup or on its own",
            ],
            usage: "Apply a small amount on clean face and neck. Gently massage in circular motions until absorbed. Use daily for best results.",
        },
        men: {
            name: "Bluu E-Radiance Cream - Men",
            tagline: "Premium skincare for modern men",
            image: "/images/cream/cream-bluu-men.jpeg",
            specificBenefits: [
                "Enhances natural skin clarity",
                "Refines uneven tone & dullness",
                "Provides lightweight, long-lasting hydration",
                "Smoothens skin texture for a polished look",
                "Helps reduce the appearance of spots & marks",
                "Calms skin post-shave, leaving it comfortable",
                "Restores a fresh, healthy complexion",
                "Absorbs quickly with a non-greasy finish",
            ],
            usage: "Apply after shaving or on clean face. Massage gently until absorbed. Use morning and night for best results.",
        },
    },
};

export default function BluuProductPage() {
    const [variant, setVariant] = useState<'women' | 'men'>('women');
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);

    const currentVariant = bluuProduct.variants[variant];

    const handleAddToCart = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');

        const productToAdd = {
            id: `bluu-cream-${variant}`,
            name: currentVariant.name,
            slug: `bluu-cream-${variant}`,
            category: 'skincare' as const,
            description: bluuProduct.sharedDescription,
            benefits: [...bluuProduct.sharedBenefits, ...currentVariant.specificBenefits],
            usage: currentVariant.usage,
            original_price: bluuProduct.basePrice,
            offer_price: bluuProduct.offerPrice,
            image_url: currentVariant.image,
            is_combo: false,
            in_stock: true,
            created_at: new Date().toISOString(),
        };

        const existingIndex = cart.findIndex((item: { product: { id: string } }) =>
            item.product.id === productToAdd.id
        );

        if (existingIndex > -1) {
            cart[existingIndex].quantity += quantity;
        } else {
            cart.push({ product: productToAdd, quantity });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleBuyNow = () => {
        handleAddToCart();
        window.location.href = '/checkout';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6 md:px-8 lg:px-16">
                {/* Back Link */}
                <Link
                    href="/products"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-500 mb-6"
                >
                    <ArrowLeft size={18} />
                    Back to Products
                </Link>

                {/* Product Section - constrained width */}
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
                        {/* Image */}
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg">
                            <span className="absolute top-4 left-4 bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                                {bluuProduct.discount}% OFF
                            </span>
                            <Image
                                src={currentVariant.image}
                                alt={currentVariant.name}
                                fill
                                className="object-cover transition-all duration-300"
                                priority
                            />
                        </div>

                        {/* Details */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg lg:p-8">
                            {/* Variant Toggle */}
                            <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
                                <button
                                    onClick={() => setVariant('women')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${variant === 'women'
                                        ? 'bg-pink-500 text-white shadow-md'
                                        : 'text-gray-600 hover:text-pink-500'
                                        }`}
                                >
                                    <Users size={20} />
                                    For Women
                                </button>
                                <button
                                    onClick={() => setVariant('men')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${variant === 'men'
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'text-gray-600 hover:text-blue-500'
                                        }`}
                                >
                                    <User size={20} />
                                    For Men
                                </button>
                            </div>

                            <span className={`text-sm font-medium uppercase tracking-wide ${variant === 'women' ? 'text-pink-500' : 'text-blue-500'
                                }`}>
                                {currentVariant.tagline}
                            </span>
                            <h1 className="text-2xl font-bold text-gray-900 mt-2 lg:text-3xl">
                                {currentVariant.name}
                            </h1>

                            {/* Rating placeholder */}
                            <div className="flex items-center gap-2 mt-3">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={18}
                                            className={star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                        />
                                    ))}
                                </div>
                                <span className="text-gray-600 text-sm">(Premium Quality)</span>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-3 mt-4">
                                <span className={`text-3xl font-bold ${variant === 'women' ? 'text-pink-500' : 'text-blue-500'}`}>
                                    {formatPrice(bluuProduct.offerPrice)}
                                </span>
                                <span className="text-xl text-gray-400 line-through">
                                    {formatPrice(bluuProduct.basePrice)}
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 mt-6 leading-relaxed">
                                {bluuProduct.sharedDescription}
                            </p>

                            {/* Shared Benefits */}
                            <div className="mt-6">
                                <h3 className="font-semibold text-gray-900 mb-3">Key Ingredients & Benefits</h3>
                                <ul className="space-y-2 max-h-40 overflow-y-auto">
                                    {bluuProduct.sharedBenefits.map((benefit, index) => (
                                        <li key={index} className="flex items-start gap-2 text-gray-600 text-sm">
                                            <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Variant-Specific Benefits */}
                            <div className="mt-6">
                                <h3 className={`font-semibold mb-3 ${variant === 'women' ? 'text-pink-600' : 'text-blue-600'}`}>
                                    Why {variant === 'women' ? 'Women' : 'Men'} Choose It
                                </h3>
                                <ul className="space-y-2">
                                    {currentVariant.specificBenefits.map((benefit, index) => (
                                        <li key={index} className="flex items-start gap-2 text-gray-600">
                                            <Check size={16} className={`flex-shrink-0 mt-0.5 ${variant === 'women' ? 'text-pink-500' : 'text-blue-500'
                                                }`} />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Usage */}
                            <div className="mt-6">
                                <h3 className="font-semibold text-gray-900 mb-2">How to Use</h3>
                                <p className="text-gray-600 text-sm">{currentVariant.usage}</p>
                            </div>

                            {/* Quantity & Actions */}
                            <div className="mt-8 pt-6 border-t">
                                {/* Quantity Selector */}
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="text-gray-700 font-medium">Quantity:</span>
                                    <div className="flex items-center border rounded-lg">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="p-2 hover:bg-gray-100"
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <span className="px-4 py-2 font-medium">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="p-2 hover:bg-gray-100"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <button
                                        onClick={handleAddToCart}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors ${addedToCart
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                            }`}
                                    >
                                        {addedToCart ? <Check size={20} /> : <ShoppingCart size={20} />}
                                        {addedToCart ? 'Added!' : 'Add to Cart'}
                                    </button>
                                    <button
                                        onClick={handleBuyNow}
                                        className={`flex-1 py-3 rounded-lg font-semibold transition-colors text-white ${variant === 'women'
                                            ? 'bg-pink-500 hover:bg-pink-600'
                                            : 'bg-blue-500 hover:bg-blue-600'
                                            }`}
                                    >
                                        Buy Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
