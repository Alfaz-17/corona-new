import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import { Blog, Category, Product, slugifyText } from '@/lib/models';
import { getSession } from '@/lib/auth';

async function runSlugMigration() {
  await connectToDatabase();

  const products = await Product.find({});
  let productCount = 0;
  for (const product of products) {
    const needsFix = !product.slug || product.slug.length < 5 || /^[0-9a-fA-F]{24}$/.test(product.slug);
    if (needsFix && product.title) {
      let baseSlug = slugifyText(product.title);
      if (!baseSlug) baseSlug = product._id.toString();
      const existing = await Product.findOne({ slug: baseSlug, _id: { $ne: product._id } }).lean();
      product.slug = existing ? `${baseSlug}-${product._id.toString().slice(-4)}` : baseSlug;
      await product.save();
      productCount++;
    }
  }

  const categories = await Category.find({});
  let categoryCount = 0;
  for (const cat of categories) {
    const needsFix = !cat.slug || cat.slug.length < 2 || /^[0-9a-fA-F]{24}$/.test(cat.slug);
    if (needsFix && cat.name) {
      let baseSlug = slugifyText(cat.name);
      if (!baseSlug) baseSlug = cat._id.toString();
      const existing = await Category.findOne({ slug: baseSlug, _id: { $ne: cat._id } }).lean();
      cat.slug = existing ? `${baseSlug}-${cat._id.toString().slice(-4)}` : baseSlug;
      await cat.save();
      categoryCount++;
    }
  }

  const blogs = await Blog.find({});
  let blogCount = 0;
  for (const blog of blogs) {
    const needsFix = !blog.slug || blog.slug.length < 3 || /^[0-9a-fA-F]{24}$/.test(blog.slug);
    if (needsFix && blog.title) {
      let baseSlug = slugifyText(blog.title);
      if (!baseSlug) baseSlug = blog._id.toString();
      const existing = await Blog.findOne({ slug: baseSlug, _id: { $ne: blog._id } }).lean();
      blog.slug = existing ? `${baseSlug}-${blog._id.toString().slice(-4)}` : baseSlug;
      await blog.save();
      blogCount++;
    }
  }

  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/blog');
  revalidatePath('/sitemap.xml');
  revalidatePath('/image-sitemap.xml');

  return {
    message: `Migrated ${productCount} products, ${categoryCount} categories, and ${blogCount} blogs.`,
    productCount,
    categoryCount,
    blogCount,
  };
}

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await runSlugMigration();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await runSlugMigration();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
