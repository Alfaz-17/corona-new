"use client"

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { MarineLoader } from '@/components/common/marine-loader';
import { ChevronLeft } from 'lucide-react';

export default function BrandDetailPage() {
  const params = useParams();
  const brandName = params.brandName as string;
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrandProducts = async () => {
      try {
        setLoading(true);
        // Find the brand first to get its ID, or directly query products if brandName is ID
        const brandsRes = await api.get('/brands');
        const targetBrand = brandsRes.data.find((b: any) => 
          b._id === brandName || 
          b.name.toLowerCase().replace(/\s+/g, '-') === brandName.toLowerCase()
        );

        const res = await api.get(`/products?brand=${targetBrand ? targetBrand._id : brandName}`);
        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching brand products:", error);
      } finally {
        setLoading(false);
      }
    };
    if (brandName) fetchBrandProducts();
  }, [brandName]);

  if (loading) return <MarineLoader />;

  return (
    <main className="min-h-screen pb-20 pt-32">
      <div className="bg-muted/30 pb-12 border-b border-border">
         <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <Link
              href="/brands"
              className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-accent transition-colors mb-8 uppercase tracking-widest"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Brands
            </Link>
            <h1 className="text-4xl md:text-6xl font-bold text-primary uppercase tracking-wider">
              {brandName.replace(/-/g, ' ')}
            </h1>
            <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold mt-4">Authorized Inventory & Logistics</p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-16">
        {products.length === 0 ? (
           <div className="text-center py-40 border border-dashed border-border">
              <h2 className="text-2xl font-bold text-muted-foreground uppercase opacity-50 tracking-widest italic">No matching inventory for this brand</h2>
           </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <AnimatePresence>
              {products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/product/${product._id}`} className="group block h-full bg-white border border-border hover:border-accent transition-all relative">
                    <div className="aspect-[4/5] relative overflow-hidden bg-muted">
                        <Image 
                          src={product.image} 
                          alt={product.title} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-4 border-t border-border">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold mb-1 block">
                          {product.category?.name || "General"}
                        </span>
                        <h3 className="text-sm font-bold text-primary line-clamp-2 uppercase tracking-tight group-hover:text-accent transition-colors">
                          {product.title}
                        </h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
