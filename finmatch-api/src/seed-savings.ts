// Usage: npx ts-node src/seed-savings.ts  (or npm run seed:savings)
// Seeds real savings (tiết kiệm) products supplied by the project owner —
// 12-month reference rates. Auto-inherits bank logo from any existing
// product of the same bankId (same pattern as seed-cards.ts).
//
// Rate note: some banks were given as a range (e.g. "7,0–7,5%/năm") — the
// midpoint is used as the sortable "interestRate" field, with the exact
// original range text preserved in tags so nothing is lost.
import 'dotenv/config';
import { Client } from 'pg';
import { randomUUID } from 'crypto';

interface SavingsRow {
  bankId: string;
  bankName: string;
  rateLabel: string; // original text, kept verbatim in tags
  representativeRate: number; // midpoint of range, or the single figure given
}

const ROWS: SavingsRow[] = [
  { bankId: 'cake', bankName: 'Cake by VPBank', rateLabel: '7,4%/năm', representativeRate: 7.4 },
  { bankId: 'shinhan', bankName: 'Shinhan Bank', rateLabel: '7,0–7,5%/năm', representativeRate: 7.25 },
  { bankId: 'vib', bankName: 'VIB', rateLabel: 'Khoảng 7,0%/năm', representativeRate: 7.0 },
  { bankId: 'ocb', bankName: 'OCB', rateLabel: '6,9–7,0%/năm', representativeRate: 6.95 },
  { bankId: 'bac-a-bank', bankName: 'Bac A Bank', rateLabel: 'Khoảng 6,8–6,9%/năm', representativeRate: 6.85 },
  { bankId: 'hdbank', bankName: 'HDBank', rateLabel: 'Khoảng 6,7–6,9%/năm', representativeRate: 6.8 },
];

// Savings accounts typically have a low practical minimum and no real
// ceiling — approximated here, correct exact figures via Admin if needed.
const MIN_AMOUNT = 1_000_000;
const MAX_AMOUNT = 10_000_000_000;
const TERM_MONTHS = 12;

async function main() {
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

  const productName = 'Tiết kiệm online kỳ hạn 12 tháng';
  let inserted = 0;
  let logosLinked = 0;

  for (const row of ROWS) {
    const existing = await client.query(
      `SELECT id FROM products WHERE "bankId" = $1 AND category = 'savings' AND name = $2`,
      [row.bankId, productName],
    );
    if ((existing.rowCount ?? 0) > 0) {
      console.log(`Bỏ qua (đã có): ${row.bankName}`);
      continue;
    }

    const logoResult = await client.query(
      `SELECT "bankLogoUrl" FROM products WHERE "bankId" = $1 AND "bankLogoUrl" IS NOT NULL LIMIT 1`,
      [row.bankId],
    );
    const bankLogoUrl: string | null = logoResult.rows[0]?.bankLogoUrl ?? null;
    if (bankLogoUrl) logosLinked++;

    await client.query(
      `INSERT INTO products
        (id, category, "bankId", "bankName", "bankLogoUrl", name, "interestRate", "minAmount", "maxAmount", "termMonths", tags, "updatedBy")
       VALUES ($1,'savings',$2,$3,$4,$5,$6,$7,$8,$9,$10,'cms')`,
      [
        randomUUID(),
        row.bankId,
        row.bankName,
        bankLogoUrl,
        productName,
        row.representativeRate,
        MIN_AMOUNT,
        MAX_AMOUNT,
        TERM_MONTHS,
        [row.rateLabel, 'Kỳ hạn 12 tháng'],
      ],
    );
    inserted++;
    console.log(
      `Đã thêm: ${row.bankName} — ${row.rateLabel}${bankLogoUrl ? ' (đã tự gắn logo có sẵn)' : ' (chưa có logo — upload qua Admin)'}`,
    );
  }

  console.log(`\nHoàn tất: thêm ${inserted}/${ROWS.length} ngân hàng, tự gắn logo cho ${logosLinked}.`);
  console.log('Lưu ý: các mức lãi suất cho theo khoảng đã quy đổi về giá trị trung bình để sắp xếp — sửa lại số chính xác qua Admin nếu có.');
  console.log('Hạn mức tối thiểu/tối đa đang là ước lượng chung — chưa có số thật theo từng ngân hàng.');
  await client.end();
}

main().catch((err) => {
  console.error('Seed thất bại:', err);
  process.exit(1);
});
