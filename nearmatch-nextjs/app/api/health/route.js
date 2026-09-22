import { NextResponse } from 'next/server';
import { dbConnect, isDbConnected } from '@/lib/db';

export async function GET() {
  await dbConnect();
  if (isDbConnected()) {
    return NextResponse.json({ connected: true, database: 'mongodb', message: 'MongoDB is connected.' });
  }
  return NextResponse.json(
    { connected: false, database: 'memory', message: 'MONGODB_URI is not configured or unreachable. Running with in-memory fallback.' },
    { status: 503 }
  );
}
export const dynamic = 'force-dynamic';
