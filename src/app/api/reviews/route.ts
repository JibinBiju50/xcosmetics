import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, customer_name, rating, comment } = body;

    if (!product_id || !customer_name || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id,
        customer_name,
        rating,
        comment,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating review:', error);
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Review API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}