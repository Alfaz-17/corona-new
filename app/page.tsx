import { Hero } from "@/components/boty/hero"
import { SEOIntro } from "@/components/boty/seo-intro"
import { ProductGrid } from "@/components/boty/product-grid"
import dynamic from 'next/dynamic'
import { Metadata } from 'next'
import { getBrands, getFeaturedProductsOrLatest } from '@/lib/catalog-data'

export const revalidate = 3600

// Dynamic imports for sections below the fold to boost mobile scores
const BrandGrid = dynamic(() => import("@/components/boty/brands-grid").then(m => m.BrandGrid), { ssr: true })
const FeatureSection = dynamic(() => import("@/components/boty/feature-section").then(m => m.FeatureSection), { ssr: true })
const Testimonials = dynamic(() => import("@/components/boty/testimonials").then(m => m.Testimonials), { ssr: true })
const CTABanner = dynamic(() => import("@/components/boty/cta-banner").then(m => m.CTABanner), { ssr: true })
const Newsletter = dynamic(() => import("@/components/boty/newsletter").then(m => m.Newsletter), { ssr: true })

export const metadata: Metadata = {
  title: 'Corona Marine Parts | Marine Spare Parts Supplier from Alang Shipyard | Ship Parts & Automation',
  description: 'Corona Marine Parts is a leading supplier of genuine marine spare parts, ship engine components, automation systems, and marine electronics from Alang Shipyard. Buy certified refurbished marine equipment with worldwide shipping. Get best prices on ship machinery spares.',
  keywords: [
    'marine spare parts',
    'marine spare parts supplier',
    'ship spare parts',
    'marine automation systems',
    'marine electronics',
    'Alang shipyard spare parts',
    'ship engine parts',
    'marine equipment supplier India',
    'ship machinery spares',
    'refurbished marine parts',
    'marine pumps supplier',
    'ship navigation equipment',
    'marine safety equipment',
    'Corona Marine Parts',
    'buy marine parts online',
    'ship breaking yard Alang parts',
    'marine generator spare parts',
    'marine electrical parts',
    'deck machinery parts',
    'marine hydraulic parts',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Corona Marine Parts | Leading Marine Spare Parts Supplier from Alang Shipyard',
    description: 'Buy genuine marine spare parts, ship engine components, and automation systems. Worldwide shipping from Alang Shipyard, India.',
    url: 'https://coronamarineparts.com',
    type: 'website',
    images: [{
      url: 'https://coronamarineparts.com/hero-bg.webp',
      width: 1200,
      height: 630,
      alt: 'Corona Marine Parts - Marine Spare Parts Supplier from Alang Shipyard, India',
    }],
  },
}

export default async function HomePage() {
  const [initialProducts, initialBrands] = await Promise.all([
    getFeaturedProductsOrLatest(8),
    getBrands(),
  ]);

  return (
    <main>
      <Hero />
      <SEOIntro />
      <ProductGrid initialProducts={initialProducts} />
      <BrandGrid initialBrands={initialBrands} />
      <FeatureSection />
      <Testimonials />
      <CTABanner />
      <Newsletter />
    </main>
  )
}
