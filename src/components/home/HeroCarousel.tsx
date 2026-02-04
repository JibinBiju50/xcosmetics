'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    imageMobile: '/images/Homepage_HeroBanner_images/all_product_img.jpeg',
    imageDesktop: '/images/Homepage_HeroBanner_images/all_product_img_landscape.png',
    headline: 'Glow Naturally',
    subtext: 'Discover our premium skincare essentials',
    cta: 'Shop Now',
    link: '/products',
    showContent: true,
  },
  {
    imageMobile: '/images/Homepage_HeroBanner_images/boy_with_cream_mobile.jpeg',
    imageDesktop: '/images/Homepage_HeroBanner_images/boy_with_cream_landscape.png',
    headline: '',
    subtext: '',
    cta: '',
    link: '/products',
    showContent: false,
  },
  {
    imageMobile: '/images/Homepage_HeroBanner_images/Combo_offer_mobile.jpeg',
    imageDesktop: '/images/Homepage_HeroBanner_images/Combo_offer_landscape.png',
    headline: '',
    subtext: '',
    cta: '',
    link: '/products?category=combo',
    showContent: false,
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
        >
          {/* Gradient overlay only for slides with content */}
          {slide.showContent && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-transparent z-10" />
          )}

          {/* Mobile Image */}
          <Image
            src={slide.imageMobile}
            alt={slide.headline || `Slide ${index + 1}`}
            fill
            className="md:hidden"
            style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
            priority={index === 0}
          />

          {/* Desktop Image */}
          <Image
            src={slide.imageDesktop}
            alt={slide.headline || `Slide ${index + 1}`}
            fill
            className="hidden md:block"
            style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
            priority={index === 0}
          />

          {/* Content - Only show if showContent is true */}
          {slide.showContent && (
            <div className="relative z-20 container mx-auto md:px-16 h-full flex items-center">
              <div className="max-w-xl text-white">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fadeIn">
                  {slide.headline}
                </h1>
                <p className="text-lg md:text-xl mb-8 text-gray-200">
                  {slide.subtext}
                </p>
                <Link
                  href={slide.link}
                  className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                >
                  {slide.cta} →
                </Link>
              </div>
            </div>
          )}

          {/* Clickable link for slides without content */}
          {!slide.showContent && (
            <Link href={slide.link} className="absolute inset-0 z-10" />
          )}
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors"
      >
        <ChevronLeft className="text-white" size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors"
      >
        <ChevronRight className="text-white" size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? 'bg-pink-500' : 'bg-white/50'
              }`}
          />
        ))}
      </div>
    </section>
  );
}