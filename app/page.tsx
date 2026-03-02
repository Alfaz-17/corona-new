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
