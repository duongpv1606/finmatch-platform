// Usage: npm run seed:loans
// Seeds real "vay tiêu dùng" (personal loan) products supplied by the
// project owner. Logos are intentionally left blank — to be uploaded
// later via Admin → Sản phẩm → Sửa → Logo ngân hàng.
//
// Rate note: banks list annual rates already. Consumer-finance companies
// (FE Credit, Home Credit, HD SAISON, Mcredit, Mirae Asset) publish
// MONTHLY rates instead — converted here to an annual-equivalent
// (monthly × 12, the standard simple approximation used in VN finance
// marketing, not true compounded APR) so every product sorts/compares
// consistently on one field. The original monthly figure is preserved
// in the product's tags for transparency.
import { Client } from 'pg';
import { randomUUID } from 'crypto';

interface LoanRow {
  bankId: string;
  bankName: string;
  maxAmountTrieu: number;
  rateLabel: string; // as given by the user, for the tag
  annualRate: number; // normalized %/year used for sorting/filtering
  termMonths: number;
}

const ROWS: LoanRow[] = [
  { bankId: 'tpbank', bankName: 'TPBank', maxAmountTrieu: 500, rateLabel: 'từ 8,7%/năm', annualRate: 8.7, termMonths: 60 },
  { bankId: 'vpbank', bankName: 'VPBank', maxAmountTrieu: 500, rateLabel: 'từ 14%/năm', annualRate: 14, termMonths: 60 },
  { bankId: 'mb', bankName: 'MB Bank', maxAmountTrieu: 500, rateLabel: 'từ 7,5%/năm', annualRate: 7.5, termMonths: 60 },
  { bankId: 'techcombank', bankName: 'Techcombank', maxAmountTrieu: 300, rateLabel: 'từ 10,5%/năm', annualRate: 10.5, termMonths: 60 },
  { bankId: 'vib', bankName: 'VIB', maxAmountTrieu: 600, rateLabel: 'từ 7,9%/năm', annualRate: 7.9, termMonths: 60 },
  { bankId: 'acb', bankName: 'ACB', maxAmountTrieu: 500, rateLabel: 'từ 9,8%/năm', annualRate: 9.8, termMonths: 60 },
  { bankId: 'hdbank', bankName: 'HDBank', maxAmountTrieu: 500, rateLabel: 'từ 13%/năm', annualRate: 13, termMonths: 60 },
  { bankId: 'sacombank', bankName: 'Sacombank', maxAmountTrieu: 500, rateLabel: 'từ 9,6%/năm', annualRate: 9.6, termMonths: 60 },
  { bankId: 'shb', bankName: 'SHB', maxAmountTrieu: 500, rateLabel: 'từ 8,5%/năm', annualRate: 8.5, termMonths: 60 },
  { bankId: 'lpbank', bankName: 'LPBank', maxAmountTrieu: 500, rateLabel: 'từ 8,5%/năm', annualRate: 8.5, termMonths: 60 },
  { bankId: 'fe-credit', bankName: 'FE Credit', maxAmountTrieu: 200, rateLabel: 'từ 1,75%/tháng', annualRate: 21, termMonths: 36 },
  { bankId: 'home-credit', bankName: 'Home Credit', maxAmountTrieu: 250, rateLabel: 'từ 0,75%/tháng', annualRate: 9, termMonths: 57 },
  { bankId: 'hd-saison', bankName: 'HD SAISON', maxAmountTrieu: 300, rateLabel: 'từ 0,67%/tháng', annualRate: 8.04, termMonths: 60 },
  { bankId: 'mcredit', bankName: 'Mcredit', maxAmountTrieu: 300, rateLabel: 'từ 1,39%/tháng', annualRate: 16.68, termMonths: 60 },
  { bankId: 'mirae-asset', bankName: 'Mirae Asset Finance Vietnam', maxAmountTrieu: 500, rateLabel: 'từ 1,58%/tháng', annualRate: 18.96, termMonths: 60 },
];

async function main() {
  // `railway run` injects DB_HOST as Railway's *internal* hostname
  // (postgres.railway.internal), which only resolves inside Railway's own
  // network — not from a local machine. Support DATABASE_URL (the public
  // connection string, from Postgres service → Variables →
  // DATABASE_PUBLIC_URL in Railway) as an override so this script also
  // works when run locally against production.
  const client = process.env.DATABASE_URL
    ? new Client({ connectionString: process.env.DATABASE_URL })
    : new Client({
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 5432),
        user: process.env.DB_USER ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
        database: process.env.DB_NAME ?? 'finmatch',
      });
  await client.connect();

  let inserted = 0;
  for (const row of ROWS) {
    // Skip if this bank+name combo already exists, so re-running the
    // script (e.g. after fixing a typo) doesn't create duplicates.
    const existing = await client.query(
      `SELECT id FROM products WHERE "bankId" = $1 AND category = 'loan' AND name = $2`,
      [row.bankId, 'Vay tiêu dùng'],
    );
    if ((existing.rowCount ?? 0) > 0) {
      console.log(`Bỏ qua (đã có): ${row.bankName}`);
      continue;
    }

    await client.query(
      `INSERT INTO products
        (id, category, "bankId", "bankName", name, "interestRate", "minAmount", "maxAmount", "termMonths", tags, "updatedBy")
       VALUES ($1,'loan',$2,$3,'Vay tiêu dùng',$4,$5,$6,$7,$8,'cms')`,
      [
        randomUUID(),
        row.bankId,
        row.bankName,
        row.annualRate,
        10_000_000, // minAmount not specified by source — default 10 triệu
        row.maxAmountTrieu * 1_000_000,
        row.termMonths,
        [row.rateLabel],
      ],
    );
    inserted++;
    console.log(`Đã thêm: ${row.bankName} — ${row.rateLabel} (quy đổi ${row.annualRate}%/năm)`);
  }

  console.log(`\nHoàn tất: thêm ${inserted}/${ROWS.length} tổ chức tài chính.`);
  console.log('Logo chưa có — vào Admin → Sản phẩm → Sửa từng dòng để upload logo.');
  await client.end();
}

main().catch((err) => {
  console.error('Seed thất bại:', err);
  process.exit(1);
});
