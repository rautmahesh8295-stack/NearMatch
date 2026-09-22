import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { findUserByEmail, createUser } from '@/lib/store';
import { hashPassword, signMerchantToken } from '@/lib/auth';

export async function POST(req) {
  const { name, email, password, storeName } = await req.json().catch(() => ({}));
  if (!name || !storeName || !email || !String(email).includes('@') || String(password || '').length < 8) {
    return NextResponse.json(
      { error: 'Enter your name, store name, valid email, and a password of at least 8 characters.' },
      { status: 400 }
    );
  }
  const existing = await findUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
  }
  const user = await createUser({
    name: String(name).trim(),
    email: String(email).trim(),
    passwordHash: hashPassword(String(password)),
    storeId: `store-${crypto.randomUUID()}`,
    storeName: String(storeName).trim(),
  });
  const merchant = {
    userId: String(user._id || user.id),
    name: user.name,
    email: user.email,
    storeId: user.storeId,
    storeName: user.storeName,
  };
  return NextResponse.json({ token: signMerchantToken(merchant), merchant }, { status: 201 });
}

export const dynamic = 'force-dynamic';
