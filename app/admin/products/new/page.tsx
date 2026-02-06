"use client"

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, X, ChevronLeft, Sparkles, Plus } from 'lucide-react';
import { uploadToCloudinary } from '@/lib/utils/cloudinary';
import { addWatermark } from '@/lib/utils/watermark';
import api from '@/lib/api';
import Link from 'next/link';
import CropModal from '@/components/common/CropModal';
import { Crop } from 'lucide-react';

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

  // Cropping state
  const [cropTarget, setCropTarget] = useState<{ type: 'main' | 'gallery', index?: number, url: string } | null>(null);

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

  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  const [isWatermarkEnabled, setIsWatermarkEnabled] = useState(true);

  const analyzeImage = async (file: File) => {
    if (!isAiEnabled) return;
    
    setIsAiAnalyzing(true);
    setMessage({ type: 'info', text: 'Analyzing image with AI...' });

    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const categoryNames = categories.map(c => c.name);
      formData.append('categories', JSON.stringify(categoryNames));

      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('AI analysis failed');

      const data = await response.json();

      setFormData(prev => ({
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
        price: data.price ? data.price.toString() : prev.price,
      }));

      if (data.categoryName && categories.length > 0) {
        const matchedCategory = categories.find(cat => 
          cat.name.toLowerCase() === data.categoryName.toLowerCase() ||
          cat.name.toLowerCase().includes(data.categoryName.toLowerCase()) ||
          data.categoryName.toLowerCase().includes(cat.name.toLowerCase())
        );
        if (matchedCategory) {
          setFormData(prev => ({ ...prev, category: matchedCategory._id }));
        }
      }

      setMessage({ type: 'success', text: 'AI analysis complete! Fields auto-populated.' });
    } catch (error) {
      console.error('AI Analysis Error:', error);
      setMessage({ type: 'error', text: 'AI analysis failed. Please fill details manually.' });
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setCropTarget({ type: 'main', url: objectUrl });
      // Note: We don't set imageFile/Preview immediately here; we wait for the crop.
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const objectUrl = URL.createObjectURL(file);
      setCropTarget({ type: 'gallery', url: objectUrl });
    });
  };

  const onCropComplete = async (croppedFile: File) => {
    if (!cropTarget) return;

    if (cropTarget.type === 'main') {
      setImageFile(croppedFile);
      setImagePreview(URL.createObjectURL(croppedFile));
      // AI Analysis is now manual only
    } else {
      setImagesFile(prev => [...prev, croppedFile]);
      setImagePreviews(prev => [...prev, URL.createObjectURL(croppedFile)]);
    }
    setCropTarget(null);
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
        let fileToUpload = imageFile;
        if (isWatermarkEnabled) {
             fileToUpload = await addWatermark(imageFile);
        }
        mainImageUrl = await uploadToCloudinary(fileToUpload);
      }

      // Upload secondary images with watermark
      for (const file of imagesFile) {
        let fileToUpload = file;
        if (isWatermarkEnabled) {
            fileToUpload = await addWatermark(file);
        }
        const url = await uploadToCloudinary(fileToUpload);
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
        <div className={`p-4 text-xs font-bold uppercase tracking-widest border-l-4 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border-green-500' : 
          message.type === 'info' ? 'bg-blue-50 text-blue-700 border-blue-500' :
          'bg-red-50 text-red-700 border-red-500'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Top Section: AI Toggle and Image Upload - Full Width */}
        <div className="space-y-12">
           <div className="bg-white p-10 border border-border space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-2">
                <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Main Image</h2>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Watermark</span>
                    <button
                      type="button"
                      onClick={() => setIsWatermarkEnabled(!isWatermarkEnabled)}
                      className={`w-10 h-5 rounded-full p-1 transition-colors ${isWatermarkEnabled ? 'bg-accent' : 'bg-gray-200'}`}
                    >
                      <motion.div
                        animate={{ x: isWatermarkEnabled ? 20 : 0 }}
                        className="w-3 h-3 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">AI Analysis</span>
                    <button
                      type="button"
                      onClick={() => setIsAiEnabled(!isAiEnabled)}
                      className={`w-10 h-5 rounded-full p-1 transition-colors ${isAiEnabled ? 'bg-accent' : 'bg-gray-200'}`}
                    >
                      <motion.div
                        animate={{ x: isAiEnabled ? 20 : 0 }}
                        className="w-3 h-3 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                 {imagePreview ? (
                    <div className="relative border border-border overflow-hidden bg-muted/5 flex items-center justify-center min-h-[300px]">
                       <img src={imagePreview} alt="Preview" className="max-w-full max-h-[600px] w-auto h-auto object-contain" />
                       <div className="absolute top-2 right-2 flex flex-col gap-2">
                          <button 
                            type="button"
                            onClick={() => { setImageFile(null); setImagePreview(''); }} 
                            className="bg-red-600/80 p-2 text-white backdrop-blur-sm"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          {isAiEnabled && (
                            <button
                               type="button"
                               disabled={isAiAnalyzing}
                               onClick={() => imageFile && analyzeImage(imageFile)}
                               className="bg-primary/80 p-2 text-white backdrop-blur-sm disabled:opacity-50"
                             >
                               <Sparkles className="w-4 h-4" />
                             </button>
                           )}
                           <button
                             type="button"
                             onClick={() => imagePreview && setCropTarget({ type: 'main', url: imagePreview })}
                             className="bg-accent/80 p-2 text-white backdrop-blur-sm"
                           >
                             <Crop className="w-4 h-4" />
                           </button>
                       </div>
                       {isAiAnalyzing && (
                         <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-3">
                            <motion.div 
                              animate={{ rotate: 360 }} 
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
                              className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full" 
                            />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Analyzing...</span>
                         </div>
                       )}
                    </div>
                 ) : (
                    <label className="block w-full border-2 border-dashed border-border py-12 text-center cursor-pointer bg-muted/10">
                       <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                       <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Upload Main Product Image</span>
                       <p className="text-[8px] text-muted-foreground mt-2 uppercase tracking-tighter">AI will analyze this to fill details</p>
                       <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                 )}
              </div>
           </div>

           <div className="bg-white p-10 border border-border">
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-border pb-4 mb-6">Gallery Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                 {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative aspect-square border border-border bg-muted/5 flex items-center justify-center overflow-hidden">
                       <img src={src} alt="Sub" className="max-w-full max-h-full w-auto h-auto object-contain" />
                       <button 
                          type="button"
                          onClick={() => {
                             setImagesFile(prev => prev.filter((_, i) => i !== idx));
                             setImagePreviews(prev => prev.filter((_, i) => i !== idx));
                          }} 
                          className="absolute -top-2 -right-2 bg-red-600 p-1 text-white rounded-full hover:bg-red-700 shadow-md"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => setCropTarget({ type: 'gallery', index: idx, url: src })} 
                          className="absolute -bottom-2 -right-2 bg-accent p-1 text-white rounded-full shadow-lg"
                        >
                          <Crop className="w-3 h-3" />
                        </button>
                    </div>
                 ))}
                 <label className="aspect-square border-2 border-dashed border-border flex items-center justify-center cursor-pointer bg-muted/10">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                    <input type="file" accept="image/*" multiple onChange={handleImagesChange} className="hidden" />
                 </label>
              </div>
           </div>
        </div>

        {/* Middle Section: Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8 bg-white p-10 border border-border">
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-border pb-4 mb-6">Information</h2>
            
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Product Name *</label>
                  <input
                    name="title"
                    placeholder="Enter product name"
                    className={`w-full px-4 py-4 bg-muted/20 border outline-none text-xs transition-colors ${isAiAnalyzing ? 'border-accent' : 'border-border focus:border-accent'}`}
                    value={formData.title}
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
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Price (suggested)</label>
                      <input
                        name="price"
                        type="number"
                        placeholder="0.00"
                        className="w-full px-4 py-4 bg-muted/20 border border-border focus:border-accent outline-none text-xs"
                        value={formData.price}
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
                  <label htmlFor="featured" className="text-[10px] font-bold text-primary uppercase tracking-widest cursor-pointer">Mark as Featured Product</label>
               </div>
            </div>
          </div>

          <div className="bg-white p-10 border border-border flex flex-col">
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-border pb-4 mb-6">Description</h2>
            <textarea
              name="description"
              placeholder="Enter comprehensive product description"
              className="w-full px-4 py-4 bg-muted/20 border border-border focus:border-accent outline-none text-xs flex-grow min-h-[200px]"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Bottom Section: Save */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || isUploading || isAiAnalyzing}
            className="w-full lg:w-1/2 py-5 bg-primary text-white font-bold uppercase tracking-[0.3em] text-xs hover:bg-accent transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-70"
          >
            {isLoading || isUploading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Processing...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" /> Add Product to Catalog
              </>
            )}
          </button>
        </div>
      </form>

      {cropTarget && (
        <CropModal
          image={cropTarget.url}
          onCropComplete={onCropComplete}
          onCancel={() => setCropTarget(null)}
        />
      )}
    </div>
  );
}
