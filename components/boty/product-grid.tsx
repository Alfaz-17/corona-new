"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Box } from "lucide-react"
import api from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"

export function ProductGrid() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [headerVisible, setHeaderVisible] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes] = await Promise.all([
          api.get("/products?featured=true")
        ]);
        
        let featuredProducts = prodRes.data;
        
        // If no featured products, fallback to showing latest products
        if (featuredProducts.length === 0) {
          const fallbackRes = await api.get("/products");
          featuredProducts = fallbackRes.data;
        }

        setProducts(featuredProducts);
      } catch (err) {
        console.error("Error fetching homepage products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setHeaderVisible(true);
    }, { threshold: 0.1 });
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  const filteredProducts = products.slice(0, 8);

  if (loading && products.length === 0) return (
     <div className="py-24 text-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Syncing Fleet...</p>
     </div>
  );

  return (
    <section className="pb-16 sm:pb-20 md:pb-24 pt-8 sm:pt-10 md:pt-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8 sm:mb-10 md:mb-12">
        <div ref={headerRef} className="space-y-6">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={headerVisible ? { opacity: 1, y: 0 } : {}}
              className="text-[10px] tracking-[0.4em] uppercase text-accent font-bold block"
            >
              Essential Inventory
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={headerVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-extrabold text-primary leading-tight uppercase tracking-tighter">
              Strategic *Marine* Components
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={headerVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto italic font-medium">
              Professional-grade reconditioned equipment, inspected for maximum operational efficiency in global commercial fleets.
            </motion.p>
        </div>

      </div>

      <div className="max-w-[100vw] overflow-x-auto overflow-y-hidden px-6  lg:px-12 pb-12 no-scrollbar snap-x snap-mandatory">
        <div className="flex gap-8 md:gap-12 min-w-max">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05, duration: 0.6 }}
                className="w-[260px] sm:w-[300px] md:w-[400px] flex-none snap-center"
                layout
              >
                <Link href={`/product/${product._id}`} className="group block relative bg-white border border-border/50 transition-all duration-700 hover:shadow-[inset_0_0_60px_rgba(0,0,0,0.05)] h-full">
                  <div className="aspect-[3/4] relative overflow-hidden bg-[#f3f3f3]">
                    {product.images?.[0] && (
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                      />
                    )}
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.title}
                      fill
                      className={`object-cover transition-all duration-700 scale-100 group-hover:scale-110 ${product.images?.[0] ? 'group-hover:opacity-0' : ''}`}
                    />
                    <div className="absolute top-6 left-6">
                      <span className="bg-primary text-white px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em]">{product.category?.name || "Inventory"}</span>
                    </div>
                  </div>
                  <div className="p-10 text-center transition-all duration-500 bg-white group-hover:bg-background">
                    <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-primary mb-3 leading-snug line-clamp-2">{product.title}</h3>
                    <div className="flex items-center justify-center gap-4 text-[10px] text-accent font-extrabold tracking-[0.2em] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                        SECURE ASSET <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="text-center mt-16 sm:mt-24 md:mt-32">
        <Link
          href="/products"
          className="inline-flex items-center gap-4 sm:gap-6 md:gap-8 bg-primary text-white px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] hover:bg-accent transition-all duration-500 shadow-2xl relative group overflow-hidden">
          <span className="relative z-10">View Full Collection</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:translate-x-2 transition-transform" />
          <div className="absolute inset-0 bg-accent translate-y-full hover:translate-y-0 transition-transform duration-500" />
        </Link>
      </div>
    </section>
  )
}
