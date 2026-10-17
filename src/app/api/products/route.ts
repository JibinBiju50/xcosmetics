import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient, createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    return NextResponse.json({ products: products || [] });
  } catch (error) {
    console.error('Products API GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify admin authentication
    const supabaseUser = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      category,
      description,
      benefits,
      usage,
      original_price,
      offer_price,
      image_url,
      images,
      is_combo,
      in_stock,
    } = body;

    // Validate required fields
    if (!name || !slug || !category || original_price === undefined || offer_price === undefined) {
      return NextResponse.json(
        { error: 'Name, Product URL Link (slug), Category, Original Price, and Offer Price are required' },
        { status: 400 }
      );
    }

    // Clean and validate slug
    const cleanSlug = String(slug)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!cleanSlug) {
      return NextResponse.json(
        { error: 'A valid Product URL Link (slug) is required' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminSupabaseClient();

    // Check if slug already exists
    const { data: existingProduct } = await adminSupabase
      .from('products')
      .select('id')
      .eq('slug', cleanSlug)
      .maybeSingle();

    if (existingProduct) {
      return NextResponse.json(
        { error: `A product with URL Link "${cleanSlug}" already exists. Please choose a different link.` },
        { status: 409 }
      );
    }

    // Insert new product
    const { data: newProduct, error: insertError } = await adminSupabase
      .from('products')
      .insert({
        name: String(name).trim(),
        slug: cleanSlug,
        category: category || 'skincare',
        description: description || '',
        benefits: Array.isArray(benefits) ? benefits.filter(Boolean) : [],
        usage: usage || '',
        original_price: Number(original_price),
        offer_price: Number(offer_price),
        image_url: image_url || '/images/placeholder.jpg',
        images: Array.isArray(images) ? images.filter(Boolean) : [],
        is_combo: Boolean(is_combo),
        in_stock: in_stock !== undefined ? Boolean(in_stock) : true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting product:', insertError);
      return NextResponse.json({ error: 'Failed to create product in database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Products API POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
