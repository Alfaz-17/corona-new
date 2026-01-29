"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Search, User, ChevronDown, ArrowRight, Instagram, Linkedin, Phone } from "lucide-react"
import api from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { Logo } from "@/components/common/logo"

export function Header() {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    
    const fetchData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get("/categories"),
          api.get("/brands")
        ])
        setCategories(catRes.data)
        setBrands(brandRes.data)
      } catch (err) {
        console.error("Navigation data fetch failed:", err)
      }
    }
    
    fetchData()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Scroll locking for mobile menu
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  if (pathname?.startsWith("/admin")) return null

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { 
      name: "Products", 
      href: "/products",
      dropdown: categories.map(cat => ({ 
        name: cat.name, 
        href: `/products?category=${cat._id}`,
        description: cat.description || "Essential marine inventory."
      }))
    },
    { 
      name: "Brands", 
      href: "/brands",
      dropdown: brands.map(brand => ({ 
        name: brand.name, 
        href: `/brand/${brand.name.toLowerCase().replace(/\s+/g, '-')}`, 
        description: brand.description || "Strategic maritime partner."
      }))
    },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" }
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav 
        className={`max-w-full mx-auto px-6 lg:px-12 marine-transition border-b ${
          (isScrolled || !isHome)
            ? "bg-primary/95 backdrop-blur-2xl border-white/10 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.3)]" 
            : "bg-transparent border-transparent py-8"
        }`}
      >
        <div className="flex items-center justify-between h-[40px] relative">
          {/* Mobile menu button */}
          <button
            type="button"
            className={`lg:hidden p-2 marine-transition transition-colors ${
              (isScrolled || !isHome) ? "text-white hover:text-accent" : "text-white hover:text-accent"
            }`}
            onClick={() => setIsMenuOpen(true)}
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Desktop Navigation - Left Group */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.slice(0, 3).map((link) => (
              <div 
                key={link.name}
                className="relative group"
                onMouseEnter={() => link.dropdown && setActiveDropdown(link.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={link.href}
                  className={`text-[10px] font-bold uppercase tracking-[0.3em] marine-transition flex items-center gap-2 ${
                    (isScrolled || !isHome) ? "text-white/80 hover:text-white" : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.name}
                  {link.dropdown && <ChevronDown className="w-3 h-3 opacity-50" />}
                </Link>

                {/* Desktop Dropdown */}
                {link.dropdown && activeDropdown === link.name && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 pt-6 w-80"
                  >
                    <div className="bg-white border border-border shadow-2xl p-6 backdrop-blur-xl bg-white/95">
                      <div className="space-y-6">
                        {link.dropdown.slice(0, 5).map((item: any, idx: number) => (
                          <Link 
                            key={`${link.name}-${idx}-${item.name}`} 
                            href={item.href}
                            className="block group/item"
                          >
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary block mb-1 group-hover/item:text-accent transition-colors">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground line-clamp-1 italic">
                              {item.description}
                            </span>
                          </Link>
                        ))}
                        <Link href={link.href} className="pt-4 border-t border-border flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-accent hover:gap-4 transition-all">
                          View All {link.name} <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* Logo - Centered */}
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center h-32">
            <Link href="/" className="flex items-center">
              <Logo 
                variant="white" 
                size="md" 
              />
            </Link>
            <a href="tel:+919376502550" className={`text-[8px] font-bold tracking-[0.2em] uppercase mt-2 hidden md:block ${isScrolled || !isHome ? "text-white/60" : "text-white/40"}`}>
              +91 93765 02550
            </a>
          </div>

          {/* Desktop Navigation - Right Group */}
          <div className="flex items-center gap-10">
            <div className="hidden lg:flex items-center gap-10">
              {navLinks.slice(3).map((link) => (
                <div 
                  key={link.name}
                  className="relative group"
                  onMouseEnter={() => link.dropdown && setActiveDropdown(link.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={`text-[10px] font-bold uppercase tracking-[0.3em] marine-transition flex items-center gap-2 ${
                      (isScrolled || !isHome) ? "text-white/80 hover:text-white" : "text-white/80 hover:text-white"
                    }`}
                  >
                    {link.name}
                    {link.dropdown && <ChevronDown className="w-3 h-3 opacity-50" />}
                  </Link>

                  {/* Desktop Dropdown */}
                  {link.dropdown && activeDropdown === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full right-0 pt-6 w-80"
                    >
                      <div className="bg-white border border-border shadow-2xl p-6 backdrop-blur-xl bg-white/95">
                        <div className="space-y-6">
                          {link.dropdown.slice(0, 5).map((item: any, idx: number) => (
                            <Link 
                              key={`${link.name}-${idx}-${item.name}`} 
                              href={item.href}
                              className="block group/item"
                            >
                              <span className="text-[9px] font-black uppercase tracking-widest text-primary block mb-1 group-hover/item:text-accent transition-colors">
                                {item.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground line-clamp-1 italic">
                                {item.description}
                              </span>
                            </Link>
                          ))}
                          <Link href={link.href} className="pt-4 border-t border-border flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-accent hover:gap-4 transition-all">
                            Explore {link.name} <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-4 border-l border-border/20 pl-8 ml-2">
              <Link
                href="/admin"
                className={`p-2 marine-transition transition-colors ${
                  (isScrolled || !isHome) ? "text-white/80 hover:text-white" : "text-white/80 hover:text-white"
                }`}
              >
                <User className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* High-Fidelity Mobile Sidebar */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[60] lg:hidden"
              />
              
              {/* Sidebar Panel */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-[70] shadow-2xl lg:hidden flex flex-col h-screen"
              >
                <div className="shrink-0 p-8 border-b border-border flex items-center justify-between bg-card/10">
                  <h2 className="font-serif text-xl tracking-widest uppercase text-primary">
                    Corona <span className="text-accent italic">Marine Parts</span>
                  </h2>
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-muted transition-colors">
                    <X className="w-6 h-6 text-primary" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-10 space-y-10 custom-scrollbar">
                  {/* Primary Links */}
                  <div className="space-y-8">
                    {navLinks.map((link) => (
                      <div key={link.name} className="space-y-4">
                        <Link
                          href={link.href}
                          className="text-sm font-black uppercase tracking-[0.3em] text-primary hover:text-accent transition-colors block"
                          onClick={() => !link.dropdown && setIsMenuOpen(false)}
                        >
                          {link.name}
                        </Link>
                        
                        {link.dropdown && link.dropdown.length > 0 && (
                          <div className="pl-4 border-l border-border/60 space-y-4">
                            {link.dropdown.slice(0, 6).map((item: any, idx: number) => (
                              <Link
                                key={`mobile-${link.name}-${idx}-${item.name}`}
                                href={item.href}
                                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary block"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Operational Contacts */}
                  <div className="pt-10 border-t border-border mt-auto">
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.4em] text-accent mb-6 font-mono">Operations</h3>
                    <div className="space-y-6">
                      <a href="tel:+917386545454" className="flex items-center gap-4 group">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                          <Phone className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-primary">+91 93765 02550</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 p-8 border-t border-border bg-card/5">
                   <div className="flex items-center gap-6 justify-center">
                      <a href="#" className="p-2 text-primary hover:text-accent transition-colors"><Instagram className="w-5 h-5" /></a>
                      <a href="#" className="p-2 text-primary hover:text-accent transition-colors"><Linkedin className="w-5 h-5" /></a>
                   </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        {/* Decorative Bottom Lining - Gold Palette */}
        <div 
          className={`absolute bottom-0 left-0 right-0 h-[2px] marine-transition ${
            (isScrolled || !isHome) ? "bg-gradient-to-r from-transparent via-accent to-transparent opacity-100" : "bg-white/10 opacity-0"
          }`} 
        />
      </nav>
    </header>
  )
}
