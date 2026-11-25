import connectToDatabase from '@/lib/db';
import { Blog, Brand, Category, Product } from '@/lib/models';

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function getCategories() {
  try {
    await connectToDatabase();
    const categories = await Category.find({}).sort({ name: 1 }).lean();
    return serialize(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getCategoryBySlugOrId(slugOrId: string) {
  try {
    await connectToDatabase();
    const decoded = decodeURIComponent(slugOrId);
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(decoded);
    const category = isObjectId
      ? await Category.findById(decoded).lean()
      : await Category.findOne({ slug: decoded }).lean();
    if (category) return serialize(category);

    const allCategories = await Category.find({}).lean();
    const matched = allCategories.find(
      (c: any) => c.name?.toLowerCase().replace(/\s+/g, '-') === decoded.toLowerCase()
    );
    return matched ? serialize(matched) : null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

export async function getProducts(options?: {
  categoryId?: string;
  featured?: boolean;
  limit?: number;
}) {
  try {
    await connectToDatabase();
    const query: Record<string, any> = {};
    if (options?.categoryId) query.category = options.categoryId;
    if (options?.featured) query.featured = true;

    let cursor = Product.find(query)
      .populate('category', 'name slug')
      .populate('brand', 'name')
      .sort({ createdAt: -1 });

    if (options?.limit) {
      cursor = cursor.limit(options.limit);
    }

    const products = await cursor.lean();
    return serialize(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getFeaturedProductsOrLatest(limit = 8) {
  const featured = await getProducts({ featured: true, limit });
  if (featured.length > 0) return featured;
  return getProducts({ limit });
}

export async function getProductBySlugOrId(slugOrId: string) {
  try {
    await connectToDatabase();
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slugOrId);
    const product = isObjectId
      ? await Product.findById(slugOrId).populate('category brand').lean()
      : await Product.findOne({ slug: slugOrId }).populate('category brand').lean();
    return product ? serialize(product) : null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function getBrands() {
  try {
    await connectToDatabase();
    const brands = await Brand.find({}).sort({ name: 1 }).lean();
    return serialize(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
}

export async function getBrandInfoAndProducts(brandParam: string) {
  try {
    await connectToDatabase();
    const decoded = decodeURIComponent(brandParam);
    const normalized = decoded.replace(/-/g, ' ');
    const brands = await Brand.find({}).lean();

    const targetBrand = brands.find(
      (b: any) =>
        b._id.toString() === brandParam ||
        b.name?.toLowerCase() === decoded.toLowerCase() ||
        b.name?.toLowerCase().replace(/\s+/g, '-') === brandParam.toLowerCase() ||
        b.name?.toLowerCase() === normalized.toLowerCase()
    );

    const searchName = (targetBrand as any)?.name || normalized;
    const brandNameRegex = new RegExp(`^${escapeRegex(searchName)}$`, 'i');

    const orConditions: Record<string, any>[] = [{ brandName: brandNameRegex }];
    if (targetBrand) {
      orConditions.push({ brand: (targetBrand as any)._id });
    }

    const products = await Product.find({ $or: orConditions })
      .populate('category', 'name slug')
      .populate('brand', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return {
      brandInfo: targetBrand ? serialize(targetBrand) : null,
      products: serialize(products),
    };
  } catch (error) {
    console.error('Error fetching brand products:', error);
    return { brandInfo: null, products: [] };
  }
}

export async function getBlogs() {
  try {
    await connectToDatabase();
    const blogs = await Blog.find({}).sort({ date: -1 }).lean();
    return serialize(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
}

export async function getBlogBySlugOrId(slugOrId: string) {
  try {
    await connectToDatabase();
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slugOrId);
    const blog = isObjectId
      ? await Blog.findById(slugOrId).lean()
      : await Blog.findOne({ slug: slugOrId }).lean();
    return blog ? serialize(blog) : null;
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
}
