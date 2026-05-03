
import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

export const User = models?.User || model('User', UserSchema);

const CategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  description: { type: String },
  image: { type: String }
}, { timestamps: true });

CategorySchema.pre('save', function(this: any) {
  if (this.isModified('name') && (!this.slug || this.isNew)) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
});

export const Category = models?.Category || model('Category', CategorySchema);

const ProductSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  metaTitle: { type: String },
  metaDescription: { type: String },
  description: { type: String },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  brand: { type: Schema.Types.ObjectId, ref: 'Brand' },
  brandName: { type: String }, // Fallback for AI generated brand
  specifications: { type: Schema.Types.Mixed },
  keywords: [{ type: String }],
  sku: { type: String },
  price: { type: Number, default: 0 },
  availability: { type: String, enum: ['in-stock', 'out-of-stock', 'on-demand'], default: 'in-stock' },
  image: { type: String },
  images: [{ type: String }],
  featured: { type: Boolean, default: false },
  reviews: [{
    userName: String,
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    date: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false }
  }],
  questions: [{
    question: String,
    answer: String,
    userName: String,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const preSaveProduct = function(this: any) {
  if (this.isModified('title') && (!this.slug || this.isNew)) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
};

ProductSchema.pre('save', preSaveProduct);

export const Product = models?.Product || model('Product', ProductSchema);

const BrandSchema = new Schema({
  name: { type: String, required: true },
  logo: { type: String },
  description: { type: String }
}, { timestamps: true });

export const Brand = models?.Brand || model('Brand', BrandSchema);

const BlogSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  excerpt: { type: String },
  content: { type: String },
  image: { type: String },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const preSaveBlog = function(this: any) {
  if (this.isModified('title') && (!this.slug || this.isNew)) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
};

BlogSchema.pre('save', preSaveBlog);

export const Blog = models?.Blog || model('Blog', BlogSchema);

const OrderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productTitle: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 }
});

const OrderSchema = new Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String },
  items: [OrderItemSchema],
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: { type: String }
}, { timestamps: true });


export const Order = models?.Order || model('Order', OrderSchema);

const SettingsSchema = new Schema({
  autoBackgroundRemoval: { type: Boolean, default: false },
  applyWatermark: { type: Boolean, default: true },
  watermarkText: { type: String, default: 'Corona Marine' },
  geminiModel: { type: String, default: 'gemini-2.5-flash' }
}, { timestamps: true });

export const Settings = models?.Settings || model('Settings', SettingsSchema);

