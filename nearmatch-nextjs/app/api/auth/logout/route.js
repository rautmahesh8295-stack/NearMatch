import { NextResponse } from 'next/server';

// JWTs are stateless — logout is handled client-side by discarding the token.
// This endpoint exists for API compatibility with the original prototype.
export async function POST() {
  return NextResponse.json({ message: 'Signed out.' });
}

export const dynamic = 'force-dynamic';
