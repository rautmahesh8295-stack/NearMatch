import { NextResponse } from 'next/server';
import { PLATFORM_FEE } from '@/lib/seed-data';
import { authAdmin } from '@/lib/auth';
import { claimSummary } from '@/lib/store';

export async function GET(req) {
  const admin = authAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'Admin sign-in required.' }, { status: 401 });
  }
  const claims = await claimSummary();
  const redeemed = claims.filter((c) => c.status === 'Redeemed');
  const active = claims.filter((c) => c.status === 'Active' && c.expiresAt > Date.now());
  const byMerchant = {};
  redeemed.forEach((c) => {
    byMerchant[c.store] = (byMerchant[c.store] || 0) + 1;
  });
  return NextResponse.json({
    platformFee: PLATFORM_FEE,
    redeemedDeals: redeemed.length,
    activeClaims: active.length,
    totalEarnings: redeemed.length * PLATFORM_FEE,
    merchants: Object.entries(byMerchant).map(([merchant, deals]) => ({ merchant, deals, earnings: deals * PLATFORM_FEE })),
  });
}

export const dynamic = 'force-dynamic';
