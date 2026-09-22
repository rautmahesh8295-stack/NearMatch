import mongoose from 'mongoose';

const StoreOfferSchema = new mongoose.Schema(
  {
    storeId: { type: String, required: true },
    name: { type: String, required: true },
    area: { type: String, default: '' },
    distance: { type: Number, default: 0.5 },
    price: { type: Number, required: true },
    stock: { type: String, default: 'In stock' },
    rating: { type: Number, default: 5 },
    walk: { type: String, default: '6 min' },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, unique: true, index: true },
    brand: { type: String, required: true, index: true },
    name: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    image: { type: String, default: '🛍️' },
    online: { type: Number, required: true },
    stores: { type: [StoreOfferSchema], default: [] },
  },
  { timestamps: true }
);

ProductSchema.index({ brand: 'text', name: 'text', category: 'text' });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
