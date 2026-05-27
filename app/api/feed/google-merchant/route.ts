import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Product } from '@/lib/models'

// Google Merchant Center Product Feed
// Submit this URL to Google Merchant Center: https://coronamarineparts.com/api/feed/google-merchant
// This makes your products appear in Google Shopping tab and image search with product info
// This is how IndiaMART and eBay products appear in Google Shopping

export async function GET() {
  const baseUrl = 'https://coronamarineparts.com'

  try {
    await connectDB()
    const products = await Product.find({}).populate('category').populate('brand').lean()

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Corona Marine Parts - Marine Spare Parts</title>
    <link>${baseUrl}</link>
    <description>Genuine marine spare parts, automation systems, and ship machinery from Alang Shipyard</description>
`

    for (const product of products) {
      const p = product as any
      const slug = p.slug || p._id.toString()
      const brandName = p.brandName || p.brand?.name || 'Corona Marine Parts'
      const categoryName = p.category?.name || 'Marine Equipment'
      const imageUrl = p.image?.startsWith('http') ? p.image : `${baseUrl}${p.image}`
      const description = p.description
        ? escapeXml(p.description.substring(0, 5000))
        : escapeXml(`Genuine ${p.title} - ${categoryName} sourced from Alang Shipyard. Certified quality marine spare parts.`)

      // Determine availability
      let availability = 'in_stock'
      if (p.availability === 'out-of-stock') availability = 'out_of_stock'
      else if (p.availability === 'on-demand') availability = 'preorder'

      // Determine condition
      const condition = p.condition === 'new' ? 'new' : 'refurbished'

      xml += `    <item>
      <g:id>${escapeXml(p._id.toString())}</g:id>
      <g:title>${escapeXml(p.title)}</g:title>
      <g:description>${description}</g:description>
      <g:link>${baseUrl}/product/${slug}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
`
      // Add additional images
      if (p.images && Array.isArray(p.images)) {
        for (const img of p.images.slice(0, 10)) {
          const additionalImg = img.startsWith('http') ? img : `${baseUrl}${img}`
          xml += `      <g:additional_image_link>${escapeXml(additionalImg)}</g:additional_image_link>
`
        }
      }

      xml += `      <g:availability>${availability}</g:availability>
      <g:condition>${condition}</g:condition>
      <g:brand>${escapeXml(brandName)}</g:brand>
      <g:product_type>${escapeXml(categoryName)} &gt; Marine Spare Parts</g:product_type>
      <g:google_product_category>Vehicle Parts &amp; Accessories &gt; Watercraft Parts &amp; Accessories</g:google_product_category>
`

      // Only add price if it's real
      if (p.price && p.price > 0) {
        xml += `      <g:price>${p.price.toFixed(2)} USD</g:price>
`
      }

      // SKU/MPN
      if (p.sku) {
        xml += `      <g:mpn>${escapeXml(p.sku)}</g:mpn>
`
      }

      xml += `      <g:identifier_exists>false</g:identifier_exists>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard Shipping</g:service>
        <g:price>0 USD</g:price>
      </g:shipping>
    </item>
`
    }

    xml += `  </channel>
</rss>`

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Google Merchant feed error:', error)
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Error</title></channel></rss>`,
      { status: 500, headers: { 'Content-Type': 'application/xml' } }
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
