import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nearmatch-dev-secret-change-me';
const TOKEN_TTL = 1000 * 60 * 60 * 12; // 12h

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(String(password), salt, 64).toString('hex')}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) {
    // Legacy unsalted hash from the original prototype (salt = 'nearmatch').
    const digest = stored || '';
    const candidate = crypto.scryptSync(String(password || ''), 'nearmatch', 64).toString('hex');
    return candidate.length === digest.length && crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(digest));
  }
  const [salt, digest] = stored.split(':');
  const candidate = crypto.scryptSync(String(password || ''), salt, 64).toString('hex');
  return candidate.length === digest.length && crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(digest));
}

export function signMerchantToken(merchant) {
  return jwt.sign(
    { kind: 'merchant', userId: merchant.userId, email: merchant.email, storeId: merchant.storeId, storeName: merchant.storeName, name: merchant.name },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
}

export function signAdminToken(email) {
  return jwt.sign({ kind: 'admin', email }, JWT_SECRET, { expiresIn: '12h' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function getBearerToken(req) {
  const header = req.headers.get('authorization') || '';
  return header.replace(/^Bearer\s+/i, '').trim();
}

export function authMerchant(req) {
  const payload = verifyToken(getBearerToken(req));
  if (!payload || payload.kind !== 'merchant') return null;
  return payload;
}

export function authAdmin(req) {
  const payload = verifyToken(getBearerToken(req));
  if (!payload || payload.kind !== 'admin') return null;
  return payload;
}

export { TOKEN_TTL };
