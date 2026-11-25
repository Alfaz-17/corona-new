"use client"

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import api from "@/lib/api";

export function BrandGrid({ initialBrands }: { initialBrands?: any[] }) {
  const [brands, setBrands] = useState<any[]>(initialBrands || []);
  const [loading, setLoading] = useState(!initialBrands);

  useEffect(() => {
    if (initialBrands && initialBrands.length > 0) return;
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

  if (loading || brands.length === 0) return null;

  // Quadruple brands for a truly infinite feel on large screens
  const duplicatedBrands = [...brands, ...brands, ...brands, ...brands];

  return (
    <section className="py-24 bg-background border-t border-border/30 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8 mb-16">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-[10px] tracking-[0.4em] uppercase text-accent font-bold mb-4">Strategic Partners</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-primary uppercase tracking-tighter">Global Brand Integration</h3>
        </motion.div>
      </div>

      <div className="relative flex overflow-hidden">
        <div className="flex animate-infinite-scroll gap-12 whitespace-nowrap py-4">
          {duplicatedBrands.map((brand, index) => (
            <Link
              key={`${brand._id}-${index}`}
              href={`/brand/${encodeURIComponent(brand.name)}`}
              className="flex-none w-48 h-24 relative group bg-white border border-border/10 hover:border-accent/40 transition-all duration-700 p-6 block"
            >
              <img
                src={brand.logo}
                alt={`${brand.name} Marine Spare Parts`}
                className="w-full h-full object-contain opacity-60 group-hover:opacity-100 transition-all duration-700"
              />
            </Link>
          ))}
        </div>
        
        {/* Gradient Overlays for smooth edges */}
        <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      </div>

      <style jsx>{`
        @keyframes infinite-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 40s linear infinite;
        }
        .animate-infinite-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
