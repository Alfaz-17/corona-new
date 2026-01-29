"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Package, Cpu, Gauge, Wrench, ShieldCheck, Zap, Globe, Anchor, ChevronRight } from "lucide-react"

export default function ServicesPage() {
  const services = [
    {
      title: "Marine Spare Parts Supply",
      description: "We supply a wide range of marine spare parts for main engines, auxiliary engines, pumps, purifiers, and deck machinery, ensuring compatibility and reliability.",
      icon: Package,
      features: ["Main & Aux Engine Parts", "Pump & Purifier Spares", "Deck Machinery Components"]
    },
    {
      title: "Marine Automation & Control Systems",
      description: "Corona Marine Parts provides automation systems, sensors, and control equipment to support efficient vessel operations and safety.",
      icon: Cpu,
      features: ["Control Panels & Levers", "Automation Boards", "Bridge Electronics"]
    },
    {
      title: "Engine Room & Machinery Spares",
      description: "Our engine room solutions include valves, filters, bearings, seals, and critical machinery components sourced from trusted suppliers.",
      icon: Gauge,
      features: ["Critical Bearings & Seals", "High-Pressure Valves", "Industrial Filtration Systems"]
    },
    {
       title: "Marine Electronics & Navigation",
       description: "Expert sourcing of navigation radars, GPS units, and sophisticated marine telemetry hardware.",
       icon: Zap,
       features: ["Radar Systems", "Communication Units", "AIS & Depth Sounders"]
    }
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[50dvh] pt-24 sm:pt-28 md:pt-32 flex items-center justify-center bg-primary overflow-hidden">
         <div className="absolute inset-0 z-0">
           <img 
             src="/services-hero.png" 
             alt="Marine Services" 
             className="w-full h-full object-cover opacity-20"
           />
         </div>
         <div className="relative z-10 text-center px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-accent tracking-[0.3em] sm:tracking-[0.4em] uppercase text-[9px] sm:text-[10px] font-bold mb-3 sm:mb-4 block">Fleet Support Hub</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-sans font-bold text-white uppercase tracking-tighter mb-4 sm:mb-6">
                Marine Spare Parts & Services <br className="hidden sm:block"/>
                <span className="text-accent italic">by</span> Corona Marine Parts
              </h1>
            </motion.div>
         </div>
      </section>

      {/* Services Grid */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group border border-border bg-white p-6 sm:p-8 md:p-10 lg:p-12 hover:border-accent transition-all duration-700"
            >
               <div className="flex items-start justify-between mb-5 sm:mb-6 md:mb-8">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-muted flex items-center justify-center group-hover:bg-primary transition-colors">
                    <service.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-accent group-hover:text-white" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sector {i + 1}</span>
               </div>
               
               <h2 className="text-xl sm:text-2xl md:text-3xl font-sans font-bold text-primary mb-4 sm:mb-5 md:mb-6 uppercase tracking-tight group-hover:text-accent transition-colors">
                 {service.title}
               </h2>
               
               <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed mb-6 sm:mb-8 md:mb-10 italic">
                 {service.description}
               </p>

               <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 md:mb-10">
                  {service.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary/70">
                       <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                       {feat}
                    </li>
                  ))}
               </ul>

               <div className="pt-5 sm:pt-6 md:pt-8 border-t border-border flex items-center justify-between">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] text-primary">Inquire Service</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-accent group-hover:translate-x-2 transition-transform" />
               </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary p-6 sm:p-8 md:p-12 lg:p-20 text-center relative overflow-hidden text-white border border-white/5">
             <div className="absolute inset-0 bg-accent/5 pointer-events-none" />
             <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-sans font-bold mb-5 sm:mb-6 md:mb-8 uppercase tracking-tighter">
                Accurate Sourcing. <span className="text-accent italic">Timely</span> Delivery.
             </h2>
             <p className="text-sm sm:text-base md:text-lg text-white/60 mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto italic leading-relaxed">
                Contact our engineering team for specialized spare part requests or urgent vessel support. We provide certified components for the global maritime industry.
             </p>
             <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 md:gap-6">
                <Link href="/contact" className="px-6 sm:px-8 md:px-10 py-4 sm:py-5 bg-accent text-white font-bold uppercase tracking-widest text-[10px] sm:text-xs hover:bg-white hover:text-primary transition-all shadow-2xl">
                   Connect with Experts
                </Link>
                <Link href="/products" className="px-6 sm:px-8 md:px-10 py-4 sm:py-5 border border-white/20 text-white font-bold uppercase tracking-widest text-[10px] sm:text-xs hover:bg-white hover:text-primary transition-all">
                   Browse Inventory
                </Link>
             </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
