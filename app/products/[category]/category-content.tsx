"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Search, ChevronRight } from "lucide-react"
import api from "@/lib/api"
import { MarineLoader } from "@/components/common/marine-loader"
import { motion, AnimatePresence } from "framer-motion"
import { ProductCard } from "@/components/product-card"
import Breadcrumbs from "@/components/seo/breadcrumbs"

export default function CategoryContent() {
  const params = useParams()
  const categorySlug = params.category as string
  
  const [products, setProducts] = useState<any[]>([])
  const [categoryInfo, setCategoryInfo] = useState<any>(null)
  const [allCategories, setAllCategories] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch categories to find the current one
        const categoriesRes = await api.get("/categories")
        setAllCategories(categoriesRes.data)
        
        const currentCategory = categoriesRes.data.find((c: any) => 
          c.slug === categorySlug || c._id === categorySlug
        )
        setCategoryInfo(currentCategory)
        
        // Fetch products for this category
        if (currentCategory) {
          const productsRes = await api.get(`/products?category=${currentCategory._id}`)
          setProducts(productsRes.data)
        } else {
          // Try fetching all products and filter client-side
          const productsRes = await api.get("/products")
          const filtered = productsRes.data.filter((p: any) => 
            p.category?.slug === categorySlug || 
            p.category?.name?.toLowerCase().replace(/\s+/g, '-') === categorySlug
          )
          setProducts(filtered)
          if (filtered.length > 0 && filtered[0].category) {
            setCategoryInfo(filtered[0].category)
          }
        }
      } catch (error) {
        console.error("Error fetching category data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [categorySlug])

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products
    return products.filter((product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [products, searchTerm])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredProducts.slice(start, start + itemsPerPage)
  }, [filteredProducts, currentPage])

  const categoryName = categoryInfo?.name || categorySlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())

  if (loading) return <MarineLoader />

  return (
    <main className="min-h-screen pb-20">
      {/* Hero Section with Category Name */}
      <div className="bg-primary pt-36 pb-20 relative overflow-hidden min-h-[40dvh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image 
            src={categoryInfo?.image || "/products-hero.png"} 
            alt={`${categoryName} - Marine Spare Parts from Alang Shipyard`}
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
            Category
          </motion.span>
          {/* H1 tag with category name — CRITICAL for SEO */}
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 uppercase tracking-wider"
          >
            {categoryName}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/60 max-w-2xl mx-auto"
          >
            Browse our inventory of genuine {categoryName.toLowerCase()} sourced from Alang Shipyard, India. 
            Certified quality with worldwide shipping.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-12">
        {/* Breadcrumb - helps Google understand page hierarchy */}
        <Breadcrumbs items={[
          { label: 'Products', href: '/products' },
          { label: categoryName, href: `/products/${categorySlug}` },
        ]} />

        {/* SEO Content Section - unique content per category */}
        <div className="mt-8 mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-primary uppercase tracking-widest mb-6">
            {categoryName} — Marine Spare Parts from Alang Shipyard
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg max-w-4xl">
            {categoryInfo?.description || (
              <>
                Explore our complete range of <strong>{categoryName.toLowerCase()}</strong> sourced directly from 
                Alang Ship Recycling Yard — the world's largest ship breaking facility. Every component is 
                thoroughly inspected, tested, and certified by <strong>Corona Marine Parts</strong> technical 
                experts before dispatch. We ship {categoryName.toLowerCase()} worldwide to ship owners, 
                marine engineers, and vessel managers.
              </>
            )}
          </p>
        </div>

        {/* Search within category */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12 pb-8 border-b border-border">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text"
              placeholder={`Search ${categoryName.toLowerCase()}...`}
              className="w-full pl-12 pr-6 py-4 bg-muted/20 border border-border focus:border-accent outline-none font-medium transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">
            {filteredProducts.length} {categoryName.toLowerCase()} found
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {currentItems.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-20 flex items-center justify-center gap-2">
            <button
              onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
              disabled={currentPage === 1}
              className="px-6 py-3 border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white disabled:opacity-30 transition-all"
            >
              Prev
            </button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                  className={`w-10 h-10 flex items-center justify-center text-[10px] font-bold transition-all ${
                    currentPage === i + 1 ? "bg-accent text-white" : "border border-border hover:bg-muted"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
              disabled={currentPage === totalPages}
              className="px-6 py-3 border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white disabled:opacity-30 transition-all"
            >
              Next
            </button>
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-40 border border-dashed border-border mt-10">
            <h2 className="text-2xl font-bold text-muted-foreground uppercase opacity-50 tracking-widest italic">
              No {categoryName.toLowerCase()} found in inventory
            </h2>
            <Link href="/products" className="mt-6 inline-block px-8 py-3 bg-accent text-white text-xs font-bold uppercase tracking-widest">
              Browse All Products
            </Link>
          </div>
        )}

        {/* Related Categories - Internal Linking for SEO */}
        {allCategories.length > 1 && (
          <div className="mt-32 pt-20 border-t border-border">
            <h3 className="text-xl font-bold text-primary uppercase tracking-widest mb-8">
              Browse More Marine Parts Categories
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allCategories
                .filter(c => (c.slug || c._id) !== categorySlug)
                .map((cat) => (
                  <Link 
                    key={cat._id} 
                    href={`/products/${cat.slug || cat._id}`}
                    className="flex items-center justify-between p-4 bg-muted/20 border border-border hover:border-accent hover:bg-accent/5 transition-all group"
                  >
                    <span className="text-xs font-bold uppercase tracking-widest text-primary group-hover:text-accent transition-colors">
                      {cat.name}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                  </Link>
                ))}
            </div>
          </div>
        )}

        {/* Bottom SEO Content */}
        <div className="mt-20 pt-16 border-t border-border">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h3 className="text-xl font-bold text-primary uppercase tracking-widest mb-6">
                Why Buy {categoryName} from Corona Marine Parts?
              </h3>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="flex gap-4">
                  <span className="text-accent font-bold">01.</span>
                  <span>All {categoryName.toLowerCase()} sourced from Alang Ship Recycling Yard — genuine OEM components.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-accent font-bold">02.</span>
                  <span>Every part is inspected, tested, and certified by our marine technical experts.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-accent font-bold">03.</span>
                  <span>Competitive pricing — save up to 60% compared to new equipment.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-accent font-bold">04.</span>
                  <span>Worldwide shipping to all major ports via trusted logistics partners.</span>
                </li>
              </ul>
            </div>
            <div className="bg-muted/30 p-8 border border-border">
              <h3 className="text-xl font-bold text-primary uppercase tracking-widest mb-6">
                Need Help Finding {categoryName}?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Our marine sourcing specialists can help you find the exact {categoryName.toLowerCase()} you need. 
                Contact us with your requirements and we'll provide a quick quotation.
              </p>
              <div className="space-y-3">
                <a href="tel:+919376502550" className="block w-full py-3 text-center bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors">
                  Call: +91 93765 02550
                </a>
                <a href={`https://wa.me/919376502550?text=I'm looking for ${categoryName} marine spare parts`} target="_blank" className="block w-full py-3 text-center bg-[#25D366] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#1da851] transition-colors">
                  WhatsApp Inquiry
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
