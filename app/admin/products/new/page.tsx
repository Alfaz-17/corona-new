"use client"

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, X, ChevronLeft, Plus } from 'lucide-react';
import { uploadToCloudinary } from '@/lib/utils/cloudinary';
import { addWatermark } from '@/lib/utils/watermark';
import api from '@/lib/api';
import Link from 'next/link';

export default function AdminProductFormPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    featured: false
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imagesFile, setImagesFile] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

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
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagesFile(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      let mainImageUrl = '';
      let secondaryImageUrls: string[] = [];

      setIsUploading(true);
      
      // Upload main image with watermark
      if (imageFile) {
        const watermarked = await addWatermark(imageFile);
        mainImageUrl = await uploadToCloudinary(watermarked);
      }

      // Upload secondary images with watermark
      for (const file of imagesFile) {
        const watermarked = await addWatermark(file);
        const url = await uploadToCloudinary(watermarked);
        secondaryImageUrls.push(url);
      }
      
      setIsUploading(false);

      await api.post("/products", {
        ...formData,
        image: mainImageUrl,
        images: secondaryImageUrls
      });

      setMessage({ type: "success", text: "Product added successfully." });
      // Reset form
      setFormData({ title: '', description: '', price: '', category: '', featured: false });
      setImageFile(null);
      setImagePreview('');
      setImagesFile([]);
      setImagePreviews([]);
      
    } catch (error: any) {
      console.error("Error creating product:", error);
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to add product. Please try again." });
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="flex items-center justify-between border-b border-border pb-8">
         <Link href="/admin/products" className="inline-flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-accent uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" /> Back to Products
         </Link>
         <h1 className="text-3xl font-bold text-primary uppercase tracking-tighter">Add New Product</h1>
      </div>

      {message.text && (
        <div className={`p-4 text-xs font-bold uppercase tracking-widest border-l-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-500' : 'bg-red-50 text-red-700 border-red-500'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Details */}
        <div className="space-y-8 bg-white p-10 border border-border">
          <h2 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-border pb-4 mb-6">Product Details</h2>
          
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Product Name *</label>
                <input
                  name="title"
                  placeholder="Enter product name"
                  className="w-full px-4 py-4 bg-muted/20 border border-border focus:border-accent outline-none text-xs"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Description *</label>
                <textarea
                  name="description"
                  placeholder="Enter product description"
                  className="w-full px-4 py-4 bg-muted/20 border border-border focus:border-accent outline-none text-xs h-32"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Category *</label>
                  <select
                    name="category"
                    className="w-full px-4 py-4 bg-muted/20 border border-border focus:border-accent outline-none text-xs font-bold tracking-widest uppercase"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
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
                <label htmlFor="featured" className="text-[10px] font-bold text-primary uppercase tracking-widest cursor-pointer">Mark as Featured</label>
             </div>
          </div>
        </div>

        {/* Right Column: Visuals */}
        <div className="space-y-8">
           <div className="bg-white p-10 border border-border">
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-border pb-4 mb-6">Main Image</h2>
              <div className="space-y-6">
                 {imagePreview ? (
                    <div className="relative aspect-video border border-border overflow-hidden">
                       <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                       <button onClick={() => { setImageFile(null); setImagePreview(''); }} className="absolute top-2 right-2 bg-red-600 p-2 text-white"><X className="w-4 h-4" /></button>
                    </div>
                 ) : (
                    <label className="block w-full border-2 border-dashed border-border py-12 text-center hover:border-accent transition-colors cursor-pointer bg-muted/10">
                       <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                       <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Upload Image</span>
                       <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                 )}
              </div>
           </div>

           <div className="bg-white p-10 border border-border">
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-border pb-4 mb-6">Additional Images (Gallery)</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                 {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative aspect-square border border-border">
                       <img src={src} alt="Sub" className="w-full h-full object-cover" />
                       <button onClick={() => {
                          setImagesFile(prev => prev.filter((_, i) => i !== idx));
                          setImagePreviews(prev => prev.filter((_, i) => i !== idx));
                       }} className="absolute -top-2 -right-2 bg-red-600 p-1 text-white rounded-full"><X className="w-3 h-3" /></button>
                    </div>
                 ))}
                 <label className="aspect-square border-2 border-dashed border-border flex items-center justify-center hover:border-accent transition-colors cursor-pointer bg-muted/10">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                    <input type="file" accept="image/*" multiple onChange={handleImagesChange} className="hidden" />
                 </label>
              </div>
           </div>

           <button
              type="submit"
              disabled={isLoading || isUploading}
              className="w-full py-5 bg-primary text-white font-bold uppercase tracking-[0.3em] text-xs hover:bg-accent transition-all shadow-2xl flex items-center justify-center gap-4"
           >
              {isLoading || isUploading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  Processing...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Add Product
                </>
              )}
           </button>
        </div>
      </form>
    </div>
  );
}
