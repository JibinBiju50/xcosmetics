import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import AdminDashboardClient from './adminDashboardClient';

async function getOrders() {
  const supabase = await createServerSupabaseClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/admin/login');
  }

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (ordersError) {
    console.error('Error fetching orders:', ordersError);
  }

  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (reviewsError) {
    console.error('Error fetching reviews:', reviewsError);
  }

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name');

  if (productsError) {
    console.error('Error fetching products:', productsError);
  }

  return {
    orders: orders || [],
    reviews: reviews || [],
    products: products || []
  };
}

export default async function AdminPage() {
  const { orders, reviews, products } = await getOrders();

  return <AdminDashboardClient orders={orders} reviews={reviews} products={products} />;
}