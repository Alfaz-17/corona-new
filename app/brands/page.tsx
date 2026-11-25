import { Metadata } from 'next'
import BrandsContent from './brands-content'
import { getBrands } from '@/lib/catalog-data'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Marine Equipment Brands | Trusted Manufacturers | Corona Marine Parts',
  description: 'Browse marine equipment from trusted manufacturers worldwide. Corona Marine Parts supplies spare parts from leading marine brands including Kongsberg, ABB, Wartsila, MAN B&W, Caterpillar, and more. Sourced from Alang Shipyard.',
  keywords: [
    'marine equipment brands',
    'ship spare parts manufacturers',
    'Kongsberg marine parts',
    'ABB marine equipment',
    'Wartsila spare parts',
    'MAN B&W engine parts',
    'marine brand supplier',
    'ship equipment manufacturers',
    'Corona Marine Parts',
  ],
  alternates: {
    canonical: '/brands',
  },
  openGraph: {
    title: 'Marine Equipment Brands | Corona Marine Parts',
    description: 'We partner with industry-leading marine equipment manufacturers. Browse genuine spare parts by brand.',
    url: 'https://coronamarineparts.com/brands',
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

export default async function BrandsPage() {
  const brands = await getBrands();
  return <BrandsContent initialBrands={brands} />
}
