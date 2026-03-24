"use client"

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, X, ChevronLeft, Loader2, Sparkles, ShieldCheck, Crop, Eraser } from 'lucide-react';
import { uploadToCloudinary } from '@/lib/utils/cloudinary';
import { addWatermark } from '@/lib/utils/watermark';
import { removeBackgroundClient } from '@/lib/background-removal-client';
import api from '@/lib/api';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { MarineLoader } from '@/components/common/marine-loader';
import CropModal from '@/components/common/CropModal';

export default function AdminProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
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
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  
  // Global Settings state
  const [globalSettings, setGlobalSettings] = useState({
    autoBackgroundRemoval: false,
    applyWatermark: true,
    watermarkText: 'Corona Marine'
  });

  // Background removal state
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgProcessingIndex, setBgProcessingIndex] = useState<{type: 'main' | 'gallery-existing' | 'gallery-new', index?: number} | null>(null);
  const [bgStatus, setBgStatus] = useState('');

  // Cropping state
  const [cropTarget, setCropTarget] = useState<{ type: 'main' | 'gallery-existing' | 'gallery-new', index?: number, url: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, settingsRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get('/categories'),
          fetch('/api/settings').then(r => r.ok ? r.json() : null)
        ]);
        
        const prod = prodRes.data;
        setFormData({
          title: prod.title || '',
          description: prod.description || '',
          category: prod.category?._id || prod.category || '',
          featured: prod.featured || false
        });
        setExistingImage(prod.image || '');
        setExistingImages(prod.images || []);
        setCategories(catRes.data);
        if (settingsRes) {
          setGlobalSettings(settingsRes);
        }
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setCropTarget({ type: 'main', url: objectUrl });
      
      // Auto-analyze if global settings allow it or just offer the option
      // For edit page, we manually trigger to avoid overwriting existing data unexpectedly
    }
  };

  const analyzeImage = async (file: File) => {
    setIsAiAnalyzing(true);
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

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const objectUrl = URL.createObjectURL(file);
      setCropTarget({ type: 'gallery-new', url: objectUrl });
    });
  };

  const onCropComplete = async (croppedFile: File) => {
    if (!cropTarget) return;

    const targetType = cropTarget.type;
    const targetIndex = cropTarget.index;

    if (targetType === 'main') {
      setImageFile(croppedFile);
      setImagePreview(URL.createObjectURL(croppedFile));
      setExistingImage('');
    } else if (targetType === 'gallery-existing' && targetIndex !== undefined) {
      setExistingImages(prev => prev.filter((_, i) => i !== targetIndex));
      setImagesFile(prev => [...prev, croppedFile]);
      setImagePreviews(prev => [...prev, URL.createObjectURL(croppedFile)]);
    } else {
      setImagesFile(prev => [...prev, croppedFile]);
      setImagePreviews(prev => [...prev, URL.createObjectURL(croppedFile)]);
    }
    setCropTarget(null);
  };

  const handleRemoveExistingSecondary = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveBackground = async (type: 'main' | 'gallery-existing' | 'gallery-new' = 'main', index?: number, fileOverride?: File | Blob) => {
    let sourceImage: File | Blob | null = null;
    
    if (type === 'main') {
      if (fileOverride) {
        sourceImage = fileOverride;
      } else if (imageFile) {
        sourceImage = imageFile;
      } else if (existingImage) {
        try {
          setBgStatus('Fetching...');
          const response = await fetch(existingImage);
          sourceImage = await response.blob();
        } catch (error) {
          console.error("Error fetching main image:", error);
          setMessage({ type: 'error', text: 'Could not fetch image for processing.' });
          return;
        }
      }
    } else if (type === 'gallery-existing' && index !== undefined) {
      try {
        setBgStatus('Fetching...');
        const response = await fetch(existingImages[index]);
        sourceImage = await response.blob();
      } catch (error) {
        console.error("Error fetching existing gallery image:", error);
        setMessage({ type: 'error', text: 'Could not fetch image.' });
        return;
      }
    } else if (type === 'gallery-new' && index !== undefined) {
      sourceImage = fileOverride || imagesFile[index];
    }

    if (!sourceImage) return;
    
    setIsRemovingBg(true);
    setBgProcessingIndex({ type, index });
    setBgStatus('Initializing AI...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setBgStatus('Removing background...');
      
      const processedBlob = await removeBackgroundClient(sourceImage);
      const processedFile = new File([processedBlob], `processed-${type}.png`, { type: 'image/png' });
      
      if (type === 'main') {
        setImageFile(processedFile);
        setImagePreview(URL.createObjectURL(processedFile));
        setExistingImage('');
      } else if (type === 'gallery-existing' && index !== undefined) {
        // Move from existing to new files
        setExistingImages(prev => prev.filter((_, i) => i !== index));
        setImagesFile(prev => [...prev, processedFile]);
        setImagePreviews(prev => [...prev, URL.createObjectURL(processedFile)]);
      } else if (type === 'gallery-new' && index !== undefined) {
        setImagesFile(prev => {
          const newFiles = [...prev];
          newFiles[index] = processedFile;
          return newFiles;
        });
        
        setImagePreviews(prev => {
          const newPreviews = [...prev];
          newPreviews[index] = URL.createObjectURL(processedFile);
          return newPreviews;
        });
      }
      
      setBgStatus('Complete!');
      setTimeout(() => {
        setBgStatus('');
        setBgProcessingIndex(null);
      }, 2000);
    } catch (error: any) {
      console.error("Background removal error:", error);
      if (error.message === 'MOBILE_MEMORY_ERROR') {
        setMessage({ type: 'error', text: 'Image too large for your device memory.' });
      } else {
        setMessage({ type: 'error', text: 'Background removal failed.' });
      }
      setBgProcessingIndex(null);
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      let mainImageUrl = existingImage;
      let secondaryImageUrls: string[] = [...existingImages];

      setIsUploading(true);
      
      // Upload new main image if selected (with watermark if enabled globally)
      if (imageFile) {
        const processedImage = globalSettings.applyWatermark 
          ? await addWatermark(imageFile, globalSettings.watermarkText) 
          : imageFile;
        mainImageUrl = await uploadToCloudinary(processedImage);
      }

      // Upload new secondary images (with watermark if enabled globally)
      for (const file of imagesFile) {
        const processedImage = globalSettings.applyWatermark 
          ? await addWatermark(file, globalSettings.watermarkText) 
          : file;
        const url = await uploadToCloudinary(processedImage);
        secondaryImageUrls.push(url);
      }
      
      setIsUploading(false);

      setIsUploading(false);

      const payload = {
        ...formData,
        category: formData.category || undefined,
        image: mainImageUrl,
        images: secondaryImageUrls
      };

      await api.put(`/products/${id}`, payload);

      setMessage({ type: "success", text: "Product updated successfully." });
      setTimeout(() => router.push('/admin/products'), 2000);
      
    } catch (error: any) {
      console.error("Error updating product:", error);
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to update product. Please try again." });
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
            <ChevronLeft className="w-4 h-4" /> Back to Products
         </Link>
         <h1 className="text-3xl font-bold text-primary uppercase tracking-tighter">Edit Product</h1>
      </div>

      {message.text && (
        <div className={`p-4 text-xs font-bold uppercase tracking-widest border-l-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-500' : 'bg-red-50 text-red-700 border-red-500'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8 bg-white p-10 border border-border">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Product Details</h2>
            {imageFile && (
              <button
                type="button"
                onClick={() => analyzeImage(imageFile)}
                disabled={isAiAnalyzing}
                className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-all rounded-sm disabled:opacity-50"
              >
                {isAiAnalyzing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest">AI Analyze</span>
              </button>
            )}
          </div>
          
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Product Name *</label>
                <input
                  name="title"
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

        <div className="space-y-8">
           <div className="bg-white p-10 border border-border">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Main Image</h2>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-muted/5 border border-border text-[9px] font-bold uppercase tracking-tight text-muted-foreground">
                    <ShieldCheck className="w-3 h-3" />
                    WM: {globalSettings.applyWatermark ? 'AUTO' : 'OFF'}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-muted/5 border border-border text-[9px] font-bold uppercase tracking-tight text-muted-foreground">
                    <Eraser className="w-3 h-3" />
                    BG: MANUAL
                  </div>
                  <Link href="/admin/settings" className="text-[9px] font-bold text-accent hover:underline uppercase tracking-tight">
                    Manage
                  </Link>
                </div>
              </div>
              <div className="space-y-6">
                 {(imagePreview || existingImage) ? (
                    <div className="relative aspect-video border border-border overflow-hidden bg-muted/5 flex items-center justify-center group">
                       <img src={imagePreview || existingImage} alt="Preview" className="w-full h-full object-cover" />
                       
                       {/* Main Image Actions - Clean Grouped Placement */}
                       <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
                          <button 
                            type="button" 
                            onClick={() => { setImageFile(null); setImagePreview(''); setExistingImage(''); }} 
                            className="bg-red-600 p-2 text-white rounded-full shadow-xl hover:bg-red-700 transition-all active:scale-95"
                            title="Remove Image"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          
                          <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-border shadow-2xl flex flex-col gap-2">
                             <button
                               type="button"
                               onClick={() => {
                                 const url = imagePreview || existingImage;
                                 if (url) setCropTarget({ type: 'main', url });
                               }}
                               className="bg-accent p-2 text-white rounded-xl hover:bg-accent/90 transition-colors active:scale-95"
                               title="Crop Image"
                             >
                               <Crop className="w-4 h-4" />
                             </button>
                             <button
                               type="button"
                               disabled={isRemovingBg}
                               onClick={() => handleRemoveBackground('main')}
                               className="bg-indigo-600 p-2 text-white rounded-xl disabled:opacity-50 hover:bg-indigo-700 transition-colors active:scale-95"
                               title="Remove Background"
                             >
                               <Eraser className="w-4 h-4" />
                             </button>
                          </div>
                       </div>

                       {isRemovingBg && bgProcessingIndex?.type === 'main' && (
                         <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center flex-col gap-3 z-20">
                           <div className="flex items-center gap-2 px-6 py-3 bg-white border border-border shadow-2xl rounded-sm">
                             <Loader2 className="w-4 h-4 animate-spin text-accent" />
                             <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{bgStatus}</span>
                           </div>
                         </div>
                       )}
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
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                   {existingImages.map((src, idx) => (
                     <div key={`exist-${idx}`} className="relative aspect-square border border-border overflow-hidden group bg-muted/5 flex items-center justify-center ">
                        <img src={src} alt="Existing" className="max-w-full max-h-full w-auto h-auto object-contain" />
                        
                        {/* Gallery Item Actions - Always Visible & Properly Placed */}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveExistingSecondary(idx)} 
                          className="absolute top-2 right-2 bg-red-600 p-1.5 text-white rounded-full transition-all hover:bg-red-700 active:scale-95 shadow-md z-10"
                          title="Remove Image"
                        >
                          <X className="w-3 h-3" />
                        </button>

                        <div className="absolute bottom-2 right-2 flex gap-1.5 z-10">
                           <button
                             type="button"
                             onClick={() => setCropTarget({ type: 'gallery-existing', index: idx, url: src })}
                             className="bg-accent p-1.5 text-white rounded-full shadow-lg transition-transform active:scale-95 hover:bg-accent/90"
                             title="Crop Image"
                           >
                             <Crop className="w-3 h-3" />
                           </button>
                           <button 
                             type="button"
                             disabled={isRemovingBg}
                             onClick={() => handleRemoveBackground('gallery-existing', idx)} 
                             className="bg-indigo-600 p-1.5 text-white rounded-full shadow-lg disabled:opacity-50 transition-transform active:scale-95 hover:bg-indigo-700"
                             title="Remove Background"
                           >
                             <Eraser className="w-3 h-3" />
                           </button>
                        </div>

                        {isRemovingBg && bgProcessingIndex?.type === 'gallery-existing' && bgProcessingIndex?.index === idx && (
                           <div className="absolute inset-0 bg-primary/10 backdrop-blur-[1px] flex items-center justify-center z-20">
                              <div className="p-1 bg-white border border-border shadow-lg rounded-sm">
                                <Loader2 className="w-3 h-3 animate-spin text-accent" />
                              </div>
                           </div>
                        )}
                     </div>
                  ))}
                  {imagePreviews.map((src, idx) => (
                     <div key={`new-${idx}`} className="relative aspect-square border border-accent border-dashed overflow-hidden group bg-muted/5 flex items-center justify-center">
                        <img src={src} alt="New" className="max-w-full max-h-full w-auto h-auto object-contain" />
                        
                        <button 
                           type="button" 
                           onClick={() => {
                              setImagesFile(prev => prev.filter((_, i) => i !== idx));
                              setImagePreviews(prev => prev.filter((_, i) => i !== idx));
                           }} 
                           className="absolute top-2 right-2 bg-red-600 p-1.5 text-white rounded-full transition-all hover:bg-red-700 active:scale-95 shadow-md z-10"
                           title="Remove Image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        
                        <div className="absolute bottom-2 right-2 flex gap-1.5 z-10">
                           <button
                             type="button"
                             onClick={() => setCropTarget({ type: 'gallery-new', index: idx, url: src })}
                             className="bg-accent p-1.5 text-white rounded-full shadow-lg transition-transform active:scale-95 hover:bg-accent/90"
                             title="Crop Image"
                           >
                             <Crop className="w-3 h-3" />
                           </button>
                           <button 
                             type="button"
                             disabled={isRemovingBg}
                             onClick={() => handleRemoveBackground('gallery-new', idx)} 
                             className="bg-indigo-600 p-1.5 text-white rounded-full shadow-lg disabled:opacity-50 transition-transform active:scale-95 hover:bg-indigo-700"
                             title="Remove Background"
                           >
                             <Eraser className="w-3 h-3" />
                           </button>
                        </div>

                        {isRemovingBg && bgProcessingIndex?.type === 'gallery-new' && bgProcessingIndex?.index === idx && (
                           <div className="absolute inset-0 bg-primary/10 backdrop-blur-[1px] flex items-center justify-center z-20">
                              <div className="p-1 bg-white border border-border shadow-lg rounded-sm">
                                <Loader2 className="w-3 h-3 animate-spin text-accent" />
                              </div>
                           </div>
                        )}
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
                  <Save className="w-5 h-5" /> Save Changes
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
