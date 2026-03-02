import { MetadataRoute } from 'next'
import api from '@/lib/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://coronamarineparts.com'
  
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/brands`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  try {
    // Dynamic Product routes
    const { data: products } = await api.get('/products')
    const productRoutes = products.map((p: any) => ({
      url: `${baseUrl}/product/${p.slug || p._id}`,
      lastModified: new Date(p.updatedAt || new Date()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    // Dynamic Blog routes
    const { data: blogs } = await api.get('/blogs')
    const blogRoutes = blogs.map((b: any) => ({
      url: `${baseUrl}/blog/${b.slug || b._id}`,
      lastModified: new Date(b.date || new Date()),
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

    return [...staticRoutes, ...productRoutes, ...blogRoutes]
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return staticRoutes
  }
}
