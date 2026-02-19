import { Hero } from "@/components/boty/hero"
import { StatsSection } from "@/components/boty/stats-section"
import { TrustBadges } from "@/components/boty/trust-badges"
import { FeatureSection } from "@/components/boty/feature-section"
import { ProductGrid } from "@/components/boty/product-grid"
import { BrandGrid } from "@/components/boty/brands-grid"
import { Testimonials } from "@/components/boty/testimonials"
import { CTABanner } from "@/components/boty/cta-banner"
import { Newsletter } from "@/components/boty/newsletter"
import { SEOIntro } from "@/components/boty/seo-intro"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Corona Marine Parts | Marine Spare Parts & Marine Services Supplier',
  description: 'Genuine marine spare parts and technical services. Reliable supplier of ship machinery, automation systems, and engine components based in Bhavnagar (Alang Shipyard).',
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
