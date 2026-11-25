import { Metadata } from 'next'
import BrandDetailContent from './brand-detail-content'
import ItemListStructuredData from '@/components/seo/item-list-structured-data'
import { getBrandInfoAndProducts, getBrands } from '@/lib/catalog-data'

export const revalidate = 3600

type Props = {
  params: Promise<{ brandName: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandName } = await params
  const decodedBrand = decodeURIComponent(brandName).replace(/-/g, ' ')
  const displayName = decodedBrand.replace(/\b\w/g, l => l.toUpperCase())

  return {
    title: `${displayName} Marine Spare Parts | Buy ${displayName} Ship Parts | Corona Marine Parts`,
    description: `Buy genuine ${displayName} marine spare parts and ship components from Alang Shipyard. Certified refurbished ${displayName} equipment with worldwide shipping. Best prices from Corona Marine Parts.`,
    keywords: [
      `${displayName} marine parts`,
      `${displayName} spare parts`,
      `${displayName} ship equipment`,
      `buy ${displayName} parts`,
      'marine spare parts',
      'ship spare parts supplier',
      'Alang shipyard parts',
      'Corona Marine Parts',
    ],
    alternates: {
      canonical: `/brand/${brandName}`,
    },
    openGraph: {
      title: `${displayName} Marine Spare Parts | Corona Marine Parts`,
      description: `Browse genuine ${displayName} marine equipment and spare parts. Sourced from Alang Shipyard with worldwide delivery.`,
      url: `https://coronamarineparts.com/brand/${brandName}`,
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
      },
    },
  }
}

export async function generateStaticParams() {
  try {
    const brands = await getBrands()
    return brands.map((b: any) => ({
      brandName: encodeURIComponent(b.name),
    }))
  } catch {
    return []
  }
}

export default async function BrandPage({ params }: Props) {
  const { brandName } = await params
  const { brandInfo, products } = await getBrandInfoAndProducts(brandName)
  const displayName =
    brandInfo?.name ||
    decodeURIComponent(brandName).replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())

  return (
    <>
      <ItemListStructuredData
        products={products}
        listName={`${displayName} Marine Spare Parts`}
        listUrl={`https://coronamarineparts.com/brand/${brandName}`}
      />
      <BrandDetailContent initialProducts={products} initialBrandInfo={brandInfo} />
    </>
  )
}
