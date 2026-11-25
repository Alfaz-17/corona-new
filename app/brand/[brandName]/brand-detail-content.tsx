"use client"

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { MarineLoader } from '@/components/common/marine-loader';
import { ChevronLeft } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import Breadcrumbs from '@/components/seo/breadcrumbs';

export default function BrandDetailContent({
  initialProducts,
  initialBrandInfo,
}: {
  initialProducts?: any[];
  initialBrandInfo?: any;
}) {
  const params = useParams();
  const brandName = params.brandName as string;
  const [products, setProducts] = useState<any[]>(initialProducts || []);
  const [brandInfo, setBrandInfo] = useState<any>(initialBrandInfo || null);
  const [loading, setLoading] = useState(initialProducts === undefined);

  const displayName = brandInfo?.name || decodeURIComponent(brandName).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  useEffect(() => {
    if (initialProducts !== undefined) return;
    const fetchBrandProducts = async () => {
      try {
        setLoading(true);
        const brandsRes = await api.get('/brands');
        const targetBrand = brandsRes.data.find((b: any) => 
          b._id === brandName || 
          b.name.toLowerCase().replace(/\s+/g, '-') === brandName.toLowerCase() ||
          b.name === decodeURIComponent(brandName)
        );

        if (targetBrand) {
          setBrandInfo(targetBrand);
        }

        const res = await api.get(`/products?brand=${targetBrand ? targetBrand._id : brandName}`);
        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching brand products:", error);
      } finally {
        setLoading(false);
      }
    };
    if (brandName) fetchBrandProducts();
  }, [brandName, initialProducts]);

  if (loading) return <MarineLoader />;

  return (
    <main className="min-h-screen pb-20 pt-32">
      <div className="bg-muted/30 pb-12 border-b border-border">
         <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <Breadcrumbs items={[
              { label: 'Brands', href: '/brands' },
              { label: displayName, href: `/brand/${brandName}` },
            ]} />
            
            <h1 className="text-4xl md:text-6xl font-bold text-primary uppercase tracking-wider mt-6">
              {displayName}
            </h1>
            <p className="text-muted-foreground text-sm mt-4 max-w-2xl leading-relaxed">
              {brandInfo?.description?.trim() ? (
                brandInfo.description
              ) : (
                <>
                  Browse genuine <strong>{displayName}</strong> marine spare parts and ship equipment sourced from 
                  Alang Shipyard. All components are tested and certified by Corona Marine Parts.
                </>
              )}
            </p>
            <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold mt-4">
              {products.length} {displayName} products in inventory
            </p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-16">
        {products.length === 0 ? (
           <div className="text-center py-40 border border-dashed border-border">
              <h2 className="text-2xl font-bold text-muted-foreground uppercase opacity-50 tracking-widest italic">No {displayName} products found in inventory</h2>
              <Link href="/products" className="mt-6 inline-block px-8 py-3 bg-accent text-white text-xs font-bold uppercase tracking-widest">
                Browse All Products
              </Link>
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
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* SEO Content for Brand */}
        <div className="mt-32 pt-16 border-t border-border">
          <h2 className="text-xl font-bold text-primary uppercase tracking-widest mb-6">
            Buy {displayName} Marine Spare Parts from Corona Marine Parts
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl mb-8">
            Corona Marine Parts is a trusted supplier of genuine {displayName} marine equipment and spare parts. 
            All {displayName} components are sourced from Alang Ship Recycling Yard, the world's largest ship 
            breaking facility. Each part is thoroughly inspected, tested, and certified before worldwide dispatch. 
            Contact us for the best prices on {displayName} marine spare parts.
          </p>
          <div className="flex gap-4">
            <a href="tel:+919376502550" className="px-8 py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors">
              Call for {displayName} Parts
            </a>
            <a href={`https://wa.me/919376502550?text=I'm looking for ${displayName} marine spare parts`} target="_blank" className="px-8 py-3 bg-[#25D366] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#1da851] transition-colors">
              WhatsApp Inquiry
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
