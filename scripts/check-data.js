
const mongoose = require('mongoose');

async function checkData() {
  const MONGODB_URI = "mongodb+srv://alfazkerroudji:alfaz@cluster0.puz4v.mongodb.net/corona-marine?retryWrites=true&w=majority";
  
  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({ name: String, description: String }, { timestamps: true }));
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({ 
      title: String, description: String, 
      category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
      brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
      image: String, featured: Boolean 
    }, { timestamps: true }));
    const Brand = mongoose.models.Brand || mongoose.model('Brand', new mongoose.Schema({ name: String, logo: String, description: String }, { timestamps: true }));

    const categoryCount = await Category.countDocuments();
    const productCount = await Product.countDocuments();
    const brandCount = await Brand.countDocuments();

    console.log(`\n--- Database Status ---`);
    console.log(`Categories: ${categoryCount}`);
    console.log(`Products: ${productCount}`);
    console.log(`Brands: ${brandCount}`);

    if (categoryCount > 0) {
      const sampleCats = await Category.find().limit(5);
      console.log("\nSample Categories:");
      sampleCats.forEach(c => console.log(`- ${c.name}`));
    }

    if (productCount > 0) {
      const sampleProds = await Product.find().limit(5).populate('category').populate('brand');
      console.log("\nSample Products:");
      sampleProds.forEach(p => console.log(`- ${p.title} (Category: ${p.category?.name}, Brand: ${p.brand?.name})`));
    }

    process.exit(0);
  } catch (err) {
    console.error("Error checking data:", err);
    process.exit(1);
  }
}

checkData();
