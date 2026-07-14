'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Clock } from 'lucide-react';

export default function OfferBanner() {
  const pathname = usePathname();
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number } | null>(null);

  // Only show on homepage and product pages
  const shouldShow = pathname === '/' || pathname?.startsWith('/products');

  useEffect(() => {
    if (!shouldShow) return;

    // Initialize timer
    const getEndTime = () => {
      const stored = localStorage.getItem('offerEndTime');
      if (stored) {
        const endTime = parseInt(stored, 10);
        if (endTime > Date.now()) {
          return endTime;
        }
      }
      // Set new 30-minute timer
      const newEndTime = Date.now() + 30 * 60 * 1000;
      localStorage.setItem('offerEndTime', newEndTime.toString());
      return newEndTime;
    };

    const endTime = getEndTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0 });
      } else {
        const minutes = Math.floor(diff / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [shouldShow]);

  if (!shouldShow || !timeLeft) return null;

  return (
    <div className="flex flex-col relative z-50">
      {/* Main Timer Banner */}
      <div className="bg-yellow-50 border-b border-yellow-100">
        <div className="container mx-auto px-4 py-3 gap-2 flex items-center justify-center max-w-4xl">
          <div className="flex flex-col text-left">
            <span className="text-xl md:text-2xl font-extrabold text-yellow-900 uppercase leading-none">
              Hurry Up
            </span>
            <span className="text-xs md:text-sm font-semibold text-yellow-800 uppercase tracking-wide mt-1">
              Offers end in
            </span>
          </div>
          <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-yellow-200 shadow-sm">
            <Clock size={24} className="text-yellow-700" />
            <span className="text-2xl md:text-3xl font-bold text-yellow-900 tabular-nums leading-none">
              {timeLeft.minutes.toString().padStart(2, '0')}:
              {timeLeft.seconds.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Scrolling Ticker Banner */}
      <div className="bg-pink-600 text-white text-xs font-semibold py-1.5 overflow-hidden flex whitespace-nowrap shadow-md">
        <div 
          className="flex gap-8"
          style={{ animation: 'marquee 30s linear infinite' }}
        >
          {/* Duplicate the items for seamless infinite scroll */}
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex gap-8">
              <span>✨ LIMITED TIME OFFER - ORDER NOW ✨</span>
              <span>✨ FLAT 17% OFF ON FACE CREAM ✨</span>
              <span>✨ EXCLUSIVE DEALS ON COMBOS ✨</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
