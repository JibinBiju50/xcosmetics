'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0);
    setCartCount(count);

    // Listen for cart updates
    const handleStorageChange = () => {
      const updatedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const newCount = updatedCart.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0);
      setCartCount(newCount);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: '#ef517e' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo/logo.png"
              alt="xcosmetic"
              width={180}
              height={60}
              style={{ height: 'auto', maxHeight: '60px', width: 'auto' }}
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-white hover:text-pink-200 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="text-white hover:text-pink-200 transition-colors font-medium"
            >
              Shop
            </Link>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative text-white hover:text-pink-200">
              <ShoppingCart size={22} />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-pink-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-pink-400">
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                className="text-white hover:text-pink-200 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-white hover:text-pink-200 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}