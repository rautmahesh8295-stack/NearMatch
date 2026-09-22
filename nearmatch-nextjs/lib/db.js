import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

let seedPromise = null;

export async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return mongoose.connection;
  if (!MONGODB_URI) return null;
  if (!globalThis.__nearmatch_mongoose) {
    globalThis.__nearmatch_mongoose = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }
  try {
    await globalThis.__nearmatch_mongoose;
    // Seed on first successful connection (idempotent).
    if (!seedPromise) {
      seedPromise = seedIfEmpty().catch((e) => console.warn('[nearmatch] seed skipped:', e.message));
    }
    await seedPromise;
    return mongoose.connection;
  } catch (err) {
    console.warn('[nearmatch] MongoDB unavailable, using in-memory fallback:', err.message);
    return null;
  }
}

export function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

async function seedIfEmpty() {
  const { default: User } = await import('@/models/User.js').catch(() => ({ default: null }));
  const { default: Product } = await import('@/models/Product.js').catch(() => ({ default: null }));
  // Dynamic import of seed data to avoid circular deps.
  const { INVENTORY } = await import('./seed-data.js');
  const { hashPassword } = await import('./auth.js');
  if (!User || !Product) return;
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.insertMany(
      INVENTORY.map((p) => ({
        productId: p.id,
        brand: p.brand,
        name: p.name,
        category: p.category,
        image: p.image,
        online: p.online,
        stores: p.stores.map((s) => ({
          storeId: s.id,
          name: s.name,
          area: s.area,
          distance: s.distance,
          price: s.price,
          stock: s.stock,
          rating: s.rating,
          walk: s.walk,
        })),
      }))
    );
    console.log('[nearmatch] seeded products into MongoDB');
  }
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    await User.create({
      name: 'Priya Shah',
      email: 'priya@soundvision.in',
      storeId: 's1',
      storeName: 'Sound & Vision',
      passwordHash: hashPassword('nearmatch-demo'),
    });
    console.log('[nearmatch] seeded demo merchant into MongoDB');
  }
}
