"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Image from "next/image"
import { Search, SlidersHorizontal, X } from "lucide-react"
import api from "@/lib/api"
import { MarineLoader } from "@/components/common/marine-loader"
import { motion, AnimatePresence } from "framer-motion"
import { ProductCard } from "@/components/product-card"
export default function ProductsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "all")
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Sync state with URL search params
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') || "all"
    if (categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl)
    }
  }, [searchParams])

  const handleCategoryChange = (slugOrId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slugOrId === "all") {
      params.delete('category')
    } else {
      params.set('category', slugOrId)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

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
        (() => {
          // Find if selectedCategory is a slug or an ID
          const categoryObj = categories.find(c => c.slug === selectedCategory || c._id === selectedCategory);
          const targetId = categoryObj ? categoryObj._id : selectedCategory;
          
          return (
            product.category?._id === targetId ||
            product.category === targetId ||
            product.category?.slug === selectedCategory ||
            product.category?.name?.toLowerCase() === selectedCategory.toLowerCase()
          );
        })();

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

      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-20">
        <div className="mb-16 prose prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-primary uppercase tracking-widest mb-6">Premium Ship Spare Parts & Automation Systems</h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            Sourced directly from the Alang ship breaking yard, the world's largest ship recycling facility, 
            <strong> Corona Marine Parts</strong> provides certified, high-quality maritime machinery components. 
            Our inventory includes everything from critical engine room spares and hydraulic systems to 
            sophisticated marine automation and electrical components. Every part undergoes rigorous 
            testing and refurbishment to ensure it meets international maritime safety standards.
          </p>
        </div>

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

          <div className="hidden lg:flex items-center gap-3">
            <button
               onClick={() => handleCategoryChange("all")}
               className={`px-6 py-2 uppercase text-xs tracking-widest font-bold transition-all border-b-2 ${
                 selectedCategory === "all" ? "border-accent text-primary" : "border-transparent text-muted-foreground hover:text-primary"
               }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategoryChange(cat.slug || cat._id)}
                className={`px-6 py-2 uppercase text-xs tracking-widest font-bold transition-all border-b-2 ${
                  (selectedCategory === cat.slug || selectedCategory === cat._id) ? "border-accent text-primary" : "border-transparent text-muted-foreground hover:text-primary"
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
              className="fixed inset-0 bg-black/50 z-[100]"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 h-full w-[280px] bg-white z-[101] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                 <h2 className="text-xl font-bold uppercase text-primary">Filters</h2>
                 <button onClick={() => setShowFilters(false)}><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-4">
                 <button 
                  onClick={() => { handleCategoryChange("all"); setShowFilters(false); }}
                  className={`w-full text-left py-3 px-4 uppercase text-xs tracking-widest font-bold ${selectedCategory === "all" ? "bg-accent text-white" : "hover:bg-muted"}`}
                 >
                   All Categories
                 </button>
                 {categories.map((cat) => (
                    <button 
                      key={cat._id}
                      onClick={() => { handleCategoryChange(cat.slug || cat._id); setShowFilters(false); }}
                      className={`w-full text-left py-3 px-4 uppercase text-xs tracking-widest font-bold ${(selectedCategory === cat.slug || selectedCategory === cat._id) ? "bg-accent text-white" : "hover:bg-muted"}`}
                    >
                      {cat.name}
                    </button>
                 ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SEO Content Section / Buying Guide */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-32 pt-20 border-t border-border">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h3 className="text-xl font-bold text-primary uppercase tracking-widest mb-6">Marine Equipment Guide</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              When sourcing marine spare parts, reliability is paramount. Refurbished parts from Alang offer a 
              sustainable and cost-effective alternative to new components without compromising on quality. 
              Our technical experts recommend verifying the compatibility of automation systems and engine 
              spares with your vessel's existing infrastructure.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We specialize in brands like ABB, Siemens, Kongsberg, and Wärtsilä, ensuring that your 
              vessel remains operational with minimal downtime.
            </p>
          </div>
          <div className="bg-muted/30 p-8 border border-border">
            <h3 className="text-xl font-bold text-primary uppercase tracking-widest mb-6">Why Choose Alang Sourced Parts?</h3>
            <ul className="space-y-4">
              <li className="flex gap-4 text-sm text-muted-foreground">
                <span className="text-accent font-bold">01.</span>
                <span>Original OEM components from decommissioned vessels.</span>
              </li>
              <li className="flex gap-4 text-sm text-muted-foreground">
                <span className="text-accent font-bold">02.</span>
                <span>Environmentally friendly recycling and reuse practices.</span>
              </li>
              <li className="flex gap-4 text-sm text-muted-foreground">
                <span className="text-accent font-bold">03.</span>
                <span>Significant cost savings compared to factory-new parts.</span>
              </li>
              <li className="flex gap-4 text-sm text-muted-foreground">
                <span className="text-accent font-bold">04.</span>
                <span>Ready-to-ship inventory for emergency maritime repairs.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
