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
