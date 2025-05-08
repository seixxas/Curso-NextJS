import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function GET() {
  try {
    if (process.env.NODE_ENV === 'development') {
      await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL
        );
      `;

      const insertedUsers = await Promise.all(
        users.map(async (user) => {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          return sql`
            INSERT INTO users (id, name, email, password)
            VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
            ON CONFLICT (id) DO NOTHING;
          `;
        }),
      );

      await sql`
        CREATE TABLE IF NOT EXISTS invoices (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          customer_id UUID NOT NULL,
          amount INT NOT NULL,
          status VARCHAR(255) NOT NULL,
          date DATE NOT NULL
        );
      `;
      // ... (código para seedInvoices)

      await sql`
        CREATE TABLE IF NOT EXISTS customers (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          image_url VARCHAR(255) NOT NULL
        );
      `;
      // ... (código para seedCustomers)

      await sql`
        CREATE TABLE IF NOT EXISTS revenue (
          month VARCHAR(4) NOT NULL UNIQUE,
          revenue INT NOT NULL
        );
      `;
      // ... (código para seedRevenue)

      return NextResponse.json({ message: 'Database seeded successfully (dev only).' });
    } else {
      return NextResponse.json({ message: 'Seeding not active in production.' });
    }
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: 'Failed to seed database.' }, { status: 500 });
  } finally {
    await sql.end();
  }
}