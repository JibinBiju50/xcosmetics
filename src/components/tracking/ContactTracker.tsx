'use client';

import { useEffect, useRef } from 'react';
import { trackContact } from '@/lib/pixel';

/**
 * Invisible client component that fires the Meta Pixel Contact event
 * once when the contact page renders.
 */
export default function ContactTracker() {
  const hasFired = useRef(false);

  useEffect(() => {
    if (!hasFired.current) {
      trackContact();
      hasFired.current = true;
    }
  }, []);

  return null;
}
