// Seeds MongoDB with the NearMatch catalog + demo merchant.
// Usage: npm run seed  (requires MONGODB_URI in .env.local or env)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
for (const f of ['.env.local', '.env']) {
  const p = path.join(root, f);
  if (fs.existsSync(p)) {
    for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
    break;
  }
}

const { default: mongoose } = await import('mongoose');
const { INVENTORY } = await import('../lib/seed-data.js');
const { hashPassword } = await import('../lib/auth.js');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set. Copy .env.example to .env.local and set it first.');
  process.exit(1);
}

await mongoose.connect(uri);
const { default: Product } = await import('../models/Product.js');
const { default: User } = await import('../models/User.js');

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
      stores: p.stores.map((s) => ({ storeId: s.id, name: s.name, area: s.area, distance: s.distance, price: s.price, stock: s.stock, rating: s.rating, walk: s.walk })),
    }))
  );
  console.log(`Seeded ${INVENTORY.length} products.`);
} else {
  console.log(`Products already seeded (${productCount}).`);
}

const userCount = await User.countDocuments();
if (userCount === 0) {
  await User.create({ name: 'Priya Shah', email: 'priya@soundvision.in', storeId: 's1', storeName: 'Sound & Vision', passwordHash: hashPassword('nearmatch-demo') });
  console.log('Seeded demo merchant priya@soundvision.in / nearmatch-demo.');
} else {
  console.log(`Users already seeded (${userCount}).`);
}

await mongoose.disconnect();
console.log('Done.');
