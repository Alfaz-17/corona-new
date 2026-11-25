import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Product } from '@/lib/models'

// Image Sitemap - This is how IndiaMART/eBay get product images indexed in Google Images
// Accessible at: /image-sitemap.xml/

export async function GET() {
  const baseUrl = 'https://coronamarineparts.com'

  try {
    await connectDB()
    const products = await Product.find({}).populate('category').populate('brand').lean()

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`

    for (const product of products) {
      const slug = (product as any).slug || (product as any)._id.toString()
      const productUrl = `${baseUrl}/product/${slug}`
      const brandName = (product as any).brandName || ((product as any).brand?.name) || ''
      const categoryName = (product as any).category?.name || 'Marine Equipment'

      // Keyword-rich image title and caption - critical for Google Image ranking
      const imageTitle = (product as any).imageAlt?.trim() || `${(product as any).title}${brandName ? ` by ${brandName}` : ''} - ${categoryName} | Marine Spare Parts from Alang Shipyard`
      const imageCaption = (product as any).description
        ? (product as any).description.substring(0, 250)
        : `Buy genuine ${(product as any).title} marine spare parts sourced from Alang Shipyard. ${categoryName} - tested, certified, and shipped worldwide by Corona Marine Parts.`

      // Collect all images
      const allImages: string[] = []
      if ((product as any).image) {
        const img = (product as any).image
        allImages.push(img.startsWith('http') ? img : `${baseUrl}${img}`)
      }
      if ((product as any).images && Array.isArray((product as any).images)) {
        for (const img of (product as any).images) {
          allImages.push(img.startsWith('http') ? img : `${baseUrl}${img}`)
        }
      }

      if (allImages.length > 0) {
        xml += `  <url>
    <loc>${escapeXml(productUrl)}</loc>
`
        for (const imgUrl of allImages) {
          xml += `    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${escapeXml(imageTitle)}</image:title>
      <image:caption>${escapeXml(imageCaption)}</image:caption>
      <image:geo_location>Alang, Gujarat, India</image:geo_location>
    </image:image>
`
        }
        xml += `  </url>
`
      }
    }

    xml += `</urlset>`

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Image sitemap generation error:', error)
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { headers: { 'Content-Type': 'application/xml' } }
    )
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
