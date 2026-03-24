"use client"

import React, { useState } from 'react';
import { Plus, Trash2, Award, Upload, X } from 'lucide-react';
import api from '@/lib/api';
import { uploadToCloudinary } from '@/lib/utils/cloudinary';
import useSWR from 'swr';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function AdminBrandPage() {
  const { data: brands = [], error, mutate } = useSWR('/brands', fetcher);
  
  const [newBrand, setNewBrand] = useState({ name: '', logo: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const isLoading = !error && !brands.length && brands.length === 0; // Simple loading check
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Removed useEffect as useSWR handles fetching

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      if (editingId) setNewBrand({ ...newBrand, logo: '' }); // Clear existing on new selection
    }
  };

  const handleEdit = (brand: any) => {
    setEditingId(brand._id);
    setNewBrand({ name: brand.name, logo: brand.logo });
    setLogoPreview(brand.logo);
    setLogoFile(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewBrand({ name: '', logo: '' });
    setLogoPreview('');
    setLogoFile(null);
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand.name.trim() || (!logoFile && !editingId)) return;

    setIsUploading(true);
    try {
      let logoUrl = newBrand.logo;
      if (logoFile) {
        logoUrl = await uploadToCloudinary(logoFile, "brands");
      }
      
      if (editingId) {
        await api.put(`/brands/${editingId}`, { 
          name: newBrand.name, 
          logo: logoUrl 
        });
        mutate();
        setEditingId(null);
        setMessage({ type: 'success', text: 'Brand updated.' });
      } else {
        await api.post('/brands', { 
          name: newBrand.name, 
          logo: logoUrl 
        });
        mutate();
        setMessage({ type: 'success', text: 'Brand added successfully.' });
      }
      
      setNewBrand({ name: '', logo: '' });
      setLogoFile(null);
      setLogoPreview('');
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;
    try {
      await api.delete(`/brands/${id}`);
      mutate();
      setMessage({ type: 'success', text: 'Brand removed.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Could not delete. Please try again.' });
    }
  };

  if (isLoading) return <div className="text-xs font-bold uppercase tracking-widest animate-pulse">Loading Brands...</div>;

  return (
    <div className="max-w-4xl space-y-12">
      <div className="border-b border-border pb-8">
        <h1 className="text-3xl font-bold text-primary uppercase tracking-tighter">Brands</h1>
        <p className="text-xs font-bold text-accent uppercase tracking-[0.3em] mt-2">Manage Your Brand Partners</p>
      </div>

      {message.text && (
        <div className={`p-4 text-xs font-bold uppercase tracking-widest border-l-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-500' : 'bg-red-50 text-red-700 border-red-500'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white p-10 border border-border">
         <div className="flex justify-between items-center mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary">{editingId ? 'Edit Brand' : 'Add New Brand'}</h2>
            {editingId && (
               <button onClick={handleCancelEdit} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">Cancel Edit</button>
            )}
         </div>
         <form onSubmit={handleAddBrand} className="space-y-6">
            <div className="flex gap-6 items-end">
               <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Brand Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Caterpillar Marine" 
                    className="w-full px-6 py-4 bg-muted/20 border border-border focus:border-accent outline-none text-xs font-bold"
                    value={newBrand.name}
                    onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                    required
                  />
               </div>
               <div className="w-48 space-y-2 text-center">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-4">Logo</label>
                  {logoPreview ? (
                     <div className="relative h-14 border border-border bg-muted flex items-center justify-center p-2">
                        <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain" />
                        <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(''); }} className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full"><X className="w-3 h-3" /></button>
                     </div>
                  ) : (
                     <label className="block h-14 border-2 border-dashed border-border hover:border-accent flex items-center justify-center cursor-pointer transition-colors bg-muted/10">
                        <Upload className="w-4 h-4 text-muted-foreground" />
                        <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                     </label>
                  )}
               </div>
            </div>
            <button type="submit" disabled={isUploading} className="w-full py-4 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors shadow-xl">
               {isUploading ? 'Saving...' : editingId ? 'Save Changes' : 'Add Brand'}
            </button>
         </form>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         {brands.map(brand => (
            <div key={brand._id} className="bg-white p-6 border border-border flex flex-col items-center group relative h-48">
               <div className="flex-1 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <img src={brand.logo} alt={brand.name} className="max-h-16 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-700" />
               </div>
               <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest text-center border-t border-border pt-4 w-full">{brand.name}</h3>
               <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(brand)} className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md text-primary hover:text-accent">
                     <Award className="w-3 h-3" />
                  </button>
                  <button onClick={() => handleDelete(brand._id)} className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md text-red-500 hover:text-red-700">
                     <Trash2 className="w-3 h-3" />
                  </button>
               </div>
            </div>
         ))}
         {brands.length === 0 && (
            <div className="col-span-full py-20 bg-muted/20 border border-dashed border-border text-center text-xs font-bold text-muted-foreground uppercase opacity-50 italic">No brands added yet</div>
         )}
      </div>
    </div>
  );
}
