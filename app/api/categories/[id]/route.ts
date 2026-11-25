import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import { Category, slugifyText } from '@/lib/models';
import { getSession } from '@/lib/auth';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();
    const body = await req.json();

    if (typeof body.slug === 'string' && body.slug.trim()) {
      body.slug = slugifyText(body.slug);
    } else if (body.name && !body.slug) {
      body.slug = slugifyText(body.name);
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, body, { new: true });
    if (!updatedCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/sitemap.xml');
    revalidatePath(`/products/${updatedCategory.slug || id}`);

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Category PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/sitemap.xml');

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Category DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
