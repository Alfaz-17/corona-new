"use client"

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, X, ChevronLeft } from 'lucide-react';
import { uploadToCloudinary } from '@/lib/utils/cloudinary';
import { addWatermark } from '@/lib/utils/watermark';
import api from '@/lib/api';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { MarineLoader } from '@/components/common/marine-loader';

export default function AdminProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    featured: false
  });
  
  const [existingImage, setExistingImage] = useState('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imagesFile, setImagesFile] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get('/categories')
        ]);
        
        const prod = prodRes.data;
        setFormData({
          title: prod.title || '',
          description: prod.description || '',
          price: prod.price || '',
          category: prod.category?._id || prod.category || '',
          brand: prod.brand || '',
          featured: prod.featured || false
        });
        setExistingImage(prod.image || '');
        setExistingImages(prod.images || []);
        setCategories(catRes.data);
      } catch (error) {
        console.error('Error fetching edit data:', error);
        setMessage({ type: 'error', text: 'Failed to load asset data.' });
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setExistingImage(''); // New image replaces existing
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagesFile(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveExistingSecondary = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      let mainImageUrl = existingImage;
      let secondaryImageUrls: string[] = [...existingImages];

      setIsUploading(true);
      
      // Upload new main image if selected
      if (imageFile) {
        const watermarked = await addWatermark(imageFile);
        mainImageUrl = await uploadToCloudinary(watermarked);
      }

      // Upload new secondary images
      for (const file of imagesFile) {
        const watermarked = await addWatermark(file);
        const url = await uploadToCloudinary(watermarked);
        secondaryImageUrls.push(url);
      }
      
      setIsUploading(false);

      await api.put(`/products/${id}`, {
        ...formData,
        image: mainImageUrl,
        images: secondaryImageUrls
      });

      setMessage({ type: "success", text: "Asset specifications updated successfully." });
      setTimeout(() => router.push('/admin/products'), 2000);
      
    } catch (error: any) {
      console.error("Error updating product:", error);
      setMessage({ type: "error", text: error.response?.data?.message || "Transmission failure during update." });
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  if (isLoading) return <MarineLoader />;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="flex items-center justify-between border-b border-border pb-8">
         <Link href="/admin/products" className="inline-flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-accent uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" /> Back to Fleet
         </Link>
         <h1 className="text-3xl font-bold text-primary uppercase tracking-tighter">Edit Fleet Asset</h1>
      </div>

      {message.text && (
        <div className={`p-4 text-xs font-bold uppercase tracking-widest border-l-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-500' : 'bg-red-50 text-red-700 border-red-500'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8 bg-white p-10 border border-border">
          <h2 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-border pb-4 mb-6">Technical Specifications</h2>
          
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Asset Designation *</label>
                <input
                  name="title"
                  className="w-full px-4 py-4 bg-muted/20 border border-border focus:border-accent outline-none text-xs"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Detailed Analysis *</label>
                <textarea
                  name="description"
                  className="w-full px-4 py-4 bg-muted/20 border border-border focus:border-accent outline-none text-xs h-32"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-widest">System Sector *</label>
                  <select
                    name="category"
                    className="w-full px-4 py-4 bg-muted/20 border border-border focus:border-accent outline-none text-xs font-bold tracking-widest uppercase"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Sector</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Manufacturer Brand</label>
                  <input
                    name="brand"
                    className="w-full px-4 py-4 bg-muted/20 border border-border focus:border-accent outline-none text-xs"
                    value={formData.brand}
                    onChange={handleChange}
                  />
                </div>
             </div>

             <div className="flex items-center gap-4 pt-4">
                <input
                  type="checkbox"
                  name="featured"
                  id="featured"
                  className="w-4 h-4 border-primary accent-accent"
                  checked={formData.featured}
                  onChange={handleChange}
                />
                <label htmlFor="featured" className="text-[10px] font-bold text-primary uppercase tracking-widest cursor-pointer">Mark as Strategic Asset (Featured)</label>
             </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white p-10 border border-border">
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-border pb-4 mb-6">Primary Identification</h2>
              <div className="space-y-6">
                 {(imagePreview || existingImage) ? (
                    <div className="relative aspect-video border border-border overflow-hidden">
                       <img src={imagePreview || existingImage} alt="Preview" className="w-full h-full object-cover" />
                       <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); setExistingImage(''); }} className="absolute top-2 right-2 bg-red-600 p-2 text-white"><X className="w-4 h-4" /></button>
                    </div>
                 ) : (
                    <label className="block w-full border-2 border-dashed border-border py-12 text-center hover:border-accent transition-colors cursor-pointer bg-muted/10">
                       <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                       <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Replace Imaging Unit</span>
                       <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                 )}
              </div>
           </div>

           <div className="bg-white p-10 border border-border">
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-border pb-4 mb-6">Supporting Telemetry (Gallery)</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                 {existingImages.map((src, idx) => (
                    <div key={`exist-${idx}`} className="relative aspect-square border border-border">
                       <img src={src} alt="Existing" className="w-full h-full object-cover" />
                       <button type="button" onClick={() => handleRemoveExistingSecondary(idx)} className="absolute -top-2 -right-2 bg-red-600 p-1 text-white rounded-full"><X className="w-3 h-3" /></button>
                    </div>
                 ))}
                 {imagePreviews.map((src, idx) => (
                    <div key={`new-${idx}`} className="relative aspect-square border border-accent border-dashed">
                       <img src={src} alt="New" className="w-full h-full object-cover" />
                       <button type="button" onClick={() => {
                          setImagesFile(prev => prev.filter((_, i) => i !== idx));
                          setImagePreviews(prev => prev.filter((_, i) => i !== idx));
                       }} className="absolute -top-2 -right-2 bg-red-600 p-1 text-white rounded-full"><X className="w-3 h-3" /></button>
                    </div>
                 ))}
                 <label className="aspect-square border-2 border-dashed border-border flex items-center justify-center hover:border-accent transition-colors cursor-pointer bg-muted/10">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <input type="file" accept="image/*" multiple onChange={handleImagesChange} className="hidden" />
                 </label>
              </div>
           </div>

           <button
              type="submit"
              disabled={isSaving || isUploading}
              className="w-full py-5 bg-primary text-white font-bold uppercase tracking-[0.3em] text-xs hover:bg-accent transition-all shadow-2xl flex items-center justify-center gap-4"
           >
              {isSaving || isUploading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Commit Changes
                </>
              )}
           </button>
        </div>
      </form>
    </div>
  );
}
