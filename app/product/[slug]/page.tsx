import { Metadata } from 'next'
import connectToDatabase from '@/lib/db'
import { Product } from '@/lib/models'
import ProductDetailContent from './product-detail-content'
import ProductStructuredData from '@/components/seo/product-structured-data'

export const revalidate = 3600 // Revalidate every 1 hour

type Props = {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
  try {
    await connectToDatabase()
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug)
    const product = isObjectId
      ? await Product.findById(slug).populate('category brand').lean()
      : await Product.findOne({ slug }).populate('category brand').lean()

    return product ? JSON.parse(JSON.stringify(product)) : null
  } catch (err) {
    console.error('Error fetching product for SEO:', err)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const product = await getProduct(slug)
    
    if (!product) {
      const readableTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      return {
        title: `${readableTitle} | Marine Spare Parts | Corona Marine`,
        description: `Buy genuine ${readableTitle} marine spare parts from Alang Shipyard. Certified quality, worldwide shipping. Contact Corona Marine Parts for best prices.`,
      }
    }

    const brandName = product.brandName || (product.brand?.name) || ''
    const categoryName = product.category?.name || 'Marine Equipment'
    
    // Build SEO-optimized title with keywords
    // Pattern: "{Product} by {Brand} | {Category} | Buy Marine Spare Parts | Corona Marine"
    const titleParts = [product.title]
    if (brandName) titleParts.push(`by ${brandName}`)
    titleParts.push(categoryName)
    titleParts.push('Buy Marine Spare Parts Online')
    
    const title = product.metaTitle || titleParts.join(' | ')
    
    // Build SEO description with long-tail keywords
    const description = product.metaDescription || (product.description 
      ? (product.description.length > 155 
          ? product.description.substring(0, 152) + "..." 
          : product.description)
      : `Buy genuine ${product.title}${brandName ? ` by ${brandName}` : ''} from Alang Shipyard. ${categoryName} - certified, tested & shipped worldwide. Best price marine spare parts from Corona Marine Parts.`)

    const ogImage = product.image 
      ? (product.image.startsWith('http') ? product.image : `https://coronamarineparts.com${product.image}`)
      : 'https://coronamarineparts.com/hero-bg.webp'

    // Build keyword list from product data
    const keywords: string[] = [
      product.title,
      ...(product.keywords || []),
      categoryName,
      brandName,
      'marine spare parts',
      'ship spare parts',
      'Alang shipyard parts',
      'marine automation',
      `buy ${product.title}`,
      `${product.title} price`,
      `${product.title} supplier`,
      'marine equipment supplier',
      'Corona Marine Parts',
    ].filter(Boolean)

    return {
      title,
      description,
      keywords: keywords,
      alternates: {
        canonical: `https://coronamarineparts.com/product/${slug}`,
      },
      openGraph: {
        title: `${product.title}${brandName ? ` by ${brandName}` : ''} | ${categoryName}`,
        description: description,
        images: [{
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${product.title} - ${categoryName} | Marine Spare Parts from Alang Shipyard`,
        }],
        url: `https://coronamarineparts.com/product/${slug}`,
        type: 'article',
        siteName: 'Corona Marine Parts',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.title} | ${categoryName} | Corona Marine Parts`,
        description: description,
        images: [ogImage],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    }
  } catch (error) {
    const readableTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    return {
      title: `${readableTitle} | Marine Spare Parts | Corona Marine`,
      description: `Buy genuine ${readableTitle} marine spare parts from Alang Shipyard. Certified quality, worldwide shipping. Contact Corona Marine Parts for best prices.`,
      keywords: [readableTitle, 'marine spare parts', 'ship spare parts', 'Alang shipyard'],
    }
  }
}

export async function generateStaticParams() {
  try {
    await connectToDatabase()
    const products = await Product.find({}, '_id slug').lean()
    return products.map((product: any) => ({
      slug: (product.slug || product._id.toString()) as string,
    }))
  } catch (error) {
    return []
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  return (
    <>
      {product && <ProductStructuredData product={product} slug={slug} />}
      <ProductDetailContent slug={slug} initialProduct={product} />
    </>
  );
}
