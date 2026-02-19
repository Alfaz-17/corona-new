"use client"

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Calendar, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { MarineLoader } from '@/components/common/marine-loader';

export default function BlogContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await api.get('/blogs');
        setBlogs(data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, blogs]);

  if (loading) return <MarineLoader />;

  return (
    <main className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative h-[50vh] pt-32 flex items-center justify-center bg-primary overflow-hidden">
         <div className="absolute inset-0 z-0 text-white/5 font-serif text-[15rem] leading-none select-none pointer-events-none">
            BLOG
         </div>
        <div className="relative z-10 text-center text-white px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tight mb-6">
              Industry Insights
            </h1>
            <p className="text-xl text-accent font-medium uppercase tracking-widest max-w-2xl mx-auto">
              Latest news, technical guides, and tips from the maritime world
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto -mt-8 px-6 relative z-20">
         <div className="bg-white shadow-2xl p-2 border border-border">
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
               <input 
                  type="text"
                  placeholder="Search articles..."
                  className="w-full pl-12 pr-6 py-4 outline-none font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>
      </div>

      <section className="container mx-auto px-6 lg:px-8 mt-24">
        {filteredBlogs.length > 0 ? (
          <div className="space-y-24">
            {/* Featured Post */}
            <motion.article 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
               <div className="aspect-video relative overflow-hidden shadow-2xl">
                  <img src={filteredBlogs[0].image} alt={filteredBlogs[0].title} className="w-full h-full object-cover" />
               </div>
               <div>
                  <div className="flex items-center gap-4 text-accent text-xs font-bold uppercase tracking-widest mb-6">
                     <Calendar className="w-4 h-4" />
                     {new Date(filteredBlogs[0].date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <h2 className="text-4xl font-bold text-primary mb-6 leading-tight uppercase tracking-tight">
                    {filteredBlogs[0].title}
                  </h2>
                  <p className="text-lg text-muted-foreground italic mb-8 leading-relaxed">
                    {filteredBlogs[0].excerpt}
                  </p>
                  <Link href={`/blog/${filteredBlogs[0].slug || filteredBlogs[0]._id}`} className="px-8 py-4 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors inline-block">
                     Read Article
                  </Link>
               </div>
            </motion.article>

            {/* Post Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
               {filteredBlogs.slice(1).map((blog, index) => (
                  <motion.article 
                    key={blog._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                     <div className="aspect-[16/10] relative overflow-hidden mb-6 shadow-lg border border-border">
                        <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                     </div>
                     <div className="flex items-center gap-4 text-accent text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                        <Calendar className="w-3 h-3" />
                        {new Date(blog.date).toLocaleDateString()}
                     </div>
                     <h3 className="text-xl font-bold text-primary mb-4 uppercase tracking-tight group-hover:text-accent transition-colors leading-snug">
                       <Link href={`/blog/${blog.slug || blog._id}`}>{blog.title}</Link>
                     </h3>
                     <p className="text-muted-foreground text-sm line-clamp-2 italic mb-6">
                       {blog.excerpt}
                     </p>
                     <Link href={`/blog/${blog.slug || blog._id}`} className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary hover:gap-4 transition-all">
                        Explore <ArrowRight className="w-4 h-4 text-accent" />
                     </Link>
                  </motion.article>
               ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-40">
             <h2 className="text-2xl font-bold text-muted-foreground uppercase opacity-50 tracking-widest italic font-serif">Deep sea of content, yet no match found</h2>
          </div>
        )}
      </section>
    </main>
  );
}
