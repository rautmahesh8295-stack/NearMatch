import mongoose from 'mongoose';

const ClaimSchema = new mongoose.Schema(
  {
    pin: { type: String, required: true, unique: true, index: true },
    productId: { type: String, required: true, index: true },
    storeId: { type: String, required: true, index: true },
    product: { type: String, required: true },
    store: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['Active', 'Redeemed', 'Expired'], default: 'Active', index: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Claim || mongoose.model('Claim', ClaimSchema);
