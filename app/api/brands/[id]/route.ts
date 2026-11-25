import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import { Brand } from '@/lib/models';
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
    const updatedBrand = await Brand.findByIdAndUpdate(id, body, { new: true });

    if (!updatedBrand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    revalidatePath('/');
    revalidatePath('/brands');
    revalidatePath('/sitemap.xml');
    revalidatePath(`/brand/${encodeURIComponent(updatedBrand.name)}`);

    return NextResponse.json(updatedBrand);
  } catch (error) {
    console.error('Brand PUT error:', error);
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
    const deletedBrand = await Brand.findByIdAndDelete(id);

    if (!deletedBrand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    revalidatePath('/');
    revalidatePath('/brands');
    revalidatePath('/sitemap.xml');

    return NextResponse.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Brand DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
