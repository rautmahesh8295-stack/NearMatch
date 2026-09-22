import { NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/store';
import { verifyPassword, signMerchantToken } from '@/lib/auth';

export async function POST(req) {
  const { email, password } = await req.json().catch(() => ({}));
  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
  }
  const merchant = {
    userId: String(user._id || user.id),
    name: user.name,
    email: user.email,
    storeId: user.storeId,
    storeName: user.storeName,
  };
  const token = signMerchantToken(merchant);
  return NextResponse.json({ token, merchant });
}

export const dynamic = 'force-dynamic';
