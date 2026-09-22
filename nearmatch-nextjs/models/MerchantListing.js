import mongoose from 'mongoose';

const MerchantListingSchema = new mongoose.Schema(
  {
    storeId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    storeName: { type: String, required: true },
    area: { type: String, default: 'Local store' },
    distance: { type: Number, default: 0.5 },
    price: { type: Number, required: true },
    stock: { type: String, default: 'In stock' },
    rating: { type: Number, default: 5 },
    walk: { type: String, default: '6 min' },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

MerchantListingSchema.index({ storeId: 1, productId: 1 }, { unique: true });

export default mongoose.models.MerchantListing || mongoose.model('MerchantListing', MerchantListingSchema);
