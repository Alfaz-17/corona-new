export const brands = [
  { name: "Furuno", logo: "https://www.furuno.com/files/images/ogp/ogp_default.jpg", description: "Global leader in maritime electronics and navigation systems." },
  { name: "JRC", logo: "https://www.jrc.co.jp/en/images/common/ogp.png", description: "Japan Radio Co., Ltd. specializing in wireless communications and marine electronics." },
  { name: "Raymarine", logo: "https://www.raymarine.com/static/images/logo-og.jpg", description: "High-performance marine electronics for the recreational and light commercial markets." },
  { name: "Sperry Marine", logo: "https://www.sperrymarine.com/sites/default/files/sperry-marine-og-image.jpg", description: "Worldwide provider of navigation, communication, and automation systems." },
  { name: "Wartsila", logo: "https://www.wartsila.com/images/default-source/global-images/wartsila_logo_og.jpg?sfvrsn=7e8e5045_2", description: "Global leader in innovative technologies and lifecycle solutions for the marine market." }
];

export const categories = [
  { name: "Marine Automation", description: "PLC systems, bridge control interfaces, and engine monitoring units." },
  { name: "Navigation", description: "Radar systems, Sonar, GPS, and Gyrocompasses." },
  { name: "Safety Systems", description: "Fire detection, Alarms, and Emergency communication equipment." },
  { name: "Propulsion", description: "Engine control systems, Governors, and auxiliary machinery units." }
];

export const products = [
  {
    title: "Bridge Command X1",
    description: "Centralized vessel control interface for modern fleets.",
    categoryName: "Marine Automation",
    brandName: "Furuno",
    image: "https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg",
    featured: true
  },
  {
    title: "FAR-22x8 Radar",
    description: "Solid-state Marine Radar with advanced signal processing.",
    categoryName: "Navigation",
    brandName: "Furuno",
    image: "https://images.pexels.com/photos/934445/pexels-photo-934445.jpeg",
    featured: true
  },
  {
    title: "AlphaBridge System",
    description: "Integrated bridge console with multi-function displays.",
    categoryName: "Marine Automation",
    brandName: "JRC",
    image: "https://images.pexels.com/photos/20581299/pexels-photo-20581299.jpeg",
    featured: true
  },
  {
    title: "Axiom XL 24",
    description: "Glass Bridge display for commercial maritime applications.",
    categoryName: "Navigation",
    brandName: "Raymarine",
    image: "https://images.pexels.com/photos/7276216/pexels-photo-7276216.jpeg",
    featured: false
  },
  {
    title: "VisionMaster FT",
    description: "High-performance Chart Radar and ARPA system.",
    categoryName: "Navigation",
    brandName: "Sperry Marine",
    image: "https://images.pexels.com/photos/6835042/pexels-photo-6835042.jpeg",
    featured: true
  },
  {
    title: "Autronica AutroSafe",
    description: "Interactive fire detection system for offshore vessels.",
    categoryName: "Safety Systems",
    brandName: "Sperry Marine",
    image: "https://images.unsplash.com/photo-1621905251189-08b95d63329f?q=80&w=2069&auto=format&fit=crop",
    featured: false
  },
  {
    title: "RT-flex Engine Controller",
    description: "Advanced propulsion management for low-speed engines.",
    categoryName: "Propulsion",
    brandName: "Wartsila",
    image: "https://images.pexels.com/photos/190574/pexels-photo-190574.jpeg",
    featured: true
  }
];

export const blogs = [
  {
    title: "The Future of Autonomous Navigation",
    excerpt: "Exploring the shift towards AI-driven bridge systems in commercial shipping.",
    content: "Content relating to autonomous navigation and human-in-the-loop systems.",
    image: "https://images.pexels.com/photos/813465/pexels-photo-813465.jpeg"
  },
  {
    title: "Optimizing Fleet Efficiency with IoT",
    excerpt: "How real-time engine telemetry is reducing fuel consumption across global fleets.",
    content: "Deep dive into J1939 protocols and cloud-based fleet analytics.",
    image: "https://images.pexels.com/photos/3861964/pexels-photo-3861964.jpeg"
  }
];
