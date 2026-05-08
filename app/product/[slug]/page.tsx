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

    const title = product.metaTitle || `${product.title} | Marine Spare Parts & Automation | Corona Marine`
    const description = product.metaDescription || (product.description 
      ? (product.description.length > 160 ? product.description.substring(0, 157) + "..." : product.description)
      : `Purchase genuine ${product.title} from Alang Shipyard. Certified refurbished marine machinery and automation spare parts with worldwide shipping.`)

    const ogImage = product.image.startsWith('http') ? product.image : `https://coronamarineparts.com${product.image}`

    return {
      title,
      description,
      alternates: {
        canonical: `https://coronamarineparts.com/product/${slug}`,
      },
      openGraph: {
        title: product.title,
        description: description,
        images: [{
          url: ogImage,
          width: 1200,
          height: 630,
          alt: product.title,
        }],
        url: `https://coronamarineparts.com/product/${slug}`,
        type: 'article',
        siteName: 'Corona Marine Parts',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.title,
        description: description,
        images: [ogImage],
      }
    }
  } catch (error) {
    return {
      title: `Marine Spare Part - ${slug.replace(/-/g, ' ')} | Corona Marine`,
      description: 'Genuine marine machinery components and automation spare parts from Alang Shipyard.',
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
