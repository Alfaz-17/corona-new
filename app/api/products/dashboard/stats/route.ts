
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Product, Category, Blog, Brand, Order } from '@/lib/models';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const [productCount, categoryCount, blogCount, brandCount, orderCount] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Blog.countDocuments(),
      Brand.countDocuments(),
      Order.countDocuments(),
    ]);

    return NextResponse.json({
      products: productCount,
      categories: categoryCount,
      blogs: blogCount,
      brands: brandCount,
      orders: orderCount
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
