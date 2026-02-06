
const mongoose = require('mongoose');

// Mappings from the seed data (simplified for the script)
const brands = [
  { name: "Furuno", logo: "https://www.furuno.com/files/images/ogp/ogp_default.jpg", description: "Global leader in maritime electronics and navigation systems." },
  { name: "JRC", logo: "https://www.jrc.co.jp/en/images/common/ogp.png", description: "Japan Radio Co., Ltd. specializing in wireless communications and marine electronics." },
  { name: "Raymarine", logo: "https://www.raymarine.com/static/images/logo-og.jpg", description: "High-performance marine electronics for the recreational and light commercial markets." },
  { name: "Sperry Marine", logo: "https://www.sperrymarine.com/sites/default/files/sperry-marine-og-image.jpg", description: "Worldwide provider of navigation, communication, and automation systems." },
  { name: "Wartsila", logo: "https://www.wartsila.com/images/default-source/global-images/wartsila_logo_og.jpg?sfvrsn=7e8e5045_2", description: "Global leader in innovative technologies and lifecycle solutions for the marine market." }
];

const categories = [
  { name: "Marine Automation", description: "PLC systems, bridge control interfaces, and engine monitoring units." },
  { name: "Navigation", description: "Radar systems, Sonar, GPS, and Gyrocompasses." },
  { name: "Safety Systems", description: "Fire detection, Alarms, and Emergency communication equipment." },
  { name: "Propulsion", description: "Engine control systems, Governors, and auxiliary machinery units." }
];

const products = [
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
  }
];

const blogs = [
  {
    title: "The Future of Autonomous Navigation",
    excerpt: "Exploring the shift towards AI-driven bridge systems in commercial shipping.",
    content: "Content relating to autonomous navigation and human-in-the-loop systems.",
    image: "https://images.pexels.com/photos/813465/pexels-photo-813465.jpeg"
  }
];

async function seed() {
  const MONGODB_URI = "mongodb+srv://alfazkerroudji:alfaz@cluster0.puz4v.mongodb.net/corona-marine?retryWrites=true&w=majority";
  
  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    // Define schemas here to avoid imports
    const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({ name: String, description: String }, { timestamps: true }));
    const Brand = mongoose.models.Brand || mongoose.model('Brand', new mongoose.Schema({ name: String, logo: String, description: String }, { timestamps: true }));
    const Blog = mongoose.models.Blog || mongoose.model('Blog', new mongoose.Schema({ title: String, excerpt: String, content: String, image: String, date: { type: Date, default: Date.now } }, { timestamps: true }));
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({ 
      title: String, description: String, 
      category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
      brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
      image: String, featured: Boolean 
    }, { timestamps: true }));

    console.log("Clearing data...");
    await Promise.all([
      Category.deleteMany({}),
      Brand.deleteMany({}),
      Blog.deleteMany({}),
      Product.deleteMany({})
    ]);

    console.log("Seeding categories...");
    const createdCats = await Category.insertMany(categories);
    const catMap = createdCats.reduce((acc, c) => ({ ...acc, [c.name]: c._id }), {});

    console.log("Seeding brands...");
    const createdBrands = await Brand.insertMany(brands);
    const brandMap = createdBrands.reduce((acc, b) => ({ ...acc, [b.name]: b._id }), {});

    console.log("Seeding blogs...");
    await Blog.insertMany(blogs);

    console.log("Seeding products...");
    const productsWithRefs = products.map(p => ({
      ...p,
      category: catMap[p.categoryName],
      brand: brandMap[p.brandName]
    }));
    await Product.insertMany(productsWithRefs);

    console.log("Seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Error during seeding:", err);
    process.exit(1);
  }
}

seed();
