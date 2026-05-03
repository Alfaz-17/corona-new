
import connectToDatabase from './lib/db';
import { Product } from './lib/models';

async function migrateSlugs() {
  try {
    await connectToDatabase();
    const products = await Product.find({ slug: { $exists: false } });
    console.log(`Found ${products.length} products without slugs.`);

    for (const product of products) {
      // The pre-save hook in models.ts will handle slug generation
      // but we need to trigger it.
      if (!product.slug) {
        product.slug = product.title
          .toLowerCase()
          .trim()
          .replace(/[^\w ]+/g, '')
          .replace(/ +/g, '-');
        
        await product.save();
        console.log(`Migrated: ${product.title} -> ${product.slug}`);
      }
    }

    const allProducts = await Product.find({});
    for (const p of allProducts) {
        if (!p.slug || p.slug.length < 3) {
             p.slug = p.title
              .toLowerCase()
              .trim()
              .replace(/[^\w ]+/g, '')
              .replace(/ +/g, '-');
            await p.save();
            console.log(`Fixed Slug: ${p.title} -> ${p.slug}`);
        }
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateSlugs();
