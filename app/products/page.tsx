"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { SlidersHorizontal, X, Search } from "lucide-react"
import api from "@/lib/api"
import { MarineLoader } from "@/components/common/marine-loader"
import { motion, AnimatePresence } from "framer-motion"
import { ProductCard } from "@/components/product-card"

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories")
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        setIsVisible(true);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        (product.category?._id === selectedCategory ||
          product.category?.name.toLowerCase() === selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  if (loading) return <MarineLoader />;

  return (
    <main className="min-h-screen pb-20">
      {/* Page Header */}
      <div className="bg-primary pt-36 pb-20 relative overflow-hidden min-h-[50dvh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/products-hero.png" 
            alt="Marine Products" 
            fill
            priority
            className="object-cover opacity-20"
          />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-accent tracking-[0.3em] uppercase text-sm font-bold mb-4 block"
            >
              Inventory
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6 uppercase tracking-wider"
            >
              Marine Products
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/60 max-w-2xl mx-auto"
            >
              Professional-grade marine equipment and supplies sourced directly from Alang.
            </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-12">
        {/* Search and Filters Bar */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12 pb-8 border-b border-border">
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search components or parts..."
              className="w-full pl-12 pr-6 py-4 bg-muted/20 border border-border focus:border-accent outline-none font-medium transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Desktop Categories */}
          <div className="hidden lg:flex items-center gap-3">
            <button
               onClick={() => setSelectedCategory("all")}
               className={`px-6 py-2 uppercase text-xs tracking-widest font-bold transition-all border-b-2 ${
                 selectedCategory === "all" ? "border-accent text-primary" : "border-transparent text-muted-foreground hover:text-primary"
               }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`px-6 py-2 uppercase text-xs tracking-widest font-bold transition-all border-b-2 ${
                  selectedCategory === cat._id ? "border-accent text-primary" : "border-transparent text-muted-foreground hover:text-primary"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFilters(true)}
            className="lg:hidden w-full py-4 border border-border flex items-center justify-center gap-2 uppercase text-xs tracking-widest font-bold"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filter Categories
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredProducts.length === 0 && (
           <div className="text-center py-40 border border-dashed border-border mt-10">
              <h2 className="text-2xl font-bold text-muted-foreground uppercase opacity-50 tracking-widest italic">No matching inventory found</h2>
           </div>
        )}
      </div>

      {/* Mobile Filters Drawer Overlay */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-primary/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: "100%" }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 h-full w-[280px] bg-white z-[101] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                 <h2 className="text-xl font-bold uppercase text-primary">Filters</h2>
                 <button onClick={() => setShowFilters(false)}><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-4">
                 <button 
                  onClick={() => { setSelectedCategory("all"); setShowFilters(false); }}
                  className={`w-full text-left py-3 px-4 uppercase text-xs tracking-widest font-bold ${selectedCategory === "all" ? "bg-accent text-white" : "hover:bg-muted"}`}
                 >
                   All Categories
                 </button>
                 {categories.map((cat) => (
                    <button 
                      key={cat._id}
                      onClick={() => { setSelectedCategory(cat._id); setShowFilters(false); }}
                      className={`w-full text-left py-3 px-4 uppercase text-xs tracking-widest font-bold ${selectedCategory === cat._id ? "bg-accent text-white" : "hover:bg-muted"}`}
                    >
                      {cat.name}
                    </button>
                 ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  )
}



