import crypto from 'crypto';
import { dbConnect, isDbConnected } from './db.js';
import { INVENTORY, STORE_COORDINATES, distanceKm } from './seed-data.js';
import { hashPassword } from './auth.js';

// ---- In-memory fallback (used when MONGODB_URI is missing/unreachable) ----
function mem() {
  if (!globalThis.__nearmatch_mem) {
    globalThis.__nearmatch_mem = {
      users: [
        {
          _id: 'merchant-priya',
          name: 'Priya Shah',
          email: 'priya@soundvision.in',
          storeId: 's1',
          storeName: 'Sound & Vision',
          // legacy unsalted scrypt hash for 'nearmatch-demo' — verifyPassword handles it
          passwordHash: crypto.scryptSync('nearmatch-demo', 'nearmatch', 64).toString('hex'),
        },
      ],
      claims: [],
      listings: {}, // storeId -> array
      priceUpdates: {}, // "productId:storeId" -> { price, stock, updatedAt }
      seeded: true,
    };
  }
  return globalThis.__nearmatch_mem;
}

export async function ensureDb() {
  try {
    await dbConnect();
  } catch {
    // fallback to memory
  }
  return isDbConnected();
}

function applyOverlays(product, listings, priceUpdates) {
  const extra = [];
  for (const [storeId, items] of Object.entries(listings)) {
    for (const l of items) {
      if ((l.productId || l.product_id) === (product.productId || product.id)) {
        extra.push({
          id: storeId,
          storeId,
          name: l.storeName,
          area: l.area || 'Local store',
          distance: l.distance ?? 0.5,
          price: l.price,
          stock: l.stock,
          rating: l.rating ?? 5,
          walk: l.walk || '6 min',
          updatedAt: l.updatedAt,
        });
      }
    }
  }
  const baseStores = (product.stores || []).map((s) => ({
    id: s.storeId || s.id,
    storeId: s.storeId || s.id,
    name: s.name,
    area: s.area,
    distance: s.distance,
    price: s.price,
    stock: s.stock,
    rating: s.rating,
    walk: s.walk,
    updatedAt: s.updatedAt,
  }));
  const hour = new Date().getHours();
  const withUpdates = [...baseStores, ...extra].map((store) => {
    const pid = product.productId || product.id;
    const upd = priceUpdates[`${pid}:${store.storeId || store.id}`];
    const current = upd ? { ...store, price: upd.price, stock: upd.stock, updatedAt: upd.updatedAt } : store;
    return { ...current, hours: '9:00 AM–9:00 PM', openNow: hour >= 9 && hour < 21 };
  });
  return {
    id: product.productId || product.id,
    productId: product.productId || product.id,
    brand: product.brand,
    name: product.name,
    category: product.category,
    image: product.image || '🛍️',
    online: product.online ?? product.online_price,
    stores: withUpdates,
  };
}

/** Full merged catalog (products + merchant listings + price updates). */
export async function getMarket() {
  const connected = await ensureDb();
  if (connected) {
    const [{ default: Product }, { default: MerchantListing }, { default: PriceUpdate }] = await Promise.all([
      import('@/models/Product.js'),
      import('@/models/MerchantListing.js'),
      import('@/models/PriceUpdate.js'),
    ]);
    const [products, listings, updates] = await Promise.all([
      Product.find({}).lean(),
      MerchantListing.find({}).lean(),
      PriceUpdate.find({}).lean(),
    ]);
    const grouped = {};
    for (const l of listings) {
      grouped[l.storeId] = grouped[l.storeId] || [];
      grouped[l.storeId].push({ ...l, productId: l.productId });
    }
    const updMap = {};
    for (const u of updates) updMap[u.key] = { price: u.price, stock: u.stock, updatedAt: u.updatedAt };
    return products.map((p) => applyOverlays(p, grouped, updMap));
  }
  const m = mem();
  const products = INVENTORY.map((p) => ({ ...p, productId: p.id }));
  return products.map((p) => applyOverlays(p, m.listings, m.priceUpdates));
}

