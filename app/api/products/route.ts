import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import { Brand, Category, Product, slugifyText } from '@/lib/models';
import { getSession } from '@/lib/auth';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const featured = searchParams.get('featured');
    const q = searchParams.get('q');

    const { isValidObjectId } = await import('mongoose');

    const query: any = {};
    if (category) {
      if (isValidObjectId(category)) {
        query.category = category;
      } else {
        const foundCat = await Category.findOne({ slug: category });
        if (foundCat) {
          query.category = foundCat._id;
        } else {
          return NextResponse.json([]);
        }
      }
    }

    if (brand) {
      const decodedBrand = decodeURIComponent(brand);
      if (isValidObjectId(decodedBrand)) {
        const foundBrand = await Brand.findById(decodedBrand).lean();
        if (foundBrand && (foundBrand as any).name) {
          const brandRegex = new RegExp(`^${escapeRegex((foundBrand as any).name)}$`, 'i');
          query.$or = [{ brand: decodedBrand }, { brandName: brandRegex }];
        } else {
          query.brand = decodedBrand;
        }
      } else {
        const normalized = decodedBrand.replace(/-/g, ' ');
        const brandRegex = new RegExp(`^${escapeRegex(normalized)}$`, 'i');
        const matchingBrand = await Brand.findOne({ name: brandRegex }).lean();
        const orClauses: any[] = [
          { brandName: brandRegex },
          { brandName: new RegExp(`^${escapeRegex(decodedBrand)}$`, 'i') },
        ];
        if (matchingBrand) {
          orClauses.push({ brand: (matchingBrand as any)._id });
        }
        query.$or = orClauses;
      }
    }

    if (featured === 'true') query.featured = true;

    if (q && q.trim()) {
      const searchRegex = new RegExp(escapeRegex(q.trim()), 'i');
      const searchOr = [
        { title: searchRegex },
        { description: searchRegex },
        { brandName: searchRegex },
        { modelNumber: searchRegex },
        { sku: searchRegex },
        { primaryKeyword: searchRegex },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchOr }];
        delete query.$or;
      } else {
        query.$or = searchOr;
      }
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('brand', 'name')
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

    if (body.slug) {
      body.slug = slugifyText(body.slug);
    } else if (body.title) {
      body.slug = slugifyText(body.title);
    }

    const product = await Product.create(body);
    console.log('Product created successfully:', product._id);

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/brands');
    revalidatePath('/sitemap.xml');
    revalidatePath('/image-sitemap.xml');
    revalidatePath(`/product/${product.slug || product._id}`);

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
