import { createServerSupabaseClient } from '@/lib/supabase-server';
import ProductsClient from './ProductsClient';
import { Product } from '@/types';

interface PageProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

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

  const products = data || [];
  
  // Override face cream images
  const faceCream = products.find(p => p.slug === 'face-cream');
  if (faceCream) {
    faceCream.image_url = '/images/face_cream_creamx/cream_img1.PNG';
    faceCream.original_price = 899;
    faceCream.offer_price = 1; // Temporary for testing
    faceCream.images = [
      '/images/face_cream_creamx/cream_img2.JPG',
      '/images/face_cream_creamx/cream_img3.JPG',
      '/images/face_cream_creamx/cream_img4.JPG'
    ];
  }

  // Override face cream combo images
  const faceCreamCombo = products.find(p => p.slug === 'combo-face-cream-offer');
  if (faceCreamCombo) {
    faceCreamCombo.image_url = '/images/combo/combo1.PNG';
    faceCreamCombo.original_price = 1699;
    faceCreamCombo.offer_price = 1499;
    faceCreamCombo.images = [
      '/images/combo/combo2.PNG'
    ];
  }

  return products;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const products = await getProducts();
  const params = await searchParams;

  return (
    <ProductsClient 
      products={products} 
      initialCategory={params.category}
      initialSearch={params.search}
    />
  );
}