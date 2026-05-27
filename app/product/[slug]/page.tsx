import { Metadata } from 'next'
import api from "@/lib/api"
import ProductDetailContent from './product-detail-content'
import ProductStructuredData from '@/components/seo/product-structured-data'

export const revalidate = 3600 // Revalidate every 1 hour

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const { data: product } = await api.get(`/products/${slug}`)
    
    if (!product) {
      return {
        title: 'Product Not Found',
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

    const ogImage = product.image.startsWith('http') ? product.image : `https://coronamarineparts.com${product.image}`

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
    // Even error fallback should have good SEO
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
    const { data: products } = await api.get('/products')
    return products.map((product: any) => ({
      slug: product.slug || product._id,
    }))
  } catch (error) {
    return []
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  
  try {
    const { data: product } = await api.get(`/products/${slug}`);
    
    if (!product) return <ProductDetailContent slug={slug} />;

    return (
      <>
        <ProductStructuredData product={product} slug={slug} />
        <ProductDetailContent slug={slug} />
      </>
    );
  } catch (err) {
    return <ProductDetailContent slug={slug} />;
  }
}
