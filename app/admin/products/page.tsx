"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Eye, Star } from 'lucide-react';
import api from '@/lib/api';

export default function AdminProductListPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories")
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || product.category?._id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggleFeatured = async (product: any) => {
    try {
      const updatedProduct = { ...product, featured: !product.featured };
      await api.put(`/products/${product._id}`, updatedProduct);
      setProducts(products.map(p => p._id === product._id ? updatedProduct : p));
      setMessage({ type: 'success', text: `Asset ${updatedProduct.featured ? 'promoted to strategic status' : 'removed from strategic focus'}.` });
    } catch (error) {
      console.error("Error toggling featured", error);
      setMessage({ type: 'error', text: 'Status update failed.' });
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Confirm decommissioning of this inventory unit?')) return;

    try {
      await api.delete(`/products/${productId}`);
      setProducts(products.filter(p => p._id !== productId));
      setMessage({ type: 'success', text: 'Unit removed from fleet inventory.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Decommissioning failed. Check system logs.' });
    }
  };

  if (isLoading) return <div className="text-xs font-bold uppercase tracking-widest animate-pulse">Scanning Inventory...</div>;

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between border-b border-border pb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary uppercase tracking-tighter">Inventory Console</h1>
          <p className="text-xs font-bold text-accent uppercase tracking-[0.3em] mt-2">Manage Marine Components & Spares</p>
        </div>
        <Link 
          href="/admin/products/new" 
          className="px-8 py-4 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-all shadow-xl flex items-center gap-3"
        >
          <Plus className="w-4 h-4" /> Add New Asset
        </Link>
      </div>

      {message.text && (
        <div className={`p-4 text-xs font-bold uppercase tracking-widest border-l-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-500' : 'bg-red-50 text-red-700 border-red-500'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 border border-border">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-primary uppercase tracking-widest block">Search Matrix</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Title, Specs, or Brand ID..."
                className="w-full pl-10 pr-4 py-4 bg-muted/20 border border-border focus:border-accent outline-none text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-primary uppercase tracking-widest block">Sector Filter</label>
            <select
              className="w-full px-4 py-4 bg-muted/20 border border-border focus:border-accent outline-none text-xs uppercase font-bold tracking-widest"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Sectors</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
      </div>

      <div className="bg-white border border-border overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest">
                <th className="py-5 px-6">Asset Component</th>
                <th className="py-5 px-6">Sector</th>
                <th className="py-5 px-6 text-center">Focus</th>
                <th className="py-5 px-6">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 bg-muted relative border border-border shrink-0">
                          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                       </div>
                       <div>
                          <h4 className="font-bold text-primary uppercase tracking-tight text-sm mb-1">{product.title}</h4>
                          <p className="text-[10px] text-muted-foreground line-clamp-1 italic">{product.description}</p>
                       </div>
                    </div>
                  </td>
                  <td className="py-6 px-6">
                    <span className="px-3 py-1 bg-accent/10 border border-accent/20 text-accent text-[9px] font-extrabold uppercase tracking-widest">
                      {product.category?.name}
                    </span>
                  </td>
                  <td className="py-6 px-6 text-center">
                    <button
                      onClick={() => handleToggleFeatured(product)}
                      className={`p-2 transition-all duration-300 ${product.featured ? 'text-accent scale-125' : 'text-muted-foreground/30 hover:text-accent/50'}`}
                      title={product.featured ? "Strategic Asset (Featured)" : "Mark as Strategic"}
                    >
                      <Star className={`w-5 h-5 ${product.featured ? 'fill-accent' : ''}`} />
                    </button>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-4">
                      <Link href={`/admin/products/${product._id}`} className="p-2 text-primary hover:text-accent transition-colors">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
