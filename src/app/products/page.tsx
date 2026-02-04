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

  return data || [];
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