"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Package, Cpu, Gauge, ShieldCheck, Wrench, Zap, Globe } from "lucide-react"

export function SEOIntro() {
  const services = [
    { title: "Marine spare parts supply", icon: Package },
    { title: "Marine automation & control systems", icon: Cpu },
    { title: "Sensors & marine electronics", icon: Zap },
    { title: "Engine room machinery spares", icon: Gauge },
    { title: "Pumps, purifiers & marine equipment", icon: Wrench },
    { title: "Hydraulic & pneumatic components", icon: Gauge },
    { title: "Deck machinery & safety equipment", icon: ShieldCheck },
    { title: "Urgent marine spare part sourcing", icon: Globe },
  ]

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 sm:gap-14 lg:gap-20 items-start">
          {/* Left Content - Introduction */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <span className="text-accent tracking-[0.3em] sm:tracking-[0.4em] uppercase text-[9px] sm:text-[10px] font-bold mb-3 sm:mb-4 block">Official Briefing</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-serif font-bold text-primary leading-tight tracking-tighter uppercase mb-4 sm:mb-6">
                Corona Marine Parts – <br className="hidden sm:block"/>
                <span className="text-accent italic">Reliable</span> Marine Solutions
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed italic">
                Corona Marine Parts is a reliable supplier of high-quality marine spare parts, marine automation systems, and ship machinery components. We support ship owners, managers, and marine engineers with accurate sourcing, timely delivery, and dependable marine solutions for vessels worldwide.
              </p>
            </div>

            <div className="p-5 sm:p-6 md:p-8 bg-muted/20 border-l-4 border-accent">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary mb-2">Our Vision</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Founded in 2023, Corona Marine Parts focuses on providing genuine and cost-effective marine equipment for engine rooms, deck machinery, automation systems, and safety equipment. Our goal is to simplify marine spare part sourcing while maintaining quality, accuracy, and fast response times.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Experienced marine sourcing professionals",
                "Fast and reliable delivery",
                "Quality-checked marine components",
                "Global supply support",
                "Customer-focused marine solutions"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary/80">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Content - Services Grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-primary p-6 sm:p-8 md:p-10 lg:p-16 border border-white/10 relative">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 -translate-y-1/2 translate-x-1/2 rounded-full blur-3xl" />
            
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-6 sm:mb-8 md:mb-10 tracking-tight uppercase">
              Our Marine <span className="text-accent italic">Services</span> Include:
            </h3>

            <div className="grid sm:grid-cols-2 gap-6">
              {services.map((service, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-accent transition-colors">
                    <service.icon className="w-4 h-4 text-accent group-hover:text-white" />
                  </div>
                  <span className="text-xs font-bold text-white/70 leading-snug group-hover:text-white transition-colors uppercase tracking-widest pt-1">
                    {service.title}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 md:pt-10 border-t border-white/10">
              <p className="text-[9px] sm:text-[10px] text-white/50 uppercase tracking-[0.15em] sm:tracking-[0.2em] leading-relaxed">
                Certified reliability for global maritime fleets. We ensure every component meets the highest technical standards before deployment.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
