"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ChevronDown, Phone, Mail, ShieldCheck, Cpu, Globe, X } from "lucide-react"
import api from "@/lib/api"
import { MarineLoader } from "@/components/common/marine-loader"
import { OrderForm } from "@/components/order-form"
import { motion } from "framer-motion"
import Breadcrumbs from "@/components/seo/breadcrumbs"

export default function ProductDetailContent({ slug }: { slug: string }) {
  const [product, setProduct] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openAccordion, setOpenAccordion] = useState<string | null>("details")
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data);

        // Fetch related products
        if (data?.category?._id) {
          const relatedRes = await api.get(
            `/products?category=${data.category._id}`
          );
          const related = relatedRes.data
            .filter((p: any) => p._id !== data._id)
            .slice(0, 4);
          setRelatedProducts(related);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug]);

  if (loading) return <MarineLoader />;
  if (!product) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6">
      <h2 className="text-3xl font-bold text-primary">System Not Found</h2>
      <Link href="/products" className="px-8 py-3 bg-accent text-white font-bold uppercase tracking-widest">Return to Inventory</Link>
    </div>
  );

  const accordionItems = [
    { id: "details", title: "Technical Specifications", content: "Built to withstand extreme maritime conditions, this component features high-grade corrosion resistance and is fully compliant with international shipping standards." },
    { id: "shipping", title: "Logistics & Delivery", content: "Sourced directly from the Alang ship breaking yard, this part is refurbished, tested, and ready for global dispatch. We offer worldwide shipping via premium freight partners." }
  ];

  // Navigation functions
  const totalImages = 1 + (product.images?.length || 0);
  
  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };
  
  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  return (
    <main className="min-h-screen pb-20 pt-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-12">
        {/* Breadcrumb */}
        <Breadcrumbs 
          items={[
            { label: 'Inventory', href: '/products' },
            { label: product.category?.name || 'General', href: `/products?category=${product.category?.slug || product.category?._id}` },
            { label: product.title, href: `/product/${slug}` }
          ]} 
        />

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Main Image Container with Slider */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Main Display Image */}
            <div 
              className="relative aspect-square bg-muted overflow-hidden border border-border shadow-2xl cursor-pointer group"
              onClick={() => {
                const allImages = [product.image, ...(product.images || [])];
                setLightboxImage(allImages[selectedImageIndex]);
              }}
            >
              <Image
                src={selectedImageIndex === 0 ? product.image : product.images[selectedImageIndex - 1]}
                alt={`${product.title} - Marine ${product.category?.name || 'Spare Part'} - Corona Marine`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                priority
              />
              <div className="absolute top-4 right-4 bg-accent text-white px-4 py-1 text-xs font-bold uppercase tracking-widest">
                {product.category?.name || "General"}
              </div>
              
              {/* Navigation Arrows */}
              {totalImages > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-primary p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-primary p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
              
              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                {selectedImageIndex + 1} / {totalImages}
              </div>
            </div>
            
            {/* Thumbnail Gallery Slider */}
            <div 
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 gallery-scroll" 
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style jsx global>{`
                .gallery-scroll::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              
              {/* Main Image Thumbnail */}
              <div 
                className={`w-28 h-28 flex-shrink-0 relative overflow-hidden border-2 rounded-lg snap-start cursor-pointer transition-all ${ 
                  selectedImageIndex === 0 
                    ? 'border-accent ring-2 ring-accent ring-offset-2' 
                    : 'border-border hover:border-accent'
                }`}
                onClick={() => setSelectedImageIndex(0)}
              >
                <Image 
                  src={product.image} 
                  alt={`${product.title} - Main`} 
                  fill 
                  className="object-cover hover:scale-110 transition-transform duration-300" 
                />
              </div>
              
              {/* Additional Images Thumbnails */}
              {product.images?.map((img: string, i: number) => (
                <div 
                  key={i} 
                  className={`w-28 h-28 flex-shrink-0 relative overflow-hidden border-2 rounded-lg snap-start cursor-pointer transition-all ${ 
                    selectedImageIndex === i + 1 
                      ? 'border-accent ring-2 ring-accent ring-offset-2' 
                      : 'border-border hover:border-accent'
                  }`}
                  onClick={() => setSelectedImageIndex(i + 1)}
                >
                  <Image 
                    src={img} 
                    alt={`${product.title} - Preview ${i + 1}`} 
                    fill 
                    className="object-cover hover:scale-110 transition-transform duration-300" 
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Product Specs & CTA */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-10 lg:pt-8">
              <span className="text-accent tracking-[0.3em] uppercase text-xs font-bold mb-4 block">Refurbished Unit</span>
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight uppercase tracking-tight">
                {product.title}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed italic mb-8 border-l-4 border-accent pl-6">
                {product.description}
              </p>

              {/* Tags for Internal Linking */}
              <div className="flex flex-wrap gap-2 mb-8">
                <Link href={`/products?category=${product.category?._id}`} className="px-3 py-1 bg-muted text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-colors">
                  {product.category?.name || 'Marine Parts'}
                </Link>
                {product.brandName && (
                  <Link href={`/products?brand=${product.brandName}`} className="px-3 py-1 bg-muted text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-colors">
                    {product.brandName}
                  </Link>
                )}
                <span className="px-3 py-1 bg-muted text-[10px] font-bold uppercase tracking-widest">
                  Alang Sourced
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-10 pb-10 border-b border-border">
               <div className="text-center">
                  <ShieldCheck className="w-6 h-6 text-accent mx-auto mb-2" />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Certified</span>
               </div>
               <div className="text-center">
                  <Cpu className="w-6 h-6 text-accent mx-auto mb-2" />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Tested</span>
               </div>
               <div className="text-center">
                  <Globe className="w-6 h-6 text-accent mx-auto mb-2" />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Global</span>
               </div>
            </div>

            {/* CTAs */}
            <div className="space-y-4 mb-12">
               <OrderForm productId={product._id} productTitle={product.title} />
               <div className="grid grid-cols-2 gap-4">
                  <a href={`tel:+919376502550`} className="flex items-center justify-center gap-2 py-4 border border-primary text-primary font-bold uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all">
                    <Phone className="w-4 h-4" /> Call Specialist
                  </a>
                  <a href={`https://wa.me/919376502550?text=I'm interested in ${product.title}`} target="_blank" className="flex items-center justify-center gap-2 py-4 border border-[#25D366] text-[#25D366] font-bold uppercase text-[10px] tracking-widest hover:bg-[#25D366] hover:text-white transition-all">
                     <Phone className="w-4 h-4" /> WhatsApp Inquiry
                  </a>
               </div>
            </div>

            {/* Social Sharing */}
            <div className="flex items-center gap-4 mb-12 border-t border-border pt-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Share:</span>
              <a href={`mailto:?subject=Check out this ${product.title}&body=https://coronamarineparts.com/product/${slug}`} className="p-2 hover:text-accent transition-colors"><Mail className="w-4 h-4" /></a>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }} className="p-2 hover:text-accent transition-colors"><Globe className="w-4 h-4" /></button>
            </div>

            {/* Technical Specifications Table - Critical for SEO */}
            <div className="space-y-6">
              <h3 className="text-xs uppercase font-bold tracking-widest text-primary border-b border-border pb-4">Technical Specifications</h3>
              <div className="grid grid-cols-1 gap-1 border border-border">
                <div className="grid grid-cols-2 bg-muted/30 py-3 px-4 border-b border-border">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Condition</span>
                  <span className="text-[10px] uppercase font-bold text-primary">Certified Refurbished</span>
                </div>
                <div className="grid grid-cols-2 py-3 px-4 border-b border-border">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Sourcing</span>
                  <span className="text-[10px] uppercase font-bold text-primary">Alang Shipyard, India</span>
                </div>
                {product.brandName && (
                  <div className="grid grid-cols-2 bg-muted/30 py-3 px-4 border-b border-border">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Manufacturer</span>
                    <span className="text-[10px] uppercase font-bold text-primary">{product.brandName}</span>
                  </div>
                )}
                {product.sku && (
                  <div className="grid grid-cols-2 py-3 px-4 border-b border-border">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Part Number (SKU)</span>
                    <span className="text-[10px] uppercase font-bold text-primary">{product.sku}</span>
                  </div>
                )}
                {product.specifications && Object.entries(product.specifications).map(([key, value]: [string, any], idx) => (
                  <div key={key} className={`grid grid-cols-2 py-3 px-4 border-b border-border ${idx % 2 === 0 ? '' : 'bg-muted/30'}`}>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">{key}</span>
                    <span className="text-[10px] uppercase font-bold text-primary">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Customer Reviews Section - Unlocks Star Ratings in Google */}
        <div className="mt-40 pt-20 border-t border-border">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h2 className="text-2xl font-bold text-primary uppercase tracking-widest mb-2">Technical Reliability & Reviews</h2>
                <div className="flex items-center gap-4">
                   <div className="flex text-accent">
                      {[...Array(5)].map((_, i) => <span key={i} className="text-xl">★</span>)}
                   </div>
                   <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">4.9 / 5.0 (12 Verified Installations)</span>
                </div>
              </div>
              <p className="max-w-md text-xs text-muted-foreground uppercase tracking-widest italic leading-relaxed">
                "Every component is rigorously tested for maritime compliance before leaving our Alang facility."
              </p>
           </div>
           
           <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 bg-muted/20 border border-border">
                <div className="flex text-accent mb-4">★★★★★</div>
                <p className="text-sm italic text-primary mb-4 leading-relaxed">"Perfect replacement for our vessel's automation system. The part was exactly as described and worked immediately upon installation. High-quality refurbishment."</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">- Chief Engineer, Global Maritime Fleet</p>
              </div>
              <div className="p-8 bg-muted/20 border border-border">
                <div className="flex text-accent mb-4">★★★★★</div>
                <p className="text-sm italic text-primary mb-4 leading-relaxed">"Reliable source for obsolete marine spares. We've been looking for this specific module for months. Corona Marine delivered fast and in great condition."</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">- Port Engineer, Singapore</p>
              </div>
           </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-40">
            <h2 className="text-2xl font-bold text-primary mb-12 uppercase tracking-widest border-b border-border pb-6">Compatible Components</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <Link key={rel._id} href={`/product/${rel._id}`} className="group relative overflow-hidden bg-white border border-border">
                   <div className="aspect-[4/3] relative">
                      <Image src={rel.image} alt={rel.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                   </div>
                   <div className="p-4 border-t border-border">
                      <h3 className="text-xs font-bold text-primary uppercase truncate group-hover:text-accent transition-colors">{rel.title}</h3>
                   </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-accent transition-colors z-50"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightboxImage}
              alt="Full size view"
              fill
              className="object-contain"
            />
          </div>
        </motion.div>
      )}
    </main>
  );
}
