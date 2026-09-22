import { NextResponse } from 'next/server';
import { getMarket, createClaimRecord } from '@/lib/store';

export async function POST(req) {
  const { productId, storeId } = await req.json().catch(() => ({}));
  const market = await getMarket();
  const product = market.find((p) => p.id === productId || p.productId === productId);
  const store = product?.stores.find((s) => (s.storeId || s.id) === storeId);
  if (!store) {
    return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
  }
  const claim = await createClaimRecord({
    productId: product.id,
    storeId: store.storeId || store.id,
    product: product.name,
    store: store.name,
    price: store.price,
  });
  return NextResponse.json(claim, { status: 201 });
}

export const dynamic = 'force-dynamic';
