import { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'
import ProductDetailContent from './product-detail-content'
import ProductStructuredData from '@/components/seo/product-structured-data'
import { getProductBySlugOrId, getProducts } from '@/lib/catalog-data'

export const revalidate = 3600 // Revalidate every 1 hour

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  try {
    const product = await getProductBySlugOrId(slug)

    if (!product) {
      const readableTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      return {
        title: `${readableTitle} | Marine Spare Parts | Corona Marine`,
        description: `Buy genuine ${readableTitle} marine spare parts from Alang Shipyard. Certified quality, worldwide shipping. Contact Corona Marine Parts for best prices.`,
      }
    }

    const canonicalSlug = product.slug || slug
    const brandName = product.brandName || (product.brand?.name) || ''
    const categoryName = product.category?.name || 'Marine Equipment'

    const titleParts = [product.title]
    if (brandName) titleParts.push(`by ${brandName}`)
    titleParts.push(categoryName)
    titleParts.push('Corona Marine Parts')

    const title = product.metaTitle || titleParts.join(' | ')

    const description = product.metaDescription || (product.description
      ? (product.description.length > 155
          ? product.description.substring(0, 152) + "..."
          : product.description)
      : `Buy genuine ${product.title}${brandName ? ` by ${brandName}` : ''} from Alang Shipyard. ${categoryName} - certified, tested & shipped worldwide. Best price marine spare parts from Corona Marine Parts.`)

    const ogImage = product.image
      ? (product.image.startsWith('http') ? product.image : `https://coronamarineparts.com${product.image}`)
      : 'https://coronamarineparts.com/hero-bg.webp'

    const keywords: string[] = [
      product.primaryKeyword || '',
      product.title,
      ...(product.keywords || []),
      product.modelNumber || '',
      categoryName,
      brandName,
      'marine spare parts',
      'ship spare parts',
      'Alang shipyard parts',
      `buy ${product.title}`,
      'Corona Marine Parts',
    ].filter(Boolean)

    return {
      title,
      description,
      keywords,
      alternates: {
        canonical: `https://coronamarineparts.com/product/${canonicalSlug}`,
      },
      openGraph: {
        title,
        description,
        images: [{
          url: ogImage,
          width: 1200,
          height: 630,
          alt: product.imageAlt?.trim() || `${product.title} - ${categoryName} | Marine Spare Parts from Alang Shipyard`,
        }],
        url: `https://coronamarineparts.com/product/${canonicalSlug}`,
        type: 'article',
        siteName: 'Corona Marine Parts',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
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
    const products = await getProducts()
    return products.map((product: any) => ({
      slug: (product.slug || product._id.toString()) as string,
    }))
  } catch (error) {
    return []
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlugOrId(slug);

  if (product && product.slug && slug === product._id?.toString() && slug !== product.slug) {
    permanentRedirect(`/product/${product.slug}`);
  }

  let relatedProducts: any[] = [];
  if (product?.category?._id) {
    const sameCategory = await getProducts({ categoryId: product.category._id, limit: 8 });
    relatedProducts = sameCategory.filter((p: any) => p._id !== product._id).slice(0, 4);
  }

  const canonicalSlug = product?.slug || slug;

  return (
    <>
      {product && <ProductStructuredData product={product} slug={canonicalSlug} />}
      <ProductDetailContent
        slug={canonicalSlug}
        initialProduct={product}
        initialRelatedProducts={relatedProducts}
      />
    </>
  );
}
