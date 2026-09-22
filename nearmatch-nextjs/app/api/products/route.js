import { NextResponse } from 'next/server';
import { searchMarket } from '@/lib/store';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get('q') || '';
    const lat = Number(url.searchParams.get('lat'));
    const lng = Number(url.searchParams.get('lng'));
    const products = await searchMarket(q, lat, lng);
    return NextResponse.json(products, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Could not load products' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
