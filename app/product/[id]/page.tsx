"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ChevronLeft, ChevronDown, Phone, Mail, CheckCircle2, ShieldCheck, Cpu, Globe } from "lucide-react"
import api from "@/lib/api"
import { MarineLoader } from "@/components/common/marine-loader"
import { EnquiryModal } from "@/components/enquiry-modal"
import { motion } from "framer-motion"

export default function ProductDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [product, setProduct] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openAccordion, setOpenAccordion] = useState<string | null>("details")

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${id}`);
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

    if (id) fetchProduct();
  }, [id]);

  if (loading) return <MarineLoader />;
  if (!product) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6">
      <h2 className="text-3xl font-bold text-primary">System Not Found</h2>
      <Link href="/products" className="px-8 py-3 bg-accent text-white font-bold uppercase tracking-widest">Return to Inventory</Link>
    </div>
  );

  const accordionItems = [
    { id: "details", title: "Technical Specifications", content: "Built to withstand extreme maritime conditions, this component features high-grade corrosion resistance and is fully compliant with international shipping standards." },
    { id: "shipping", title: "Logistics & Delivery", content: "Sourced directly from the Alang ship breaking yard, this part is refurbished, tested, and ready for global dispatch. We offer worldwide shipping via premium freight partners." },
    { id: "support", title: "Support & Warranty", content: "All our reconditioned parts come with a specialized warranty. Technical support is available 24/7 for installation and troubleshooting." }
  ];

  return (
    <main className="min-h-screen pb-20 pt-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-12">
        {/* Breadcrumb */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-accent transition-colors mb-12 uppercase tracking-widest"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Inventory
        </Link>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Main Image Container */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="relative aspect-square bg-muted overflow-hidden border border-border shadow-2xl">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute top-4 right-4 bg-accent text-white px-4 py-1 text-xs font-bold uppercase tracking-widest">
                {product.category?.name || "General"}
              </div>
            </div>
            
            {/* Asset Grid (Simulated for refurb parts) */}
            <div className="grid grid-cols-4 gap-4">
               {[1,2,3,4].map(i => (
                  <div key={i} className="aspect-square bg-muted border border-border opacity-50 relative overflow-hidden">
                     <Image src={product.image} alt="Refurb Detail" fill className="object-cover filter grayscale" />
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
               <EnquiryModal productName={product.title} />
               <div className="grid grid-cols-2 gap-4">
                  <a href={`tel:+919376502550`} className="flex items-center justify-center gap-2 py-4 border border-primary text-primary font-bold uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all">
                    <Phone className="w-4 h-4" /> Call +91 93765 02550
                  </a>
                  <a href={`mailto:coronamarine5050@gmail.com?subject=Enquiry for ${product.title}`} className="flex items-center justify-center gap-2 py-4 border border-primary text-primary font-bold uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all">
                     <Mail className="w-4 h-4" /> Email Inquiry
                  </a>
               </div>
            </div>

            {/* Accordions */}
            <div className="space-y-2">
              {accordionItems.map((item) => (
                <div key={item.id} className="border-b border-border">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === item.id ? null : item.id)}
                    className="w-full flex items-center justify-between py-5 text-left group"
                  >
                    <span className="text-xs uppercase font-bold tracking-widest text-primary group-hover:text-accent transition-colors">{item.title}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${openAccordion === item.id ? "rotate-180 text-accent" : ""}`} />
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: openAccordion === item.id ? "auto" : 0 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 text-sm text-muted-foreground leading-relaxed">
                      {item.content}
                    </p>
                  </motion.div>
                </div>
              ))}
            </div>
          </motion.div>
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
    </main>
  );
}
