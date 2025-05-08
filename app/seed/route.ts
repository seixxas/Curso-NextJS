import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Database seeding is now done via a separate script.' });
}