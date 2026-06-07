'use client';

import { useEffect, useRef } from 'react';
import { trackPurchase } from '@/lib/pixel';

interface PurchaseTrackerProps {
  contentIds: string[];
  numItems: number;
  value: number;
}

/**
 * Invisible client component that fires the Meta Pixel Purchase event
 * exactly once when the order confirmation page renders.
 */
export default function PurchaseTracker({
  contentIds,
  numItems,
  value,
}: PurchaseTrackerProps) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (!hasFired.current) {
      trackPurchase({
        content_ids: contentIds,
        num_items: numItems,
        value,
      });
      hasFired.current = true;
    }
  }, [contentIds, numItems, value]);

  return null; // renders nothing — purely for tracking
}
