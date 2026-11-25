import { Metadata } from 'next'
import { Suspense } from 'react'
import ProductsContent from './products-content'
import { MarineLoader } from '@/components/common/marine-loader'
import ItemListStructuredData from '@/components/seo/item-list-structured-data'
import { getCategories, getProducts } from '@/lib/catalog-data'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Marine Spare Parts Inventory | Ship Engine Parts, Automation Systems | Corona Marine Parts',
  description: 'Browse our complete inventory of marine spare parts, ship engine components, automation systems, marine electronics, and deck machinery. All parts sourced from Alang Shipyard with worldwide shipping. Get the best prices on genuine marine equipment.',
  keywords: [
    'marine spare parts',
    'ship spare parts',
    'marine automation systems',
    'ship engine parts',
    'marine electronics',
    'Alang shipyard parts',
    'marine equipment supplier',
    'ship machinery spares',
    'marine pumps',
    'marine generators',
    'ship navigation equipment',
    'marine safety equipment',
    'refurbished marine parts',
    'buy marine parts online',
    'Corona Marine Parts',
  ],
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: 'Marine Spare Parts Inventory | Genuine Ship Parts from Alang Shipyard',
    description: 'Browse professional-grade marine equipment, ship engine parts, and automation systems sourced from Alang Shipyard. Certified quality with worldwide delivery.',
    url: 'https://coronamarineparts.com/products',
    type: 'website',
    images: [{
      url: 'https://coronamarineparts.com/products-hero.png',
      width: 1200,
      height: 630,
      alt: 'Marine Spare Parts Inventory - Corona Marine Parts',
    }],
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

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <>
      <ItemListStructuredData
        products={products}
        listName="Marine Spare Parts Inventory"
        listUrl="https://coronamarineparts.com/products"
      />
      <Suspense fallback={<MarineLoader />}>
        <ProductsContent initialProducts={products} initialCategories={categories} />
      </Suspense>
    </>
  )
}
