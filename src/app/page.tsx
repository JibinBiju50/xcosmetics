import { createServerSupabaseClient } from '@/lib/supabase-server';
import HeroCarousel from '@/components/home/HeroCarousel';
import BestDeals from '@/components/home/BestDeals';
import ComboSection from '@/components/home/ComboSection';
import BluuSection from '@/components/home/BluuSection';
import FeedbackSection from '@/components/home/FeedbackSection';
import { Product } from '@/types';

async function getProducts(): Promise<Product[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('in_stock', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
}

export default async function HomePage() {
  const products = await getProducts();

  // Get SINGLE products (non-combo) with highest discounts for "Best Deals"
  const singleProducts = products.filter(p => !p.is_combo);
  const bestDeals = [...singleProducts].sort((a, b) => {
    const discountA = ((a.original_price - a.offer_price) / a.original_price) * 100;
    const discountB = ((b.original_price - b.offer_price) / b.original_price) * 100;
    return discountB - discountA;
  }).slice(0, 6); // Get top 6

  return (
    <>
      <HeroCarousel />
      <BestDeals products={bestDeals} />
      <ComboSection />
      <BluuSection />
      <FeedbackSection />
    </>
  );
}