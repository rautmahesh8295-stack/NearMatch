import { NextResponse } from 'next/server';
import { getMarket } from '@/lib/store';
import { authMerchant } from '@/lib/auth';
import { INVENTORY } from '@/lib/seed-data';

export async function GET(req) {
  const merchant = authMerchant(req);
  if (!merchant) {
    return NextResponse.json({ error: 'Please sign in to access this store.' }, { status: 401 });
  }
  const market = await getMarket();
  const items = market.flatMap((product) =>
    product.stores
      .filter((s) => (s.storeId || s.id) === merchant.storeId)
      .map((store) => ({
        productId: product.id,
        product: product.name,
        brand: product.brand,
        image: product.image,
        ...store,
      }))
  );
  if (!items.length) {
    return NextResponse.json(
      INVENTORY.map((p) => ({
        productId: p.id,
        product: p.name,
        brand: p.brand,
        image: p.image,
        price: p.online,
        stock: 'Out of stock',
        id: merchant.storeId,
        storeId: merchant.storeId,
      }))
    );
  }
  return NextResponse.json(items);
}

export const dynamic = 'force-dynamic';
