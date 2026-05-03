import { Hero } from "@/components/boty/hero"
import { SEOIntro } from "@/components/boty/seo-intro"
import { ProductGrid } from "@/components/boty/product-grid"
import dynamic from 'next/dynamic'
import { Metadata } from 'next'

// Dynamic imports for sections below the fold to boost mobile scores
const BrandGrid = dynamic(() => import("@/components/boty/brands-grid").then(m => m.BrandGrid), { ssr: true })
const FeatureSection = dynamic(() => import("@/components/boty/feature-section").then(m => m.FeatureSection), { ssr: true })
const Testimonials = dynamic(() => import("@/components/boty/testimonials").then(m => m.Testimonials), { ssr: true })
const CTABanner = dynamic(() => import("@/components/boty/cta-banner").then(m => m.CTABanner), { ssr: true })
const Newsletter = dynamic(() => import("@/components/boty/newsletter").then(m => m.Newsletter), { ssr: true })

export const metadata: Metadata = {
  title: 'Corona Marine Parts | Home - High-Quality Marine Spare Parts',
  description: 'Welcome to Corona Marine Parts. We are leading suppliers of genuine marine spare parts, ship machinery, and automation systems based in Alang Shipyard.',
  alternates: {
    canonical: '/',
  },
}

export default function HomePage() {
  return (
    <main>
      <Hero />
      <SEOIntro />
      <ProductGrid />
      <BrandGrid />
      <FeatureSection />
      <Testimonials />
      <CTABanner />
      <Newsletter />
    </main>
  )
}
