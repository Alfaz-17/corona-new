import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/checkout', '/account', '/cart', '/api/'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
    ],
    sitemap: [
      'https://coronamarineparts.com/sitemap.xml',
      'https://coronamarineparts.com/image-sitemap.xml',
    ],
  }
}
