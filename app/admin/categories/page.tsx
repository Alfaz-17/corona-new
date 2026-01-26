"use client"

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, LayoutGrid } from 'lucide-react';
import api from '@/lib/api';

export default function AdminCategoryPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const res = await api.post('/categories', { name: newCategory });
      setCategories([...categories, res.data]);
      setNewCategory('');
      setMessage({ type: 'success', text: 'New fleet sector registered.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Registration failure.' });
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      const res = await api.put(`/categories/${id}`, { name: editingName });
      setCategories(categories.map(c => c._id === id ? res.data : c));
      setEditingId(null);
      setMessage({ type: 'success', text: 'Sector designation updated.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Update failure.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Decommission this sector? This may affect linked assets.')) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(categories.filter(c => c._id !== id));
      setMessage({ type: 'success', text: 'Sector decommissioned.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Operation failed.' });
    }
  };

  if (isLoading) return <div className="text-xs font-bold uppercase tracking-widest animate-pulse">Scanning Sectors...</div>;

  return (
    <div className="max-w-4xl space-y-12">
      <div className="border-b border-border pb-8">
        <h1 className="text-3xl font-bold text-primary uppercase tracking-tighter">Sector Management</h1>
        <p className="text-xs font-bold text-accent uppercase tracking-[0.3em] mt-2">Classify Fleet Inventory & Components</p>
      </div>

      {message.text && (
        <div className={`p-4 text-xs font-bold uppercase tracking-widest border-l-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-500' : 'bg-red-50 text-red-700 border-red-500'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white p-10 border border-border">
         <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-8">Register New Sector</h2>
         <form onSubmit={handleAddCategory} className="flex gap-4">
            <input 
              type="text" 
              placeholder="Sector Name (e.g. Navigation Systems)" 
              className="flex-1 px-6 py-4 bg-muted/20 border border-border focus:border-accent outline-none text-xs font-bold"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              required
            />
            <button type="submit" className="px-10 py-4 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors shadow-xl">
               Register
            </button>
         </form>
      </div>

      <div className="bg-white border border-border shadow-2xl">
         <table className="w-full text-left">
            <thead>
               <tr className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest">
                  <th className="py-5 px-8">Sector Designation</th>
                  <th className="py-5 px-8 text-right">Operations</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-border">
               {categories.map(cat => (
                  <tr key={cat._id} className="hover:bg-muted/30 transition-colors">
                     <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                           <LayoutGrid className="w-5 h-5 text-accent" />
                           {editingId === cat._id ? (
                              <input 
                                type="text"
                                className="px-4 py-2 border border-accent bg-blue-50/50 outline-none text-sm font-bold w-full max-w-xs"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory(cat._id)}
                              />
                           ) : (
                              <span className="text-sm font-bold text-primary uppercase tracking-tight">{cat.name}</span>
                           )}
                        </div>
                     </td>
                     <td className="py-6 px-8 text-right">
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
                                    onClick={() => { setEditingId(cat._id); setEditingName(cat.name); }} 
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
                     <td colSpan={2} className="py-20 text-center text-xs font-bold text-muted-foreground uppercase opacity-50 italic">No sectors registered in the grid</td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
}
