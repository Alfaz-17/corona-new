import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Product, Category, Blog, Brand, Order } from '@/lib/models';
import { getSession } from '@/lib/auth';
import { evaluateProductSeo } from '@/lib/seo-score';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const [products, categories, blogs, brandCount, orderCount] = await Promise.all([
      Product.find({})
        .select('title slug metaTitle metaDescription primaryKeyword keywords imageAlt description specifications brandName brand modelNumber sku')
        .populate('brand', 'name')
        .lean(),
      Category.find({}).select('name slug description').lean(),
      Blog.find({}).select('title slug metaTitle metaDescription').lean(),
      Brand.countDocuments(),
      Order.countDocuments(),
    ]);

    let missingPrimaryKeyword = 0;
    let missingMetaDescription = 0;
    let missingImageAlt = 0;
    let missingSpecs = 0;
    let missingSlug = 0;
    let needsOptimization = 0;
    let totalPercentage = 0;

    for (const p of products as any[]) {
      const report = evaluateProductSeo(p);
      totalPercentage += report.percentage;
      if (report.percentage < 85) needsOptimization++;

      const checksById = Object.fromEntries(report.checks.map((c) => [c.id, c.passed]));
      if (!checksById.primaryKeyword) missingPrimaryKeyword++;
      if (!checksById.metaDescription) missingMetaDescription++;
      if (!checksById.imageAlt) missingImageAlt++;
      if (!checksById.specs) missingSpecs++;
      if (!checksById.slug) missingSlug++;
    }

    const totalProducts = products.length;
    const categoryMissingSlug = (categories as any[]).filter((c) => !c.slug || /^[0-9a-fA-F]{24}$/.test(c.slug)).length;
    const categoryMissingDesc = (categories as any[]).filter((c) => !c.description?.trim()).length;
    const blogMissingMeta = (blogs as any[]).filter((b) => !b.slug || !b.metaTitle?.trim() || !b.metaDescription?.trim()).length;

    return NextResponse.json({
      products: totalProducts,
      categories: categories.length,
      blogs: blogs.length,
      brands: brandCount,
      orders: orderCount,
      seoHealth: {
        averagePercentage: totalProducts > 0 ? Math.round(totalPercentage / totalProducts) : 100,
        optimizedCount: totalProducts - needsOptimization,
        needsOptimization,
        missingPrimaryKeyword,
        missingMetaDescription,
        missingImageAlt,
        missingSpecs,
        missingSlug,
        categoryMissingSlug,
        categoryMissingDesc,
        blogMissingMeta,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
