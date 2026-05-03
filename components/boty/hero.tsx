"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Anchor, ShieldCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function Hero() {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    // Delay video loading to prioritize LCP and interactive scores
    // 2 seconds is the "sweet spot" for mobile performance audits
    const timer = setTimeout(() => setShowVideo(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden bg-primary">
      {/* Background with video and subtle overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-primary/40 z-10" />
        
        {/* Dynamic Background: Image First, then Video */}
        <AnimatePresence mode="wait">
          {!showVideo ? (
            <motion.img 
              key="hero-image"
              src="/hero-bg.png" 
              alt="Marine Machinery and Automation" 
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            />
          ) : (
            <motion.div 
              key="hero-video-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 w-full h-full"
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                poster="/hero-bg.png"
                className="w-full h-full object-cover"
                aria-hidden="true"
              >
                {/* 1MB WebM for maximum speed */}
                <source src="/hero.webm" type="video/webm" />
                {/* MP4 Fallback */}
                <source src="/hero.mp4" type="video/mp4" />
              </video>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gradients */}
        <div className="absolute inset-y-0 left-0 w-full md:w-1/2 bg-gradient-to-r from-primary/80 md:from-primary/60 to-transparent z-15" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 py-16 sm:py-20 md:pt-20">
        <div className="max-w-4xl">
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 md:mb-8"
           >
              <div className="w-8 sm:w-12 h-px bg-accent" />
              <span className="text-[8px] sm:text-[10px] font-bold text-accent uppercase tracking-[0.3em] sm:tracking-[0.4em]">Marine Spare Parts Supplier</span>
           </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-sans font-extrabold text-white leading-tight uppercase tracking-tighter mb-4 sm:mb-6 md:mb-8"
            >
               Quality <span className="text-accent">Marine Parts</span> <br className="hidden sm:block" />
               Delivered Worldwide
            </motion.h1>

           <motion.p 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4 }}
             className="text-sm sm:text-base md:text-lg text-white/70 mb-6 sm:mb-8 md:mb-10 max-w-xl font-sans leading-relaxed"
           >
              Trusted supplier of marine automation, engine parts & ship machinery. 
              <span className="text-accent font-bold block mt-2">Call: +91 93765 02550</span>
           </motion.p>

           <motion.div 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.6 }}
             className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6"
           >
              <Link
                href="/products"
                className="px-6 sm:px-8 py-4 bg-accent text-white font-bold uppercase tracking-widest text-[10px] sm:text-xs hover:bg-white hover:text-primary transition-all shadow-2xl flex items-center justify-center gap-3"
              >
                View Products <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="px-6 sm:px-8 py-4 border border-white/30 text-white font-bold uppercase tracking-widest text-[10px] sm:text-xs hover:bg-white hover:text-primary transition-all flex items-center justify-center gap-3"
              >
                Get Quote <Anchor className="w-4 h-4" />
              </Link>
           </motion.div>
        </div>
      </div>

      {/* Side Stats/Callouts - Mobile optimized */}
      <div className="absolute bottom-6 sm:bottom-10 md:bottom-16 lg:bottom-20 right-4 sm:right-8 md:right-12 lg:right-20 z-20 space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-12">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-2 sm:gap-4 md:gap-6"
          >
             <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-accent" />
             <div className="text-white">
                <span className="text-base sm:text-xl md:text-2xl font-bold block leading-none">ISO 9001</span>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] tracking-widest uppercase font-bold text-accent">Certified Quality</span>
             </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="flex items-center gap-2 sm:gap-4 md:gap-6"
          >
             <Anchor className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-accent" />
             <div className="text-white">
                <span className="text-base sm:text-xl md:text-2xl font-bold block leading-none">Global</span>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] tracking-widest uppercase font-bold text-accent">Worldwide Export</span>
             </div>
          </motion.div>
      </div>

      {/* Floating element - hidden on mobile */}
      <div className="hidden md:block absolute top-0 right-0 w-1/3 h-full bg-accent/5 skew-x-12 translate-x-1/2 pointer-events-none" />
    </section>
  )
}
