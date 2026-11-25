"use client"

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Grid3X3,
  Award,
  FileText,
  ArrowUpRight,
  ShoppingCart,
  TrendingUp,
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/products/dashboard/stats');
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="text-xs font-bold uppercase tracking-widest animate-pulse p-4">Loading data...</div>;

  const cards = [
    { title: 'Total Products', value: stats.products, icon: Package, href: '/admin/products' },
    { title: 'Categories', value: stats.categories, icon: Grid3X3, href: '/admin/categories' },
    { title: 'Brands', value: stats.brands, icon: Award, href: '/admin/brands' },
    { title: 'Blog Posts', value: stats.blogs, icon: FileText, href: '/admin/blogs' },
    { title: 'Customer Orders', value: stats.orders || 0, icon: ShoppingCart, href: '/admin/orders' },
  ];

  const seoHealth = stats.seoHealth;

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end border-b border-border pb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary uppercase tracking-tighter">Dashboard</h1>
          <p className="text-xs font-bold text-accent uppercase tracking-[0.3em] mt-2">Overview of your products, store & SEO health</p>
        </div>
        <div className="text-right">
           <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Last Updated</span>
           <span className="text-xs font-bold text-primary">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-8 border border-border group hover:border-accent transition-all relative overflow-hidden"
          >
            <card.icon className="w-8 h-8 text-accent mb-6 group-hover:scale-110 transition-transform" />
            <dt className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{card.title}</dt>
            <dd className="text-4xl font-extrabold text-primary tracking-tighter">{card.value}</dd>
            <Link href={card.href} className="absolute top-4 right-4 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
               <ArrowUpRight className="w-5 h-5 text-accent" />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* SEO Health & Monthly Optimization Monitor */}
      {seoHealth && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 border border-border space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-accent" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Catalog SEO Health</h2>
              </div>
              <span className="text-xs font-extrabold text-primary px-3 py-1 bg-muted border border-border">
                Avg Score: {seoHealth.averagePercentage}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/20 border border-border">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Fully Optimized</span>
                <span className="text-2xl font-extrabold text-green-700 flex items-center gap-2 mt-1">
                  <CheckCircle2 className="w-5 h-5" /> {seoHealth.optimizedCount}
                </span>
              </div>
              <div className="p-4 bg-muted/20 border border-border">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Needs Work</span>
                <span className="text-2xl font-extrabold text-amber-600 flex items-center gap-2 mt-1">
                  <AlertTriangle className="w-5 h-5" /> {seoHealth.needsOptimization}
                </span>
              </div>
              <div className="p-4 bg-muted/20 border border-border">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">No Primary KW</span>
                <span className="text-2xl font-extrabold text-primary mt-1 block">{seoHealth.missingPrimaryKeyword}</span>
              </div>
              <div className="p-4 bg-muted/20 border border-border">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">No Image ALT</span>
                <span className="text-2xl font-extrabold text-primary mt-1 block">{seoHealth.missingImageAlt}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <p className="text-xs text-muted-foreground">
                Missing Meta Description: <strong>{seoHealth.missingMetaDescription}</strong> · Missing Specs: <strong>{seoHealth.missingSpecs}</strong> · Category Slugs Missing: <strong>{seoHealth.categoryMissingSlug || 0}</strong>
              </p>
              <Link href="/admin/seo" className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline">
                Open SEO Command Center →
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 border border-border space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-border pb-4">
              Google Tools & Feeds
            </h2>
            <ul className="space-y-3 text-xs">
              <li>
                <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-primary hover:text-accent font-medium">
                  <span>Google Search Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-primary hover:text-accent font-medium">
                  <span>Rich Results Test</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-primary hover:text-accent font-medium">
                  <span>Google Analytics 4</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li className="pt-2 border-t border-border">
                <a href="/sitemap.xml" target="_blank" className="flex items-center justify-between text-muted-foreground hover:text-primary">
                  <span>XML Sitemap (/sitemap.xml)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a href="/image-sitemap.xml" target="_blank" className="flex items-center justify-between text-muted-foreground hover:text-primary">
                  <span>Image Sitemap (/image-sitemap.xml)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a href="/api/feed/google-merchant" target="_blank" className="flex items-center justify-between text-muted-foreground hover:text-primary">
                  <span>Google Merchant Feed</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8 mt-12">
        <div className="bg-primary p-10 text-white relative h-64 flex flex-col justify-center">
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4">Manage Products</h2>
            <p className="text-white/60 text-sm italic mb-8">Maintain the high standard of Corona Marine by reviewing and updating your product catalog.</p>
            <Link href="/admin/products" className="inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-accent hover:gap-6 transition-all">
              Manage Products <ArrowUpRight className="w-4 h-4" />
            </Link>
        </div>
        <div className="bg-white p-10 border border-border h-64 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-primary uppercase tracking-tight mb-4">Blog & Brands</h2>
            <p className="text-muted-foreground text-sm mb-8">Publish blog posts or manage brand partners to keep your customers informed.</p>
            <div className="flex gap-6">
                <Link href="/admin/blogs" className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-primary">Update Blog</Link>
                <Link href="/admin/brands" className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-primary">Manage Brands</Link>
            </div>
        </div>
      </div>
    </div>
  );
}
