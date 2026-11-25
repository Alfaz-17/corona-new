import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Product, slugifyText } from '@/lib/models';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { isValidObjectId } from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    let product;
    if (isValidObjectId(id)) {
      product = await Product.findById(id).populate('category brand');
    } else {
      product = await Product.findOne({ slug: id }).populate('category brand');
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product GET error:', error);
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

    let deletedProduct;
    if (isValidObjectId(id)) {
      deletedProduct = await Product.findByIdAndDelete(id);
    } else {
      deletedProduct = await Product.findOneAndDelete({ slug: id });
    }

    if (!deletedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/sitemap.xml');
    revalidatePath('/image-sitemap.xml');
    revalidatePath(`/product/${deletedProduct.slug || id}`);

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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

    if (typeof body.slug === 'string') {
      if (body.slug.trim()) {
        body.slug = slugifyText(body.slug);
      } else if (body.title) {
        body.slug = slugifyText(body.title);
      } else {
        delete body.slug;
      }
    }

    let updatedProduct;
    if (isValidObjectId(id)) {
      updatedProduct = await Product.findByIdAndUpdate(id, body, { new: true });
    } else {
      updatedProduct = await Product.findOneAndUpdate({ slug: id }, body, { new: true });
    }

    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/brands');
    revalidatePath('/sitemap.xml');
    revalidatePath('/image-sitemap.xml');
    revalidatePath(`/product/${updatedProduct.slug || id}`);

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Product PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
