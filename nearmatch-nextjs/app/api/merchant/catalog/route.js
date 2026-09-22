import { NextResponse } from 'next/server';
import { getMarket, getListingsForStore, addListing } from '@/lib/store';
import { authMerchant } from '@/lib/auth';

export async function GET(req) {
  const merchant = authMerchant(req);
  if (!merchant) {
    return NextResponse.json({ error: 'Please sign in to access the catalog.' }, { status: 401 });
  }
  const listed = new Set((await getListingsForStore(merchant.storeId)).map((l) => l.productId));
  const market = await getMarket();
  return NextResponse.json(
    market.map((p) => ({
      productId: p.id,
      product: p.name,
      brand: p.brand,
      image: p.image,
      category: p.category,
      listed: listed.has(p.id),
    }))
  );
}

export async function POST(req) {
  const merchant = authMerchant(req);
  if (!merchant) {
    return NextResponse.json({ error: 'Please sign in to publish a listing.' }, { status: 401 });
  }
  const { productId, price: rawPrice, stock } = await req.json().catch(() => ({}));
  const market = await getMarket();
  const product = market.find((p) => p.id === productId);
  const price = Number(rawPrice);
  if (!product || !Number.isInteger(price) || price < 1) {
    return NextResponse.json({ error: 'Choose a product and enter a valid price.' }, { status: 400 });
  }
  const stockValue = ['In stock', 'Only 2 left', 'Out of stock'].includes(stock) ? stock : 'In stock';
  try {
    await addListing({ storeId: merchant.storeId, productId: product.id, storeName: merchant.storeName, price, stock: stockValue });
    return NextResponse.json({ message: 'Product published to nearby shoppers.' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}

export const dynamic = 'force-dynamic';
