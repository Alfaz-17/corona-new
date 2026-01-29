"use client"

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Grid3X3, Award, FileText, ArrowUpRight, ShoppingCart } from 'lucide-react';
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

  if (!stats) return <div className="text-xs font-bold uppercase tracking-widest animate-pulse p-4">Syncing system data...</div>;

  const cards = [
    { title: 'Total Inventory', value: stats.products, icon: Package, href: '/admin/products' },
    { title: 'Categories', value: stats.categories, icon: Grid3X3, href: '/admin/categories' },
    { title: 'Partner Brands', value: stats.brands, icon: Award, href: '/admin/brands' },
    { title: 'Technical Blogs', value: stats.blogs, icon: FileText, href: '/admin/blogs' },
    { title: 'Customer Orders', value: stats.orders || 0, icon: ShoppingCart, href: '/admin/orders' },
  ];

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end border-b border-border pb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary uppercase tracking-tighter">Command Center</h1>
          <p className="text-xs font-bold text-accent uppercase tracking-[0.3em] mt-2">Real-time Fleet & Inventory Overview</p>
        </div>
        <div className="text-right">
           <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Last Updated</span>
           <span className="text-xs font-bold text-primary">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
      
      <div className="grid lg:grid-cols-2 gap-8 mt-12">
        <div className="bg-primary p-10 text-white relative h-64 flex flex-col justify-center">
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4">Inventory Operations</h2>
            <p className="text-white/60 text-sm italic mb-8">Maintain the high standard of Corona Marine by reviewing and updating the spare parts catalog.</p>
            <Link href="/admin/products" className="inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-accent hover:gap-6 transition-all">
              Manage Components <ArrowUpRight className="w-4 h-4" />
            </Link>
        </div>
        <div className="bg-white p-10 border border-border h-64 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-primary uppercase tracking-tight mb-4">Content Strategy</h2>
            <p className="text-muted-foreground text-sm mb-8">Publish technical insights or new brand partnerships to keep your clients informed.</p>
            <div className="flex gap-6">
                <Link href="/admin/blogs" className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-primary">Update Blog</Link>
                <Link href="/admin/brands" className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-primary">Manage Brands</Link>
            </div>
        </div>
      </div>
    </div>
  );
}
