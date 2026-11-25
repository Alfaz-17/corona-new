"use client"

import React, { useState } from 'react';
import { Trash2, Edit2, LayoutGrid } from 'lucide-react';
import api from '@/lib/api';

import useSWR from 'swr';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function AdminCategoryPage() {
  const { data: categories = [], error, mutate } = useSWR('/categories', fetcher);

  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const isLoading = !error && !categories.length && categories.length === 0;
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingSlug, setEditingSlug] = useState('');
  const [editingDescription, setEditingDescription] = useState('');

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      await api.post('/categories', {
        name: newCategory,
        description: newDescription.trim() || undefined,
      });
      mutate();
      setNewCategory('');
      setNewDescription('');
      setMessage({ type: 'success', text: 'Category added successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Could not add category. Please try again.' });
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      await api.put(`/categories/${id}`, {
        name: editingName,
        slug: editingSlug.trim() || undefined,
        description: editingDescription.trim(),
      });
      mutate();
      setEditingId(null);
      setMessage({ type: 'success', text: 'Category updated.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Could not update. Please try again.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category? Products in this category will be affected.')) return;
    try {
      await api.delete(`/categories/${id}`);
      mutate();
      setMessage({ type: 'success', text: 'Category deleted.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Could not delete. Please try again.' });
    }
  };

  if (isLoading) return <div className="text-xs font-bold uppercase tracking-widest animate-pulse">Loading Categories...</div>;

  return (
    <div className="max-w-4xl space-y-12">
      <div className="border-b border-border pb-8">
        <h1 className="text-3xl font-bold text-primary uppercase tracking-tighter">Categories</h1>
        <p className="text-xs font-bold text-accent uppercase tracking-[0.3em] mt-2">Organize Your Products & Category SEO</p>
      </div>

      {message.text && (
        <div className={`p-4 text-xs font-bold uppercase tracking-widest border-l-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-500' : 'bg-red-50 text-red-700 border-red-500'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white p-10 border border-border">
         <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-8">Add New Category</h2>
         <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Category name (e.g. Marine Engines)"
                className="flex-1 px-6 py-4 bg-muted/20 border border-border focus:border-accent outline-none text-xs font-bold"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                required
              />
              <button type="submit" className="px-10 py-4 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors shadow-xl">
                 Add
              </button>
            </div>
            <textarea
              placeholder="Optional SEO category description (displayed on /products/[category])"
              className="w-full px-6 py-3 bg-muted/20 border border-border focus:border-accent outline-none text-xs min-h-[70px]"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
         </form>
      </div>

      <div className="bg-white border border-border shadow-2xl">
         <table className="w-full text-left">
            <thead>
               <tr className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest">
                  <th className="py-5 px-8">Category & SEO Description</th>
                  <th className="py-5 px-8 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-border">
               {categories.map((cat: any) => (
                  <tr key={cat._id} className="hover:bg-muted/30 transition-colors">
                     <td className="py-6 px-8">
                        <div className="flex items-start gap-4">
                           <LayoutGrid className="w-5 h-5 text-accent shrink-0 mt-1" />
                           {editingId === cat._id ? (
                              <div className="space-y-3 w-full">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    placeholder="Category name"
                                    className="px-4 py-2 border border-accent bg-blue-50/50 outline-none text-sm font-bold w-full"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    autoFocus
                                  />
                                  <input
                                    type="text"
                                    placeholder="URL slug"
                                    className="px-4 py-2 border border-border bg-muted/20 outline-none text-xs font-mono w-full"
                                    value={editingSlug}
                                    onChange={(e) => setEditingSlug(e.target.value)}
                                  />
                                </div>
                                <textarea
                                  placeholder="Category SEO description..."
                                  className="px-4 py-2 border border-border bg-muted/20 outline-none text-xs w-full min-h-[70px]"
                                  value={editingDescription}
                                  onChange={(e) => setEditingDescription(e.target.value)}
                                />
                              </div>
                           ) : (
                              <div>
                                <span className="text-sm font-bold text-primary uppercase tracking-tight block">{cat.name}</span>
                                <span className="text-[10px] text-muted-foreground font-mono block">/products/{cat.slug || cat._id}</span>
                                {cat.description && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{cat.description}</p>
                                )}
                              </div>
                           )}
                        </div>
                     </td>
                     <td className="py-6 px-8 text-right align-top">
                        <div className="flex justify-end gap-2">
                           {editingId === cat._id ? (
                              <>
                                 <button onClick={() => handleUpdateCategory(cat._id)} className="text-green-600 hover:text-green-800 p-2 font-bold text-[10px] uppercase tracking-widest">
                                    Save
                                 </button>
                                 <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-primary p-2 font-bold text-[10px] uppercase tracking-widest">
                                    Cancel
                                 </button>
                              </>
                           ) : (
                              <>
                                 <button
                                    onClick={() => {
                                      setEditingId(cat._id);
                                      setEditingName(cat.name || '');
                                      setEditingSlug(cat.slug || '');
                                      setEditingDescription(cat.description || '');
                                    }}
                                    className="text-primary hover:text-accent p-2"
                                 >
                                    <Edit2 className="w-4 h-4" />
                                 </button>
                                 <button onClick={() => handleDelete(cat._id)} className="text-red-500 hover:text-red-700 p-2">
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </>
                           )}
                        </div>
                     </td>
                  </tr>
               ))}
               {categories.length === 0 && (
                  <tr>
                     <td colSpan={2} className="py-20 text-center text-xs font-bold text-muted-foreground uppercase opacity-50 italic">No categories added yet</td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
}
