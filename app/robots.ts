import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/checkout', '/account', '/cart'],
    },
    sitemap: 'https://coronamarineparts.com/sitemap.xml',
  }
}
