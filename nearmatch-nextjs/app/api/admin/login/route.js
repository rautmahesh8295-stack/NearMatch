import { NextResponse } from 'next/server';
import { ADMIN_CREDENTIALS, PLATFORM_FEE } from '@/lib/seed-data';
import { signAdminToken, authAdmin } from '@/lib/auth';
import { claimSummary } from '@/lib/store';

export async function POST(req) {
  const { email, password } = await req.json().catch(() => ({}));
  if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
    return NextResponse.json({ error: 'Admin email or password is incorrect.' }, { status: 401 });
  }
  return NextResponse.json({ token: signAdminToken(email), owner: { email } });
}

export async function summaryHandler(req) {
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

export { PLATFORM_FEE };

export const dynamic = 'force-dynamic';
