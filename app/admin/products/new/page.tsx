"use client"

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Upload, 
  X, 
  ChevronLeft, 
  Sparkles, 
  Plus, 
  Loader2, 
  Crop,
  Eraser
} from 'lucide-react';
import { uploadToCloudinary } from '@/lib/utils/cloudinary';
import { addWatermark } from '@/lib/utils/watermark';
import { removeBackgroundClient } from '@/lib/background-removal-client';
import api from '@/lib/api';
import Link from 'next/link';
import CropModal from '@/components/common/CropModal';

export default function AdminProductFormPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
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
  const [globalSettings, setGlobalSettings] = useState({
    autoBackgroundRemoval: false,
    applyWatermark: true,
    watermarkText: 'Corona Marine'
  });

  // Cropping state
  const [cropTarget, setCropTarget] = useState<{ type: 'main' | 'gallery', index?: number, url: string } | null>(null);

  // Background removal state
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgProcessingIndex, setBgProcessingIndex] = useState<{type: 'main' | 'gallery', index?: number} | null>(null);
  const [bgStatus, setBgStatus] = useState('');

  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [isWatermarkEnabled, setIsWatermarkEnabled] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setGlobalSettings(data);
          setIsWatermarkEnabled(data.applyWatermark);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchCategories();
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };


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

    const targetType = cropTarget.type;
    const targetIndex = cropTarget.index;

    if (targetType === 'main') {
      setImageFile(croppedFile);
      setImagePreview(URL.createObjectURL(croppedFile));
    } else {
      setImagesFile(prev => [...prev, croppedFile]);
      setImagePreviews(prev => [...prev, URL.createObjectURL(croppedFile)]);
    }
    setCropTarget(null);
  };

  const handleRemoveBackground = async (type: 'main' | 'gallery' = 'main', index?: number, fileOverride?: File) => {
    let sourceFile = fileOverride || (type === 'main' ? imageFile : (index !== undefined ? imagesFile[index] : null));
    if (!sourceFile) return;
    
    setIsRemovingBg(true);
    setBgProcessingIndex({ type, index });
    setBgStatus('Initializing AI...');
    
    try {
      // Small delay to let UI update
      await new Promise(resolve => setTimeout(resolve, 300));
      setBgStatus('Removing background...');
      
      const processedBlob = await removeBackgroundClient(sourceFile);
      const processedFile = new File([processedBlob], `processed-${type}${index !== undefined ? `-${index}` : ''}.png`, { type: 'image/png' });
      
      if (type === 'main') {
        setImageFile(processedFile);
        setImagePreview(URL.createObjectURL(processedFile));
      } else if (index !== undefined) {
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
             fileToUpload = await addWatermark(imageFile, globalSettings.watermarkText);
        }
        mainImageUrl = await uploadToCloudinary(fileToUpload);
      }

      // Upload secondary images with watermark
      for (const file of imagesFile) {
        let fileToUpload = file;
        if (isWatermarkEnabled) {
            fileToUpload = await addWatermark(file, globalSettings.watermarkText);
        }
        const url = await uploadToCloudinary(fileToUpload);
        secondaryImageUrls.push(url);
      }
      
      setIsUploading(false);
      
      const payload = {
        ...formData,
        category: formData.category || undefined,
        image: mainImageUrl,
        images: secondaryImageUrls
      };

      console.log('Sending product payload:', JSON.stringify(payload, null, 2));
      const response = await api.post("/products", payload);
      console.log('Product creation response:', response.data);

      setMessage({ type: "success", text: "Product added successfully." });
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        featured: false
      });
      setImageFile(null);
      setImagePreview('');
      setImagesFile([]);
      setImagePreviews([]);
      
      setTimeout(() => window.location.href = '/admin/products', 2000);
    } catch (error: any) {
      console.error("Error creating product details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorDetail = error.response?.data?.error || error.message;
      const errorStack = error.response?.data?.detail ? JSON.stringify(error.response.data.detail) : '';
      setMessage({ type: "error", text: `Creation failed: ${errorDetail}. ${errorStack}` });
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
                    <div className="relative border border-border overflow-hidden bg-muted/5 flex items-center justify-center min-h-[300px] group">
                       <img src={imagePreview} alt="Preview" className="max-w-full max-h-[600px] w-auto h-auto object-contain" />
                       
                       {/* Main Image Actions - Clean Grouped Placement */}
                       <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
                          <button 
                            type="button"
                            onClick={() => { setImageFile(null); setImagePreview(''); }} 
                            className="bg-red-600 p-2 text-white rounded-full shadow-xl hover:bg-red-700 transition-all active:scale-95"
                            title="Remove Image"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          
                          <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-border shadow-2xl flex flex-col gap-2">
                            {isAiEnabled && (
                              <button
                                 type="button"
                                 disabled={isAiAnalyzing}
                                 onClick={() => imageFile && analyzeImage(imageFile)}
                                 className="bg-primary p-2 text-white rounded-xl disabled:opacity-50 hover:bg-black transition-colors active:scale-95"
                                 title="AI Analysis"
                               >
                                 <Sparkles className="w-4 h-4" />
                               </button>
                             )}
                             <button
                               type="button"
                               onClick={() => imagePreview && setCropTarget({ type: 'main', url: imagePreview })}
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
                    <label className="block w-full border-2 border-dashed border-border py-12 text-center cursor-pointer bg-muted/10 hover:border-accent transition-colors">
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
                    <div key={idx} className="relative aspect-square border border-border bg-muted/5 flex items-center justify-center overflow-hidden group">
                       <img src={src} alt="Sub" className="max-w-full max-h-full w-auto h-auto object-contain" />
                       
                       {/* Gallery Item Actions - Always Visible & Properly Placed */}
                       <button 
                          type="button"
                          onClick={() => {
                             setImagesFile(prev => prev.filter((_, i) => i !== idx));
                             setImagePreviews(prev => prev.filter((_, i) => i !== idx));
                          }} 
                          className="absolute top-2 right-2 bg-red-600 p-1.5 text-white rounded-full hover:bg-red-700 shadow-md transition-transform active:scale-95 z-10"
                          title="Remove Image"
                        >
                          <X className="w-3 h-3" />
                        </button>

                        <div className="absolute bottom-2 right-2 flex gap-1.5 z-10">
                           <button 
                             type="button"
                             onClick={() => setCropTarget({ type: 'gallery', index: idx, url: src })} 
                             className="bg-accent p-1.5 text-white rounded-full shadow-lg transition-transform active:scale-95 hover:bg-accent/90"
                             title="Crop Image"
                           >
                             <Crop className="w-3 h-3" />
                           </button>
                           <button 
                             type="button"
                             disabled={isRemovingBg}
                             onClick={() => handleRemoveBackground('gallery', idx)} 
                             className="bg-indigo-600 p-1.5 text-white rounded-full shadow-lg disabled:opacity-50 transition-transform active:scale-95 hover:bg-indigo-700"
                             title="Remove Background"
                           >
                             <Eraser className="w-3 h-3" />
                           </button>
                        </div>

                        {isRemovingBg && bgProcessingIndex?.type === 'gallery' && bgProcessingIndex?.index === idx && (
                           <div className="absolute inset-0 bg-primary/10 backdrop-blur-[1px] flex items-center justify-center z-20">
                             <div className="p-1 bg-white border border-border shadow-lg rounded-sm">
                               <Loader2 className="w-3 h-3 animate-spin text-accent" />
                             </div>
                           </div>
                        )}
                    </div>
                 ))}
                 <label className="aspect-square border-2 border-dashed border-border flex items-center justify-center cursor-pointer bg-muted/10 hover:border-accent transition-colors">
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
