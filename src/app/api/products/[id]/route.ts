import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient, createServerSupabaseClient } from '@/lib/supabase-server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Verify admin authentication
    const supabaseUser = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const adminSupabase = createAdminSupabaseClient();

    // Build update object only with defined fields
    const updates: Record<string, any> = {};

    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.slug !== undefined) {
      const cleanSlug = String(body.slug)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // Check if new slug conflicts with another product
      const { data: conflictProduct } = await adminSupabase
        .from('products')
        .select('id')
        .eq('slug', cleanSlug)
        .neq('id', id)
        .maybeSingle();

      if (conflictProduct) {
        return NextResponse.json(
          { error: `Product URL Link "${cleanSlug}" is already taken by another product.` },
          { status: 409 }
        );
      }
      updates.slug = cleanSlug;
    }
    if (body.category !== undefined) updates.category = body.category;
    if (body.description !== undefined) updates.description = body.description;
    if (body.benefits !== undefined) {
      updates.benefits = Array.isArray(body.benefits) ? body.benefits.filter(Boolean) : [];
    }
    if (body.usage !== undefined) updates.usage = body.usage;
    if (body.original_price !== undefined) updates.original_price = Number(body.original_price);
    if (body.offer_price !== undefined) updates.offer_price = Number(body.offer_price);
    if (body.image_url !== undefined) updates.image_url = body.image_url;
    if (body.images !== undefined) {
      updates.images = Array.isArray(body.images) ? body.images.filter(Boolean) : [];
    }
    if (body.is_combo !== undefined) updates.is_combo = Boolean(body.is_combo);
    if (body.in_stock !== undefined) updates.in_stock = Boolean(body.in_stock);

    const { data: updatedProduct, error: updateError } = await adminSupabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating product:', updateError);
      return NextResponse.json({ error: 'Failed to update product in database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Product API PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Verify admin authentication
    const supabaseUser = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminSupabaseClient();

    const { error: deleteError } = await adminSupabase
      .from('products')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting product:', deleteError);
      return NextResponse.json({ error: 'Failed to delete product from database' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product API DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
