import { MetadataRoute } from 'next'
import api from '@/lib/api'

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
    // Dynamic Product routes - high priority for e-commerce SEO
    const { data: products } = await api.get('/products')
    const productRoutes: MetadataRoute.Sitemap = products.map((p: any) => ({
      url: `${baseUrl}/product/${p.slug || p._id}`,
      lastModified: new Date(p.updatedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }))

    // Dynamic Blog routes
    const { data: blogs } = await api.get('/blogs')
    const blogRoutes: MetadataRoute.Sitemap = blogs.map((b: any) => ({
      url: `${baseUrl}/blog/${b.slug || b._id}`,
      lastModified: new Date(b.date || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.65,
    }))

    // Dynamic Category routes - CRITICAL for SEO
    // Category landing pages rank for keywords like "marine automation parts", "ship engine spares"
    const { data: categories } = await api.get('/categories')
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c: any) => ({
      url: `${baseUrl}/products/${c.slug || c._id}`,
      lastModified: new Date(c.updatedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.88, // Very high - category pages are key for ranking
    }))

    // Dynamic Brand routes
    let brandRoutes: MetadataRoute.Sitemap = []
    try {
      const { data: brands } = await api.get('/brands')
      brandRoutes = brands.map((b: any) => ({
        url: `${baseUrl}/brand/${encodeURIComponent(b.name)}`,
        lastModified: new Date(b.updatedAt || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    } catch (e) {
      // Brands may not have a listing endpoint
    }

    return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes, ...brandRoutes]
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return staticRoutes
  }
}
