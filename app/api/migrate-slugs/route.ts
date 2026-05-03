
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Product } from '@/lib/models';

export async function GET() {
  try {
    await connectToDatabase();
    
    // 1. Migrate Products
    const products = await Product.find({});
    let productCount = 0;
    for (const product of products) {
      const needsFix = !product.slug || product.slug.length < 5 || /^[0-9a-fA-F]{24}$/.test(product.slug);
      if (needsFix) {
        product.slug = product.title.toLowerCase().trim().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
        await product.save();
        productCount++;
      }
    }

    // 2. Migrate Categories
    const { Category } = await import('@/lib/models');
    const categories = await Category.find({});
    let categoryCount = 0;
    for (const cat of categories) {
      const needsFix = !cat.slug || cat.slug.length < 3 || /^[0-9a-fA-F]{24}$/.test(cat.slug);
      if (needsFix) {
        cat.slug = cat.name.toLowerCase().trim().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
        await cat.save();
        categoryCount++;
      }
    }

    return NextResponse.json({ 
      message: `Migrated ${productCount} products and ${categoryCount} categories.`,
      productCount,
      categoryCount
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