export async function searchMarket(q = '', lat, lng) {
  const market = await getMarket();
  const raw = String(q || '').toLowerCase().trim();
  const terms = raw.split(/\s+/).filter(Boolean).map((t) => (t.endsWith('s') ? t.slice(0, -1) : t));
  const hasLocation = Number.isFinite(lat) && Number.isFinite(lng);
  const demoDist = hasLocation ? distanceKm(lat, lng, 12.935, 77.624) : 0;
  const useLocation = hasLocation && demoDist < 20;
  const located = market.map((p) => ({
    ...p,
    stores: p.stores.map((s) => {
      const point = STORE_COORDINATES[s.storeId || s.id];
      return useLocation && point ? { ...s, distance: distanceKm(lat, lng, point[0], point[1]) } : s;
    }),
  }));
  if (!terms.length) return located;
  return located.filter((p) => terms.every((t) => `${p.brand} ${p.name} ${p.category}`.toLowerCase().includes(t)));
}

// ---- Users ----
export async function findUserByEmail(email) {
  const connected = await ensureDb();
  const key = String(email || '').toLowerCase();
  if (connected) {
    const { default: User } = await import('@/models/User.js');
    return User.findOne({ email: key }).lean();
  }
  return mem().users.find((u) => u.email.toLowerCase() === key) || null;
}

export async function findUserById(id) {
  const connected = await ensureDb();
  if (connected) {
    const { default: User } = await import('@/models/User.js');
    return User.findById(id).lean().catch(() => User.findOne({ storeId: id }).lean());
  }
  return mem().users.find((u) => u._id === id || u.id === id) || null;
}

export async function createUser({ name, email, passwordHash, storeId, storeName }) {
  const connected = await ensureDb();
  if (connected) {
    const { default: User } = await import('@/models/User.js');
    const doc = await User.create({ name, email: String(email).toLowerCase(), passwordHash, storeId, storeName });
    return doc.toObject();
  }
  const m = mem();
  const user = { _id: `merchant-${crypto.randomUUID()}`, name, email: String(email).toLowerCase(), storeId, storeName, passwordHash };
  m.users.push(user);
  return user;
}

// ---- Claims ----
export async function createClaimRecord({ productId, storeId, product, store, price }) {
  const pin = String(Math.floor(1000 + Math.random() * 9000));
  const expiresAt = new Date(Date.now() + 3600000);
  const connected = await ensureDb();
  if (connected) {
    const { default: Claim } = await import('@/models/Claim.js');
    const doc = await Claim.create({ pin, productId, storeId, product, store, price, status: 'Active', expiresAt });
    const o = doc.toObject();
    return { id: o._id, pin: o.pin, productId, storeId, product, store, price, expiresAt: o.expiresAt.getTime(), status: o.status };
  }
  const claim = { id: crypto.randomUUID(), pin, productId, storeId, product, store, price, expiresAt: expiresAt.getTime(), status: 'Active' };
  mem().claims.push(claim);
  return claim;
}

export async function findActiveClaimByPin(pin) {
  const connected = await ensureDb();
  if (connected) {
    const { default: Claim } = await import('@/models/Claim.js');
    const c = await Claim.findOne({ pin: String(pin), status: 'Active' }).lean();
    if (!c) return null;
    return { ...c, id: c._id, expiresAt: new Date(c.expiresAt).getTime() };
  }
  return mem().claims.find((c) => c.pin === String(pin) && c.status === 'Active') || null;
}

export async function redeemClaimRecord(claim) {
  const connected = await ensureDb();
  if (connected) {
    const { default: Claim } = await import('@/models/Claim.js');
    if (claim._id) {
      await Claim.updateOne({ _id: claim._id }, { $set: { status: 'Redeemed' } });
    } else {
      await Claim.updateOne({ pin: claim.pin }, { $set: { status: 'Redeemed' } });
    }
    return { ...claim, status: 'Redeemed' };
  }
  claim.status = 'Redeemed';
  return claim;
}

