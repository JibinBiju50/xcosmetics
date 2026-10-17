import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient, createServerSupabaseClient } from '@/lib/supabase-server';

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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate that the uploaded file is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files (JPEG, PNG, WebP, GIF) are allowed' },
        { status: 400 }
      );
    }

    // Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminSupabaseClient();

    // 2. Ensure the 'products' bucket exists in Supabase Storage
    const { data: buckets } = await adminSupabase.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === 'products');
    if (!bucketExists) {
      await adminSupabase.storage.createBucket('products', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
      });
    }

    // 3. Generate a clean unique file name
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const cleanBaseName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const fileName = `${Date.now()}_${cleanBaseName}.${ext}`;
    const filePath = `catalog/${fileName}`;

    // 4. Upload buffer to Supabase Storage
    const { error: uploadError } = await adminSupabase.storage
      .from('products')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload image to storage' }, { status: 500 });
    }

    // 5. Get public URL
    const {
      data: { publicUrl },
    } = adminSupabase.storage.from('products').getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
