import { Metadata } from 'next'
import ProductsContent from './products-content'

export const metadata: Metadata = {
  title: 'Marine Products Inventory | Corona Marine Parts',
  description: 'Explore our comprehensive inventory of marine spare parts, automation systems, and engine room machinery sourced from Alang Shipyard. Certified quality and global shipping.',
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: 'Marine Products Inventory | Genuine Spare Parts',
    description: 'Browse professional-grade marine equipment from Alang Shipyard. Worldwide delivery available.',
    url: 'https://coronamarineparts.com/products',
  }
}

export default function ProductsPage() {
  return <ProductsContent />
}



