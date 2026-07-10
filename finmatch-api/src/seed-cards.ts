// Usage: npm run seed:cards
// Seeds real credit card products supplied by the project owner.
//
// Logo handling: if a product with the SAME bankId already has a
// bankLogoUrl set (e.g. from the loan products seeded earlier and then
// manually uploaded via Admin), this script copies that logo onto the new
// card product automatically — no need to re-upload per product. Banks
// with no existing logo just show initials until you upload one via
// Admin → Sửa → Logo ngân hàng, same as before.
//
// "Hạn mức" (credit limit) was given as a tier (Trung bình/Cao/Rất cao),
// not an exact VND figure — mapped to an approximate representative range
// below, clearly documented so it's easy to correct once you have exact
// numbers per card.
// Reads a local .env file automatically (create one with DATABASE_URL set
// to your Railway Postgres public connection string — see .env.example —
// so you never have to type `set DATABASE_URL=...` before every run).
import 'dotenv/config';
import { Client } from 'pg';
import { randomUUID } from 'crypto';

interface CardRow {
  bankId: string;
  bankName: string;
  cardName: string;
  cashbackMaxPct: number;
  cashbackLabel: string; // original text, kept verbatim in tags
  feeLabel: string;
  limitTier: 'trung_binh_cao' | 'cao' | 'rat_cao';
}

const LIMIT_TIER_RANGE: Record<CardRow['limitTier'], [number, number]> = {
  trung_binh_cao: [50_000_000, 300_000_000],
  cao: [100_000_000, 500_000_000],
  rat_cao: [200_000_000, 1_000_000_000],
};
const LIMIT_TIER_LABEL: Record<CardRow['limitTier'], string> = {
  trung_binh_cao: 'Hạn mức: Trung bình - Cao',
  cao: 'Hạn mức: Cao',
  rat_cao: 'Hạn mức: Rất cao',
};

const ROWS: CardRow[] = [
  { bankId: 'tpbank', bankName: 'TPBank', cardName: 'TPBank EVO Visa', cashbackMaxPct: 10, cashbackLabel: 'Hoàn tiền đến 10% online', feeLabel: 'Phí TN 495.000đ (thường miễn năm đầu)', limitTier: 'rat_cao' },
  { bankId: 'vib', bankName: 'VIB', cardName: 'VIB Cash Back', cashbackMaxPct: 6, cashbackLabel: 'Hoàn tiền đến 6%', feeLabel: 'Phí TN 499.000đ', limitTier: 'rat_cao' },
  { bankId: 'vpbank', bankName: 'VPBank', cardName: 'VPBank StepUp', cashbackMaxPct: 15, cashbackLabel: 'Hoàn tiền đến 15% theo danh mục', feeLabel: 'Phí TN 499.000đ', limitTier: 'cao' },
  { bankId: 'techcombank', bankName: 'Techcombank', cardName: 'Techcombank Visa Cashback', cashbackMaxPct: 3, cashbackLabel: 'Hoàn tiền 1–3%', feeLabel: 'Miễn hoặc hoàn phí theo điều kiện', limitTier: 'cao' },
  { bankId: 'bidv', bankName: 'BIDV', cardName: 'BIDV Visa Flexi', cashbackMaxPct: 2, cashbackLabel: 'Hoàn tiền 2% mọi chi tiêu', feeLabel: 'Phí TN 300.000đ', limitTier: 'cao' },
  { bankId: 'mb', bankName: 'MB Bank', cardName: 'MB Visa Sakura', cashbackMaxPct: 5, cashbackLabel: 'Hoàn tiền đến 5%', feeLabel: 'Phí TN 399.000đ', limitTier: 'cao' },
  { bankId: 'hsbc', bankName: 'HSBC', cardName: 'HSBC Live+', cashbackMaxPct: 8, cashbackLabel: 'Hoàn tiền đến 8% ăn uống, mua sắm', feeLabel: 'Phí TN ~800.000đ', limitTier: 'cao' },
  { bankId: 'acb', bankName: 'ACB', cardName: 'ACB Visa Platinum', cashbackMaxPct: 2, cashbackLabel: 'Tích điểm + hoàn tiền (không nêu % cụ thể — tạm để 2%, cần bạn xác nhận lại)', feeLabel: 'Phí TN 899.000đ', limitTier: 'rat_cao' },
  { bankId: 'sacombank', bankName: 'Sacombank', cardName: 'Sacombank Cashback Platinum', cashbackMaxPct: 5, cashbackLabel: 'Hoàn tiền đến 5%', feeLabel: 'Phí TN khoảng 499.000đ', limitTier: 'cao' },
  { bankId: 'ocb', bankName: 'OCB', cardName: 'OCB iGen / OCB Cashback', cashbackMaxPct: 5, cashbackLabel: 'Hoàn tiền 1–5%', feeLabel: 'Miễn hoặc phí thấp', limitTier: 'trung_binh_cao' },
];

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

  let inserted = 0;
  let logosLinked = 0;

  for (const row of ROWS) {
    const existing = await client.query(
      `SELECT id FROM products WHERE "bankId" = $1 AND category = 'card' AND name = $2`,
      [row.bankId, row.cardName],
    );
    if ((existing.rowCount ?? 0) > 0) {
      console.log(`Bỏ qua (đã có): ${row.cardName}`);
      continue;
    }

    // Auto-inherit an existing logo from any other product of the same bank.
    const logoResult = await client.query(
      `SELECT "bankLogoUrl" FROM products WHERE "bankId" = $1 AND "bankLogoUrl" IS NOT NULL LIMIT 1`,
      [row.bankId],
    );
    const bankLogoUrl: string | null = logoResult.rows[0]?.bankLogoUrl ?? null;
    if (bankLogoUrl) logosLinked++;

    const [minAmount, maxAmount] = LIMIT_TIER_RANGE[row.limitTier];

    await client.query(
      `INSERT INTO products
        (id, category, "bankId", "bankName", "bankLogoUrl", name, "interestRate", "minAmount", "maxAmount", tags, "updatedBy")
       VALUES ($1,'card',$2,$3,$4,$5,$6,$7,$8,$9,'cms')`,
      [
        randomUUID(),
        row.bankId,
        row.bankName,
        bankLogoUrl,
        row.cardName,
        row.cashbackMaxPct,
        minAmount,
        maxAmount,
        [row.cashbackLabel, row.feeLabel, LIMIT_TIER_LABEL[row.limitTier]],
      ],
    );
    inserted++;
    console.log(
      `Đã thêm: ${row.cardName}${bankLogoUrl ? ' (đã tự gắn logo có sẵn)' : ' (chưa có logo — upload qua Admin)'}`,
    );
  }

  console.log(`\nHoàn tất: thêm ${inserted}/${ROWS.length} thẻ tín dụng, tự gắn logo cho ${logosLinked} thẻ.`);
  console.log('Lưu ý: "Lãi suất" hiển thị trên các thẻ này thực chất là % hoàn tiền tối đa, không phải lãi suất trả chậm.');
  console.log('Hạn mức đang là khoảng ước lượng theo tier (Trung bình/Cao/Rất cao) — sửa lại số chính xác qua Admin nếu có.');
  await client.end();
}

main().catch((err) => {
  console.error('Seed thất bại:', err);
  process.exit(1);
});
