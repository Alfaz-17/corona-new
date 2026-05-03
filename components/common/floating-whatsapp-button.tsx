"use client"

import React from 'react';
import { motion } from 'framer-motion';

export const FloatingWhatsappButton = () => {
  return (
    <motion.div
      className="fixed bottom-7 right-7 z-50"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 3 }} // Wait 3 seconds to let mobile page load first
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <a
        href="https://wa.me/919376502550?text=Hi%20I%20want%20to%20know%20more%20about%20your%20products"
        target="_blank"
        rel="noopener noreferrer"
        className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white shadow-lg flex items-center justify-center rounded-full transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="w-8 h-8 fill-current"
        >
          <path d="M16.001 3.2c-7.067 0-12.8 5.733-12.8 12.8 0 2.261.597 4.469 1.728 6.4L3.2 28.8l6.635-1.728a12.727 12.727 0 006.165 1.6h.001c7.067 0 12.8-5.733 12.8-12.8s-5.733-12.672-12.8-12.672zm0 23.253a10.44 10.44 0 01-5.333-1.493l-.384-.213-3.947 1.024 1.056-3.84-.251-.395a10.47 10.47 0 01-1.621-5.547c0-5.781 4.715-10.496 10.496-10.496s10.496 4.715 10.496 10.496-4.715 10.464-10.496 10.464zm5.717-7.765c-.309-.154-1.813-.896-2.093-.997-.28-.103-.485-.155-.691.154-.203.309-.794.997-.973 1.205-.18.206-.357.232-.666.077-.309-.154-1.305-.48-2.487-1.531-.919-.82-1.541-1.833-1.722-2.142-.18-.309-.019-.477.136-.631.141-.14.309-.36.463-.54.154-.18.206-.309.309-.514.103-.206.052-.386-.026-.54-.077-.154-.691-1.664-.947-2.28-.25-.6-.505-.517-.691-.526l-.59-.011c-.206 0-.54.077-.823.386-.283.309-1.08 1.057-1.08 2.577s1.107 2.989 1.26 3.197c.154.206 2.179 3.328 5.28 4.66.739.319 1.315.509 1.764.651.741.236 1.414.203 1.944.123.593-.088 1.813-.741 2.07-1.457.257-.714.257-1.326.18-1.457-.074-.128-.28-.206-.589-.36z" />
        </svg>
      </a>
    </motion.div>
  );
};
