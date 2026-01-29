
'use client';

import { useEffect, useRef, useState } from "react"
import { ShieldCheck, Server, Globe, Cpu, Anchor, Wifi, Activity, Box } from "lucide-react"

const features = [
  {
    icon: Cpu,
    title: "Marine Automation",
    description: "Advanced control levers, modules, and automation boards for vessels."
  },
  {
    icon: Activity,
    title: "Industrial Electronics",
    description: "High-quality power supplies, indicators, and interface modules."
  },
  {
    icon: ShieldCheck,
    title: "Engine Control",
    description: "Precision engine remote control and alarm systems for safe operations."
  },
  {
    icon: Server,
    title: "Safety Systems",
    description: "Reliable fire detection, alarms, and emergency bridge electronics."
  },
  {
    icon: Globe,
    title: "Positioning Systems",
    description: "Dynamic Positioning components for precision navigation."
  },
  {
     icon: Box,
     title: "PLC & Modules",
     description: "Industrial-grade control hardware for marine automation units."
  }
]

export function FeatureSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [isVideoVisible, setIsVideoVisible] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)
  const bentoRef = useRef<HTMLDivElement>(null)
  const videoSectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const videoObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVideoVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (bentoRef.current) {
      observer.observe(bentoRef.current)
    }

    if (videoSectionRef.current) {
      videoObserver.observe(videoSectionRef.current)
    }

    if (headerRef.current) {
      headerObserver.observe(headerRef.current)
    }

    return () => {
      if (bentoRef.current) {
        observer.unobserve(bentoRef.current)
      }
      if (videoSectionRef.current) {
        videoObserver.unobserve(videoSectionRef.current)
      }
      if (headerRef.current) {
        headerObserver.unobserve(headerRef.current)
      }
    }
  }, [])

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bento Grid */}
        <div 
          ref={bentoRef}
          className="grid md:grid-cols-4 mb-16 sm:mb-24 md:mb-32 md:grid-rows-[300px_300px] gap-4 sm:gap-6 md:gap-8">
          {/* Left Large Block - Engineering Image */}
          <div 
            className={`relative rounded-none overflow-hidden h-[500px] md:h-auto md:col-span-2 md:row-span-2 transition-all duration-1000 ease-out border border-border bg-primary ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            style={{ transitionDelay: '0ms' }}
          >
            <img
              src="/hero-bg.png"
              alt="Marine Bridge"
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-multiply transition-transform duration-1000 group-hover:scale-110"
            />
            {/* Overlay Card */}
            <div className="absolute bottom-4 sm:bottom-6 md:bottom-10 left-4 sm:left-6 md:left-10 right-4 sm:right-6 md:right-10 bg-primary/95 backdrop-blur-md p-5 sm:p-6 md:p-10 border border-white/10">
              <div className="flex items-start gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl text-white mb-2 sm:mb-3 md:mb-4 font-bold uppercase tracking-tight">
                    24/7 <span className="text-accent underline underline-offset-4 sm:underline-offset-8">Monitoring</span>
                  </h3>
                  <p className="text-[10px] sm:text-xs text-white/70 leading-relaxed font-medium italic">
                    Our proprietary telemetry systems provide continuous physiological feedback from engine blocks to ensure peak operational reliability.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Right - Cyber Security / Logistics */}
          <div 
            className={`rounded-none p-10 flex flex-col justify-center md:col-span-2 relative overflow-hidden transition-all duration-1000 ease-out border border-border bg-foreground ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            style={{ transitionDelay: '150ms' }}
          >
            <img 
               src="/industrial-electronics-new.png"
               alt="Security"
               className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
            />
            
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl md:text-4xl text-white mb-2 font-extrabold tracking-tighter uppercase">
                Fortified
              </h3>
              <h3 className="text-lg sm:text-xl md:text-2xl text-accent mb-4 sm:mb-5 md:mb-6 font-medium italic opacity-80">
                Encrypted Logistics Grid
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-white/90 text-[10px] font-bold uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-accent" />
                  <span>Redundant Core Processors</span>
                </div>
                <div className="flex items-center gap-3 text-white/90 text-[10px] font-bold uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-accent" />
                  <span>IMO Cyber Compliance 02.</span>
                </div>
                <div className="flex items-center gap-3 text-white/90 text-[10px] font-bold uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-accent" />
                  <span>Encrypted Satellite Uplink</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Right - Satellite / Bridge */}
          <div 
            className={`rounded-none p-10 flex flex-col justify-center relative overflow-hidden md:col-span-2 transition-all duration-1000 ease-out bg-white border border-border ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
             <img 
               src="/global-fleet-new.png"
               alt="Logistics"
               className="absolute inset-0 w-full h-full object-cover transition-all duration-1000"
            />
             <div className="absolute inset-0 bg-primary/20" />
            
            <div className="relative z-10 flex flex-col justify-center h-full text-left items-start">
              <div className="inline-flex items-center justify-center w-14 h-14 mb-6 bg-primary text-white border border-white/20">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="font-sans text-[10px] font-extrabold uppercase tracking-[0.4em] mb-2 text-white">
                Global Operations
              </h3>
              <h3 className="text-3xl mb-2 text-white font-extrabold tracking-tight uppercase">
                Enterprise Fleet Control
              </h3>
            </div>
          </div>
        </div>

        <div 
          ref={videoSectionRef}
          className="grid lg:grid-cols-2 gap-10 sm:gap-14 lg:gap-20 items-center mt-12 sm:mt-16 md:mt-20">
          {/* Static Image */}
          <div 
            className={`relative aspect-[3/4] rounded-none overflow-hidden transition-all duration-1000 ease-out border border-border shadow-[inset_0_0_60px_rgba(0,0,0,0.1)] ${
              isVideoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
             <img 
               src="/marine-automation-new.png"
               alt="Automation"
               className="absolute inset-0 w-full h-full object-cover brightness-75 hover:brightness-100 transition-all duration-1000"
            />
          </div>

          {/* Content */}
          <div
            ref={headerRef}
            className={`transition-all duration-1000 ease-out ${
              isVideoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <span className={`text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] uppercase text-accent font-bold mb-4 sm:mb-5 md:mb-6 block ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.2s', animationFillMode: 'forwards' } : {}}>
              Engineering Discipline
            </span>
            <h2 className={`font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-7xl leading-tight text-primary mb-5 sm:mb-6 md:mb-8 text-balance uppercase tracking-tighter ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.4s', animationFillMode: 'forwards' } : {}}>
              Precision at *every* knot.
            </h2>
            <p className={`text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed mb-8 sm:mb-10 md:mb-12 max-w-md italic ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.6s', animationFillMode: 'forwards' } : {}}>
              Our systems are forged on open-architecture principles, enabling high-contrast integration with legacy marine bridge electronics.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group p-5 sm:p-6 md:p-8 marine-transition border border-border/50 bg-white hover:bg-background">
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 mb-4 sm:mb-5 md:mb-6 group-hover:bg-primary group-hover:text-white marine-transition bg-background text-primary border border-border shadow-sm">
                    <feature.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-[9px] sm:text-[10px] font-extrabold text-primary uppercase tracking-[0.25em] sm:tracking-[0.3em] mb-2">{feature.title}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

