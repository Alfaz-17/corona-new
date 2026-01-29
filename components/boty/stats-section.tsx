"use client"

import React from "react";
import { motion } from "framer-motion";
import { Shield, Award, Clock, Anchor, Globe } from "lucide-react";

const stats = [
  { icon: Award, label: "Years Experience", value: "15+" },
  { icon: Globe, label: "Exporting Regions", value: "40+" },
  { icon: Anchor, label: "Satisfied Clients", value: "1000+" },
  { icon: Shield, label: "Certified Spares", value: "100%" },
];

export function StatsSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-primary relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 lg:gap-24">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-8 transition-transform group-hover:scale-110 shadow-2xl">
                 <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary" />
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-2 sm:mb-3 md:mb-4 tracking-tighter">
                {stat.value}
              </h3>
              <p className="text-accent text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
