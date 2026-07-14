import { createServerSupabaseClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import { Product, Review } from '@/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  const product = data;
  if (product && product.slug === 'face-cream') {
    product.image_url = '/images/face_cream_creamx/cream_img1.PNG';
    product.original_price = 899;
    product.offer_price = 720;
    product.images = [
      '/images/face_cream_creamx/cream_img2.JPG',
      '/images/face_cream_creamx/cream_img3.JPG',
      '/images/face_cream_creamx/cream_img4.JPG'
    ];
    product.description = `Clears pimples, acne, dark spots & open pores
Restores a clear, smooth & glowing complexion
Enhances skin tone for bright
Provides a complete skincare solution for daily care

Reveal your natural glow & confidence — every single day!

Our cream has the best solution for,
▪️ skin brightness 
▪️ acnes
▪️ pimples
▪️ dark spots 
▪️ dark circles 
▪️ anti pigmentation 
▪️ open pores`;
  }

  if (product && product.slug === 'combo-face-cream-offer') {
    product.image_url = '/images/combo/combo1.PNG';
    product.original_price = 1699;
    product.offer_price = 1499;
    product.images = [
      '/images/combo/combo2.PNG'
    ];
  }

  return product;
}

async function getReviews(productId: string): Promise<Review[]> {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }

  return data || [];
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const reviews = await getReviews(product.id);

  return <ProductDetailClient product={product} reviews={reviews} />;
}