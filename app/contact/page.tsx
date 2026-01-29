"use client"

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import api from "@/lib/api";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  const [status, setStatus] = useState("idle"); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await api.post("/contact", formData);
      if (res.status === 200 || res.status === 201) {
        setStatus("success");
        setFormData({ name: "", email: "", phone: "", company: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus("error");
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: ["+91 93765 02550"],
      action: "tel:+919376502550",
    },
    {
      icon: Mail,
      title: "Email",
      details: ["coronamarine5050@gmail.com"],
      action: "mailto:coronamarine5050@gmail.com",
    },
    {
      icon: MapPin,
      title: "Address",
      details: ["Bhavnagar, Gujarat, India"],
      action: null,
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: [
        "Mon - Fri: 8:00 AM - 6:00 PM",
        "Sat: 9:00 AM - 4:00 PM",
        "Sun: Emergency Only",
      ],
      action: null,
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[60dvh] pt-24 sm:pt-28 md:pt-32 flex items-center justify-center bg-primary overflow-hidden">
        <div className="absolute inset-0">
           <img 
            src="/contact-hero.png" 
            alt="Contact" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 text-center text-white px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-sans font-extrabold uppercase tracking-tighter mb-3 sm:mb-4">
              Contact Corona Marine Parts
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-accent font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-6 sm:mb-8 max-w-3xl mx-auto">
              Get in touch with Corona Marine Parts for marine spare part inquiries, technical support, or urgent sourcing requirements. Our team is ready to assist marine professionals with reliable solutions.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <a
                href="tel:+919376502550"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-accent text-white font-bold uppercase tracking-widest text-[10px] sm:text-xs hover:bg-white hover:text-primary transition-all"
              >
                Call Now
              </a>
              <a
                href="#contact-form"
                className="px-6 sm:px-8 py-3 sm:py-4 border border-white/30 text-white font-bold uppercase tracking-widest text-[10px] sm:text-xs hover:bg-white hover:text-primary transition-all"
              >
                Get Quote
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 md:gap-16">
          
          {/* Contact Details */}
          <div className="lg:col-span-1 space-y-8">
            <h2 className="text-3xl font-bold text-primary mb-8 border-b-2 border-accent pb-4 inline-block">Contact Info</h2>
            <div className="grid grid-cols-1 gap-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex gap-6 p-6 bg-muted/20 border border-border group hover:border-accent transition-colors">
                  <div className="w-12 h-12 bg-primary text-white flex items-center justify-center shrink-0 group-hover:bg-accent transition-colors">
                    <info.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary uppercase text-sm mb-2">{info.title}</h3>
                    <div className="space-y-1">
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-muted-foreground">
                          {info.action && idx === 0 ? (
                            <a href={info.action} className="hover:text-accent font-medium">
                              {detail}
                            </a>
                          ) : detail}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Emergency Service */}
            <div className="mt-12 p-8 bg-red-50 border-l-4 border-red-600 shadow-sm">
                <h3 className="text-xl font-bold text-red-700 mb-4 uppercase tracking-wider">
                  Emergency Support
                </h3>
                <p className="text-red-600/80 mb-6 italic">
                  Available 24/7 for urgent marine assistance and emergency repairs.
                </p>
                <a href="tel:+919376502550" className="inline-flex items-center text-red-700 font-bold hover:gap-4 transition-all">
                   <Phone className="w-4 h-4 mr-2" /> CALL EMERGENCY HOTLINE
                </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-10 border border-border shadow-2xl relative">
              <h2 className="text-3xl font-bold text-primary mb-10">Send a Query</h2>
              
              {status === "success" ? (
                <div className="text-center py-20 bg-accent/10 rounded-xl">
                  <CheckCircle className="w-20 h-20 text-accent mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-primary mb-2">Inquiry Received</h3>
                  <p className="text-muted-foreground">Our engineering team will review your requirements and respond within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-primary uppercase">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border focus:border-accent outline-none bg-muted/10"
                        required
                        placeholder="e.g. Capt. James Cook"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-primary uppercase">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border focus:border-accent outline-none bg-muted/10"
                        required
                        placeholder="james@fleetmanagement.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-primary uppercase">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border focus:border-accent outline-none bg-muted/10"
                        placeholder="+91 00000 00000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-primary uppercase">Company Name</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border focus:border-accent outline-none bg-muted/10"
                        placeholder="Logistics Corp"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary uppercase">Your Requirements</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-border focus:border-accent outline-none bg-muted/10 h-40 resize-none"
                      required
                      placeholder="List automation systems or spare parts required..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-primary text-white font-bold uppercase tracking-widest hover:bg-accent transition-all flex items-center justify-center gap-4"
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? "TRANSMITTING..." : (
                      <>
                        <Send className="w-5 h-5" />
                        SEND TRANSMISSION
                      </>
                    )}
                  </button>

                  {status === "error" && (
                    <p className="text-red-500 font-bold text-center mt-4 uppercase text-xs tracking-widest">
                      Transmission Failed. Please verify connectivity and try again.
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-[400px] w-full hover:brightness-110 transition-all duration-700">
         <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.5709!2d72.1416!3d21.7645!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDQ1JzUyLjIiTiA3MsKwMDgnMjguMCJF!5e0!3m2!1sen!2sin!4v1670000000000"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          ></iframe>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 uppercase tracking-tight">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-10 text-white/70 max-w-2xl mx-auto">
              Contact our marine experts today for a free consultation
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a 
                href="tel:+919376502550" 
                className="px-10 py-5 bg-accent text-white font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-primary transition-all flex items-center justify-center gap-3"
              >
                <Phone className="w-5 h-5" />
                Call Now
              </a>
              <a 
                href="#contact-form" 
                className="px-10 py-5 border border-white/30 text-white font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-primary transition-all flex items-center justify-center gap-3"
              >
                <Send className="w-5 h-5" />
                Get Quote
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
