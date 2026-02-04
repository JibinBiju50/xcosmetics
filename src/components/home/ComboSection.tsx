'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const comboImages = [
  '/images/combo/combo1_cream_and-soap.jpeg',
  '/images/combo/combo2_cream_and_lotion.jpeg',
  '/images/combo/combo3_cream-and_glowing.jpeg',
];

export default function ComboSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % comboImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + comboImages.length) % comboImages.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % comboImages.length);

  const features = [
    { title: 'Cream + Koiglow Combo', desc: 'For dark spots & uneven tone - Lighten up and glow evenly' },
    { title: 'Cream + Body Lotion Combo', desc: 'For dry, flaky skin - Hydrate head-to-toe for a soft, radiant look' },
    { title: 'Cream + Glow+ Whitening Cream', desc: 'For body dark patches - Brighten tough spots and feel confident' },
  ];

  return (
    <section className="bg-gradient-to-r from-pink-500 to-pink-600" style={{ padding: '60px 16px' }}>
      <div className="container mx-auto" style={{ padding: '0 16px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center" style={{ gap: '3rem' }}>
          {/* Left Content */}
          <div className="text-white">
            <span
              className="inline-flex items-center bg-white/20 text-sm rounded-full"
              style={{ gap: '8px', padding: '6px 16px', marginBottom: '16px' }}
            >
              <Sparkles size={16} /> Limited Time Offer
            </span>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ marginBottom: '16px' }}>
              Bundle & Save Big!
            </h2>
            <p className="text-xl text-pink-100" style={{ marginBottom: '32px' }}>
              Get up to <span className="font-bold text-white">40% OFF</span> on our exclusive combo packs
            </p>

            <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              {features.map((feature, index) => (
                <li key={index} className="flex items-start" style={{ gap: '12px' }}>
                  <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center" style={{ marginTop: '2px' }}>
                    <Check size={14} />
                  </span>
                  <div>
                    <h4 className="font-semibold" style={{ marginBottom: '4px' }}>{feature.title}</h4>
                    <p className="text-sm text-pink-100">{feature.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/products?category=combo"
              className="inline-block bg-white text-pink-600 font-semibold rounded-lg hover:bg-pink-50 transition-colors"
              style={{ padding: '14px 32px' }}
            >
              Shop Combo Deals →
            </Link>
          </div>

          {/* Right Image Carousel */}
          <div className="relative">

            {/* Carousel Container */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl w-full" style={{ height: '350px', maxWidth: '500px', margin: '0 auto' }}>
              {comboImages.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                  <Image
                    src={image}
                    alt={`Combo Offer ${index + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
              ))}

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/30 hover:bg-white/50 rounded-full transition-colors"
                style={{ padding: '8px' }}
              >
                <ChevronLeft size={20} className="text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/30 hover:bg-white/50 rounded-full transition-colors"
                style={{ padding: '8px' }}
              >
                <ChevronRight size={20} className="text-white" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex" style={{ gap: '8px' }}>
                {comboImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${index === currentSlide ? 'bg-white' : 'bg-white/50'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}