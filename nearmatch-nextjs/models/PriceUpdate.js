import mongoose from 'mongoose';

const PriceUpdateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    productId: { type: String, required: true },
    storeId: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: String, default: 'In stock' },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.PriceUpdate || mongoose.model('PriceUpdate', PriceUpdateSchema);
