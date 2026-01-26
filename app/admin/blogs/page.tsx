"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Edit2, FileText, Search, Calendar } from 'lucide-react';
import api from '@/lib/api';

export default function AdminBlogListPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await api.get('/blogs');
        setBlogs(data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Retract this industry bulletin?')) return;
    try {
      await api.delete(`/blogs/${id}`);
      setBlogs(blogs.filter(b => b._id !== id));
      setMessage({ type: 'success', text: 'Article retracted.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Operation failed.' });
    }
  };

  const filteredBlogs = blogs.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

  if (isLoading) return <div className="text-xs font-bold uppercase tracking-widest animate-pulse">Syncing Intel Grid...</div>;

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between border-b border-border pb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary uppercase tracking-tighter">Intel & Briefing</h1>
          <p className="text-xs font-bold text-accent uppercase tracking-[0.3em] mt-2">Manage Industry Reports & Technical Bulletins</p>
        </div>
        <Link 
          href="/admin/blogs/new" 
          className="px-8 py-4 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-all shadow-xl flex items-center gap-3"
        >
          <Plus className="w-4 h-4" /> Draft New Intel
        </Link>
      </div>

      {message.text && (
        <div className={`p-4 text-xs font-bold uppercase tracking-widest border-l-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-500' : 'bg-red-50 text-red-700 border-red-500'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white p-8 border border-border">
         <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
               type="text"
               placeholder="Search Technical Briefings..."
               className="w-full pl-12 pr-6 py-4 bg-muted/20 border border-border focus:border-accent outline-none text-xs font-bold"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {filteredBlogs.map((blog, idx) => (
            <div key={blog._id} className="bg-white border border-border flex flex-col group h-full">
               <div className="aspect-[16/10] relative overflow-hidden bg-muted">
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 flex gap-2">
                     <span className="px-2 py-1 bg-primary text-white text-[8px] font-bold uppercase tracking-widest">{new Date(blog.date).toLocaleDateString()}</span>
                  </div>
               </div>
               <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                     <h3 className="text-lg font-bold text-primary uppercase tracking-tight mb-4 group-hover:text-accent transition-colors line-clamp-2">{blog.title}</h3>
                     <p className="text-[10px] text-muted-foreground italic line-clamp-3 mb-6">{blog.excerpt}</p>
                  </div>
                  <div className="flex justify-between items-center border-t border-border pt-4">
                     <span className="text-[9px] font-extrabold text-accent uppercase tracking-widest">Published State</span>
                     <div className="flex gap-2">
                        <Link href={`/admin/blogs/${blog._id}`} className="p-2 text-primary hover:bg-muted transition-colors">
                           <Edit2 className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(blog._id)} className="p-2 text-red-500 hover:bg-red-50 transition-colors">
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
