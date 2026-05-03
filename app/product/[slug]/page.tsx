import { Metadata } from 'next'
import api from "@/lib/api"
import ProductDetailContent from './product-detail-content'
import ProductStructuredData from '@/components/seo/product-structured-data'

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

    const title = product.metaTitle || `${product.title} - Marine Spare Parts & Automation`
    const description = product.metaDescription || (product.description 
      ? (product.description.length > 160 ? product.description.substring(0, 157) + "..." : product.description)
      : `Purchase genuine ${product.title} from Alang Shipyard. Certified refurbished marine machinery and automation spare parts with worldwide shipping.`)

    return {
      title,
      description,
      alternates: {
        canonical: `https://coronamarineparts.com/product/${slug}`,
      },
      openGraph: {
        title: product.title,
        description: description,
        images: [product.image],
        url: `https://coronamarineparts.com/product/${slug}`,
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.title,
        description: description,
        images: [product.image],
      }
    }
  } catch (error) {
    return {
      title: 'Marine Product Detail',
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
