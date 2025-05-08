import { NextResponse } from 'next/server';
import { main } from '../../scripts/seed-database';

export async function GET() {
  try {
    await main();
    return NextResponse.json({ message: 'Database seeded successfully.' });
  } catch (error) {
    console.error('Database seeding failed:', error);
    return NextResponse.json({ error: 'Failed to seed database.' }, { status: 500 });
  }
}