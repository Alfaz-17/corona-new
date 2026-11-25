import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import { Brand } from '@/lib/models';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    await connectToDatabase();
    const brands = await Brand.find({}).sort({ name: 1 }).lean();
    return NextResponse.json(brands, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Brands GET error:', error);
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
    const brand = await Brand.create(body);

    revalidatePath('/');
    revalidatePath('/brands');
    revalidatePath('/sitemap.xml');
    revalidatePath(`/brand/${encodeURIComponent(brand.name)}`);

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Brands POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
