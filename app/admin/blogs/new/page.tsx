"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, X, ChevronLeft, FileText } from 'lucide-react';
import { uploadToCloudinary } from '@/lib/utils/cloudinary';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminBlogFormPage() {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      let imageUrl = '';
      if (imageFile) {
        setIsUploading(true);
        imageUrl = await uploadToCloudinary(imageFile, "blogs");
        setIsUploading(false);
      }

      await api.post("/blogs", {
        ...formData,
        image: imageUrl,
        date: new Date().toISOString()
      });

      setMessage({ type: "success", text: "Blog post published successfully." });
      setTimeout(() => router.push('/admin/blogs'), 2000);
    } catch (error: any) {
      console.error("Error creating blog:", error);
      setMessage({ type: "error", text: "Could not publish. Please try again." });
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="flex items-center justify-between border-b border-border pb-8">
         <Link href="/admin/blogs" className="inline-flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-accent uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" /> Back to Blog Posts
         </Link>
         <h1 className="text-3xl font-bold text-primary uppercase tracking-tighter">Write New Post</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8 bg-white p-10 border border-border">
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Article Title *</label>
                     <input
                        name="title"
                        placeholder="Enter your blog post title..."
                        className="w-full px-4 py-4 bg-muted/20 border border-border focus:border-accent outline-none text-sm font-bold"
                        value={formData.title}
                        onChange={handleChange}
                        required
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Short Summary *</label>
                     <textarea
                        name="excerpt"
                        placeholder="Write a short summary of your post..."
                        className="w-full px-4 py-4 bg-muted/20 border border-border focus:border-accent outline-none text-xs h-24 italic"
                        value={formData.excerpt}
                        onChange={handleChange}
                        required
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Full Content *</label>
                     <textarea
                        name="content"
                        placeholder="Write your full blog post here..."
                        className="w-full px-4 py-4 bg-muted/20 border border-border focus:border-accent outline-none text-xs h-64"
                        value={formData.content}
                        onChange={handleChange}
                        required
                     />
                  </div>
               </div>
            </div>

            <div className="space-y-8">
               <div className="bg-white p-10 border border-border">
                  <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest border-b border-border pb-4 mb-6 text-center">Cover Image</h3>
                  {imagePreview ? (
                     <div className="relative aspect-video bg-muted border border-border overflow-hidden">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button onClick={() => { setImageFile(null); setImagePreview(''); }} className="absolute top-2 right-2 bg-red-600 text-white p-2">
                           <X className="w-4 h-4" />
                        </button>
                     </div>
                  ) : (
                     <label className="block w-full border-2 border-dashed border-border py-12 text-center hover:border-accent transition-colors cursor-pointer bg-muted/10">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Upload Image</span>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                     </label>
                  )}
               </div>

               <button
                  type="submit"
                  disabled={isLoading || isUploading}
                  className="w-full py-5 bg-primary text-white font-bold uppercase tracking-[0.3em] text-xs hover:bg-accent transition-all shadow-2xl flex items-center justify-center gap-4"
               >
                  <Save className="w-5 h-5" /> Publish Post
               </button>
            </div>
         </div>
      </form>
    </div>
  );
}
