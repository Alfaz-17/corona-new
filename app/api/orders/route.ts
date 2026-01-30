import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Order } from '@/lib/models';
import { getSession } from '@/lib/auth';
import { sendInquiryEmail } from '@/lib/email';

// Create new order (public)
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    
    const { customerName, customerPhone, customerEmail, items, notes } = body;
    
    if (!customerName || !customerPhone || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer name, phone, and at least one item are required' },
        { status: 400 }
      );
    }

    const order = await Order.create({
      customerName,
      customerPhone,
      customerEmail,
      items,
      notes,
      status: 'pending'
    });

    // Send notification email
    try {
      const productTitle = items[0]?.productTitle || 'Unknown Product';
      const quantity = items[0]?.quantity || 1;
      
      await sendInquiryEmail({
        customerName,
        customerPhone,
        customerEmail,
        productTitle,
        quantity,
        notes
      });
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // We don't fail the order if the email fails, but we log it
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Order POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Get all orders (admin only)
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const orders = await Order.find()
      .populate('items.product')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
