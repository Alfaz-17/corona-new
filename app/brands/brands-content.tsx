"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { MarineLoader } from '@/components/common/marine-loader';
import Breadcrumbs from '@/components/seo/breadcrumbs';

export default function BrandsContent({ initialBrands }: { initialBrands?: any[] }) {
  const [brands, setBrands] = useState<any[]>(initialBrands || []);
  const [loading, setLoading] = useState(initialBrands === undefined);

  useEffect(() => {
    if (initialBrands !== undefined) return;
    const fetchBrands = async () => {
      try {
        const res = await api.get("/brands");
        setBrands(res.data);
      } catch (error) {
        console.error("Error fetching brands:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, [initialBrands]);

  if (loading) return <MarineLoader />;

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[40vh] pt-32 flex items-center justify-center bg-primary overflow-hidden">
         <div className="absolute inset-0 z-0">
          <img 
            src="/pexels-pixabay-163726.jpg" 
            alt="Marine Equipment Brands - Trusted Manufacturers for Ship Spare Parts" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 text-center text-white px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-extrabold uppercase tracking-wider mb-4">
              Trusted Marine Brands
            </h1>
            <p className="text-xl text-accent font-medium uppercase tracking-widest">
              We supply parts from industry-leading marine manufacturers worldwide
            </p>
          </motion.div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="container mx-auto px-6 lg:px-8 mt-8">
        <Breadcrumbs items={[
          { label: 'Brands', href: '/brands' },
        ]} />
      </div>

      {/* Brands Grid */}
      <section className="py-16 container mx-auto px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-primary uppercase tracking-widest mb-4">
          Marine Equipment Manufacturers & Brands
        </h2>
        <p className="text-muted-foreground mb-12 max-w-3xl leading-relaxed">
          Corona Marine Parts supplies genuine spare parts and components from the world's leading marine 
          equipment manufacturers. All parts are sourced from Alang Shipyard and quality-verified before shipping worldwide.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {brands.map((brand, index) => (
            <Link 
              key={brand._id}
              href={`/brand/${encodeURIComponent(brand.name)}`}
            >
              <motion.div
                className="relative group aspect-square bg-white border border-border overflow-hidden hover:border-accent transition-all duration-500 shadow-sm hover:shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="absolute inset-0 p-8 flex items-center justify-center">
                  <img
                    src={brand.logo}
                    alt={`${brand.name} - Marine Equipment Manufacturer | Ship Spare Parts Brand`}
                    title={`${brand.name} Marine Parts`}
                    className="max-h-full max-w-full object-contain transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                     <h3 className="text-white font-bold text-center uppercase tracking-widest text-sm">{brand.name}</h3>
                     <span className="text-accent text-[10px] uppercase tracking-widest mt-2 font-bold">View Parts →</span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-16 bg-muted/20 border-t border-border">
        <div className="container mx-auto px-6 lg:px-8">
          <h3 className="text-xl font-bold text-primary uppercase tracking-widest mb-6">
            Genuine Marine Parts from Top Manufacturers
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
            Corona Marine Parts is your trusted source for genuine spare parts from the world's leading marine equipment 
            manufacturers. Whether you need automation systems, engine components, navigation equipment, or safety gear, 
            we supply parts from brands like Kongsberg Maritime, ABB Marine, Wärtsilä, MAN Energy Solutions, 
            Caterpillar Marine, Rolls-Royce Marine, and many more. All components are sourced from Alang Ship 
            Recycling Yard, thoroughly tested, and certified before worldwide dispatch.
          </p>
        </div>
      </section>
    </main>
  );
}
