import { Metadata } from 'next'
import api from "@/lib/api"
import ProductDetailContent from './product-detail-content'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const { data: product } = await api.get(`/products/${slug}`)
    
    if (!product) {
      return {
        title: 'System Not Found',
      }
    }

    return {
      title: `${product.title} | Marine Spare Parts`,
      description: product.description || `Buy genuine refurbished ${product.title} for maritime use. Sourced from Alang Shipyard. Certified quality and worldwide shipping.`,
      openGraph: {
        title: product.title,
        description: product.description,
        images: [product.image],
        url: `https://coronamarineparts.com/product/${slug}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: product.title,
        description: product.description,
        images: [product.image],
      }
    }
  } catch (error) {
    return {
      title: 'Marine Product Detail',
    }
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  return <ProductDetailContent slug={slug} />
}
