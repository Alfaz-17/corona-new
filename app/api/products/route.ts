
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Product } from '@/lib/models';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const featured = searchParams.get('featured');

    const query: any = {};
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (featured === 'true') query.featured = true;

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .lean();
      
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    
    const product = await Product.create(body);
    console.log('Product created successfully:', product._id);
    
    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Products POST error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      errors: error.errors,
      stack: error.stack
    });
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error',
      detail: error.errors || error.stack || 'No detail available'
    }, { status: 500 });
  }
}
