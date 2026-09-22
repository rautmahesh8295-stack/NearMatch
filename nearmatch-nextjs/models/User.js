import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    storeId: { type: String, required: true, index: true },
    storeName: { type: String, required: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
