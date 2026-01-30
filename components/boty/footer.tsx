"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Instagram, Facebook, Twitter, Mail } from "lucide-react"
import { Logo } from "@/components/common/logo"

const footerLinks = {
  shop: [
    { name: "Marine Automation", href: "/products?category=automation" },
    { name: "Industrial Electronics", href: "/products?category=electronics" },
    { name: "Fire & Safety", href: "/products?category=safety" },
    { name: "Engine Alarms", href: "/products?category=alarms" },
    { name: "Global Inventory", href: "/products" }
  ],
  about: [
    { name: "Company Overview", href: "/about" },
    { name: "Why Corona Marine", href: "/about" },
    { name: "Global Reach", href: "/about" },
    { name: "Quality Assurance", href: "/about" }
  ],
  support: [
    { name: "Request a Quote", href: "/contact" },
    { name: "Message Engineering", href: "/contact" },
    { name: "Technical Guides", href: "/blog" },
    { name: "Our Services", href: "/services" },
    { name: "Business Hours", href: "/contact" }
  ]
}

export function Footer() {
  const pathname = usePathname()
  
  if (pathname?.startsWith("/admin")) return null

  return (
    <footer className="bg-card pt-12 sm:pt-16 md:pt-20 pb-6 sm:pb-8 md:pb-10 relative overflow-hidden">
      {/* Giant Background Text */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none z-0">
        <span className="font-serif text-[60px] sm:text-[100px] md:text-[180px] lg:text-[250px] xl:text-[300px] font-bold text-primary/5 whitespace-nowrap leading-none uppercase tracking-tighter">
          Corona Marine Parts
        </span>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-10 mb-10 sm:mb-12 md:mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Logo size="md" variant="dark" className="mb-4 sm:mb-6 h-8 sm:h-10" />
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-6">
              Your trusted partner for marine equipment and supplies.
            </p>
            <div className="flex gap-3 sm:gap-4">
              <a
                href="https://wa.me/919376502550"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground marine-transition marine-shadow"
                aria-label="WhatsApp"
              >
                <div className="text-xl">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.539 2.016 2.049-.54c1.011.544 2.1.84 3.24.841h.001c3.181 0 5.767-2.586 5.768-5.766.001-3.18-2.586-5.767-5.767-5.767zm3.39 8.21c-.149.424-.728.764-1.22.814-.35.034-.805.043-1.261-.103-.306-.103-.993-.315-1.963-.733-1.129-.481-1.859-1.611-1.921-1.692-.056-.088-1.109-1.474-1.109-2.811 0-1.339.697-1.996.945-2.264.249-.267.545-.333.727-.333h.52c.17 0 .339.012.485.344.158.363.545 1.328.591 1.417.045.093.074.202.012.333-.062.13-.093.21-.186.326-.093.109-.193.267-.275.353-.097.106-.197.228-.084.422.112.193.504.832 1.085 1.348.749.664 1.381.87 1.579.967.198.102.313.088.432-.05.118-.138.508-.592.645-.794.137-.202.272-.17.46-.102.188.07 1.192.562 1.398.665.206.106.343.158.394.246.049.088.049.51-.101.934z" />
                  </svg>
                </div>
              </a>
              <a
                href="mailto:sales@coronamarineparts.com"
                className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground marine-transition marine-shadow"
                aria-label="Email"
              >
                <div className="text-xl">
                   <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                   </svg>
                </div>
              </a>
              <a
                href="https://www.linkedin.com/company/corona-marine-parts/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground marine-transition marine-shadow"
                aria-label="LinkedIn"
              >
                <div className="text-xl">
                   <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                   </svg>
                </div>
              </a>
            </div>
            <div className="mt-6 space-y-2">
              <a href="tel:+919376502550" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-accent transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.81 12.81 0 00.62 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.62A2 2 0 0122 16.92z"/></svg>
                </div>
                <span className="font-bold tracking-widest uppercase">+91 93765 02550</span>
              </a>
              <a href="mailto:sales@coronamarineparts.com" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                <div className="w-10 h-10 bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="font-bold tracking-widest">sales@coronamarineparts.com</span>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground marine-transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">About</h3>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground marine-transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground marine-transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Corona Marine Parts – Marine Spare Parts & Marine Services Supplier
            </p>
            <div className="flex gap-6">
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground marine-transition">
                Privacy Policy
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground marine-transition">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
