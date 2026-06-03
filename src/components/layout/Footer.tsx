import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#1a1f36] text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/images/logo/logo_bgremoved.png"
                alt="creamxstore"
                width={180}
                height={80}
                className="h-18 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-gray-400">
              Premium beauty products for your natural glow.
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-pink-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=skincare" className="hover:text-pink-400 transition-colors">
                  Skincare
                </Link>
              </li>
              <li>
                <Link href="/products?category=haircare" className="hover:text-pink-400 transition-colors">
                  Haircare
                </Link>
              </li>
              <li>
                <Link href="/products?category=lipcare" className="hover:text-pink-400 transition-colors">
                  Lip Care
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="hover:text-pink-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-pink-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-pink-400 transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-pink-400 transition-colors">
                  Return Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-pink-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-pink-400 transition-colors">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-pink-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-pink-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} creamxstore. All rights reserved.
        </div>
      </div>
    </footer>
  );
}