import { NextResponse } from 'next/server';
import { getMarket, upsertPrice } from '@/lib/store';
import { authMerchant } from '@/lib/auth';

export async function PUT(req) {
  const merchant = authMerchant(req);
  if (!merchant) {
    return NextResponse.json({ error: 'Please sign in to update prices.' }, { status: 401 });
  }
  const { productId, storeId, price: rawPrice, stock } = await req.json().catch(() => ({}));
  if (storeId !== merchant.storeId) {
    return NextResponse.json({ error: 'You can only update your own store.' }, { status: 403 });
  }
  const price = Number(rawPrice);
  if (!productId || !Number.isInteger(price) || price < 1) {
    return NextResponse.json({ error: 'Enter a valid whole-number price.' }, { status: 400 });
  }
  const stockValue = ['In stock', 'Only 2 left', 'Out of stock'].includes(stock) ? stock : 'In stock';
  const market = await getMarket();
  const exists = market.some((p) => p.id === productId);
  if (!exists) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }
  const result = await upsertPrice({ storeId: merchant.storeId, storeName: merchant.storeName, productId, price, stock: stockValue });
  return NextResponse.json(result);
}

export const dynamic = 'force-dynamic';
