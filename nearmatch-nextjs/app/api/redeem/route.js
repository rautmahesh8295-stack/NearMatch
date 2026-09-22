import { NextResponse } from 'next/server';
import { findActiveClaimByPin, redeemClaimRecord } from '@/lib/store';
import { authMerchant } from '@/lib/auth';

export async function POST(req) {
  const merchant = authMerchant(req);
  if (!merchant) {
    return NextResponse.json({ error: 'Please sign in to verify a customer deal.' }, { status: 401 });
  }
  const { pin } = await req.json().catch(() => ({}));
  const claim = await findActiveClaimByPin(pin);
  if (!claim) {
    return NextResponse.json({ error: 'No active deal found for that PIN.' }, { status: 404 });
  }
  if (claim.storeId !== merchant.storeId) {
    return NextResponse.json({ error: 'This deal belongs to another store.' }, { status: 403 });
  }
  if (claim.expiresAt < Date.now()) {
    return NextResponse.json({ error: 'This deal has expired.' }, { status: 410 });
  }
  const redeemed = await redeemClaimRecord(claim);
  return NextResponse.json({ message: 'Deal verified. Footfall recorded.', claim: redeemed });
}

export const dynamic = 'force-dynamic';
