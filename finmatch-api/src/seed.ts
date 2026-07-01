// Usage: npm run seed
// Seeds a few demo products and one admin user so the frontend has
// something to show without needing to click through the CMS first.
import { Client } from 'pg';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

async function main() {
  const client = new Client({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'finmatch',
  });
  await client.connect();

  const adminEmail = 'admin@finmatch.vn';
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  await client.query(
    `INSERT INTO users (id, email, "passwordHash", name, role)
     VALUES ($1, $2, $3, $4, 'admin')
     ON CONFLICT (email) DO NOTHING`,
    [randomUUID(), adminEmail, adminPasswordHash, 'Admin FinMatch'],
  );
  console.log(`Seeded admin user: ${adminEmail} / Admin@123`);

  const products = [
    ['loan', 'vcb', 'Vietcombank', 'Vay mua nhà lãi suất ưu đãi', 6.2, 200_000_000, 15_000_000_000, ['Ưu đãi năm đầu']],
    ['loan', 'tcb', 'Techcombank', 'Gói vay mua nhà Techcombank Dream', 6.5, 300_000_000, 20_000_000_000, ['Duyệt nhanh 24h']],
    ['card', 'mb', 'MB Bank', 'Thẻ tín dụng MB Hoàn Tiền', 2.5, 0, 200_000_000, ['Hoàn tiền 5%']],
    ['savings', 'vcb', 'Vietcombank', 'Tiết kiệm online kỳ hạn 12 tháng', 5.6, 1_000_000, 0, ['Lãi suất online']],
  ] as const;

  for (const [category, bankId, bankName, name, rate, min, max, tags] of products) {
    await client.query(
      `INSERT INTO products
        (id, category, "bankId", "bankName", name, "interestRate", "minAmount", "maxAmount", tags, "updatedBy")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'cms')`,
      [randomUUID(), category, bankId, bankName, name, rate, min, max, tags],
    );
  }
  console.log(`Seeded ${products.length} demo products`);

  await client.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