export async function claimSummary() {
  const connected = await ensureDb();
  let claims;
  if (connected) {
    const { default: Claim } = await import('@/models/Claim.js');
    claims = await Claim.find({}).lean();
    claims = claims.map((c) => ({ ...c, expiresAt: new Date(c.expiresAt).getTime() }));
  } else {
    claims = mem().claims;
  }
  return claims;
}

// ---- Merchant listings & price updates ----
export async function getListingsForStore(storeId) {
  const connected = await ensureDb();
  if (connected) {
    const { default: MerchantListing } = await import('@/models/MerchantListing.js');
    return MerchantListing.find({ storeId }).lean();
  }
  return mem().listings[storeId] || [];
}

export async function addListing({ storeId, productId, storeName, price, stock }) {
  const connected = await ensureDb();
  const payload = { storeId, productId, storeName, area: 'Local store', distance: 0.5, price, stock, rating: 5, walk: '6 min', updatedAt: new Date() };
  if (connected) {
    const { default: MerchantListing } = await import('@/models/MerchantListing.js');
    const exists = await MerchantListing.findOne({ storeId, productId }).lean();
    if (exists) {
      const e = new Error('This product is already listed.');
      e.status = 409;
      throw e;
    }
    await MerchantListing.create(payload);
    return payload;
  }
  const m = mem();
  m.listings[storeId] = m.listings[storeId] || [];
  if (m.listings[storeId].some((l) => l.productId === productId)) {
    const e = new Error('This product is already listed.');
    e.status = 409;
    throw e;
  }
  m.listings[storeId].push(payload);
  return payload;
}

export async function upsertPrice({ storeId, storeName, productId, price, stock }) {
  const connected = await ensureDb();
  if (connected) {
    const [{ default: MerchantListing }, { default: PriceUpdate }, { default: Product }] = await Promise.all([
      import('@/models/MerchantListing.js'),
      import('@/models/PriceUpdate.js'),
      import('@/models/Product.js'),
    ]);
    const dynamic = await MerchantListing.findOne({ storeId, productId });
    if (dynamic) {
      dynamic.price = price;
      dynamic.stock = stock;
      dynamic.updatedAt = new Date();
      await dynamic.save();
      return { price, stock, message: 'Price updated for nearby shoppers.' };
    }
    const product = await Product.findOne({ productId }).lean();
    const baseStore = product?.stores?.find((s) => s.storeId === storeId);
    if (!baseStore) {
      await MerchantListing.create({ storeId, productId, storeName, area: 'Local store', distance: 0.5, price, stock, rating: 5, walk: '6 min', updatedAt: new Date() });
      return { price, stock, message: 'Product published to nearby shoppers.' };
    }
    await PriceUpdate.updateOne(
      { key: `${productId}:${storeId}` },
      { $set: { productId, storeId, price, stock, updatedAt: new Date() } },
      { upsert: true }
    );
    return { price, stock, updatedAt: new Date().toISOString() };
  }
  const m = mem();
  const dynamic = (m.listings[storeId] || []).find((l) => l.productId === productId);
  if (dynamic) {
    dynamic.price = price;
    dynamic.stock = stock;
    dynamic.updatedAt = new Date().toISOString();
    return { price, stock, message: 'Price updated for nearby shoppers.' };
  }
  const product = INVENTORY.find((p) => p.id === productId);
  const baseStore = product?.stores.find((s) => s.id === storeId);
  if (!baseStore) {
    m.listings[storeId] = m.listings[storeId] || [];
    m.listings[storeId].push({ productId, storeName, area: 'Local store', distance: 0.5, price, stock, rating: 5, walk: '6 min', updatedAt: new Date().toISOString() });
    return { price, stock, message: 'Product published to nearby shoppers.' };
  }
  m.priceUpdates[`${productId}:${storeId}`] = { price, stock, updatedAt: new Date().toISOString() };
  return { price, stock, updatedAt: m.priceUpdates[`${productId}:${storeId}`].updatedAt };
}

export { hashPassword };
