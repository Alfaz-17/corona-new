
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Product } from '@/lib/models';
import { isValidObjectId } from 'mongoose';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userName, rating, comment } = await req.json();

    if (!userName || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();
    
    let product;
    if (isValidObjectId(id)) {
      product = await Product.findById(id);
    } else {
      product = await Product.findOne({ slug: id });
    }
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Add review
    product.reviews.push({
      userName,
      rating,
      comment,
      date: new Date(),
      isVerified: false // Admin can verify later
    });

    await product.save();

    return NextResponse.json({ message: 'Review added successfully', product });
  } catch (error) {
    console.error('Review POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
