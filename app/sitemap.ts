import { MetadataRoute } from 'next'
import connectToDatabase from '@/lib/db'
import { Product, Category, Blog, Brand } from '@/lib/models'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://coronamarineparts.com'
  
  // Static routes with SEO-optimized priorities
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/brands`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  try {
    await connectToDatabase()

    // 1. Dynamic Product routes - highest priority for e-commerce SEO
    const products = await Product.find({}, '_id slug updatedAt').lean()
    const productRoutes: MetadataRoute.Sitemap = products.map((p: any) => ({
      url: `${baseUrl}/product/${p.slug || p._id}`,
      lastModified: new Date(p.updatedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }))

    // 2. Dynamic Category routes - key for category keyword searches
    const categories = await Category.find({}, '_id slug updatedAt').lean()
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c: any) => ({
      url: `${baseUrl}/products/${c.slug || c._id}`,
      lastModified: new Date(c.updatedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.88,
    }))

    // 3. Dynamic Blog routes
    const blogs = await Blog.find({}, '_id slug date updatedAt').lean()
    const blogRoutes: MetadataRoute.Sitemap = blogs.map((b: any) => ({
      url: `${baseUrl}/blog/${b.slug || b._id}`,
      lastModified: new Date(b.date || b.updatedAt || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.65,
    }))

    // 4. Dynamic Brand routes
    const brands = await Brand.find({}, 'name updatedAt').lean()
    const brandRoutes: MetadataRoute.Sitemap = brands.map((b: any) => ({
      url: `${baseUrl}/brand/${encodeURIComponent(b.name)}`,
      lastModified: new Date(b.updatedAt || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes, ...brandRoutes]
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return staticRoutes
  }
}
