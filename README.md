# FinMatch AI Platform

Monorepo gồm 2 project độc lập:

- `finmatch-web/` — Next.js/TypeScript/Tailwind frontend (giữ nguyên UI gốc)
- `finmatch-api/` — NestJS backend thật (Postgres, JWT auth, AI streaming, cron crawler)

## 🚀 Deploy lên Vercel (frontend) + Railway (backend)

Xem hướng dẫn từng bước đầy đủ tại **[`DEPLOY.md`](./DEPLOY.md)**.

Tóm tắt: Vercel chỉ host được phần frontend Next.js (serverless, không giữ
được kết nối Postgres/cron liên tục); backend NestJS cần một nơi chạy
container thường trực như Railway. `DEPLOY.md` hướng dẫn cả 2, kèm cách
nối chúng lại với nhau bằng biến môi trường.

Nếu chỉ muốn xem giao diện chạy ngay trên Vercel mà chưa cần backend thật,
để `NEXT_PUBLIC_USE_MOCK=true` — toàn bộ trang vẫn chạy đầy đủ với dữ liệu
mẫu.

## Chạy nhanh bằng Docker (local, không cần Vercel/Railway)

```bash
cp finmatch-api/.env.example finmatch-api/.env
# điền JWT_SECRET và ít nhất 1 AI API key (OPENAI_API_KEY/ANTHROPIC_API_KEY/GOOGLE_API_KEY)

docker compose up --build
```

- Web: http://localhost (qua Nginx) hoặc http://localhost:3000 trực tiếp
- API: http://localhost:3001/api
- Swagger: http://localhost:3001/api/docs

Chạy seed dữ liệu demo sau khi container `api` đã lên:

```bash
docker compose exec api npm run seed
```

Tài khoản admin demo: `admin@finmatch.vn` / `Admin@123`

## Chạy không dùng Docker

Xem README riêng trong từng thư mục `finmatch-web/README.md` và
`finmatch-api/README.md`.

## Đã xác thực chạy thật (không phải chỉ code tĩnh)

- Backend đã build + chạy thật với Postgres cài trực tiếp, test qua curl:
  đăng ký, đăng nhập, refresh token, role guard (403 đúng khi customer cố
  ghi dữ liệu), tạo/đọc sản phẩm, rate-history, và xử lý lỗi khi thiếu AI
  API key (trả JSON lỗi rõ ràng thay vì treo).
- Frontend build production sạch (`npm run build`), type-check sạch.
- Frontend nối vào backend bằng cách đổi `NEXT_PUBLIC_USE_MOCK=false` trong
  `finmatch-web/.env` — không cần sửa component nào vì toàn bộ data fetching
  đã tách qua `services/*.ts` từ đầu.

## Còn thiếu (xem chi tiết trong README từng project)

- Migrations DB, Redis cache thật, crawler giá vàng cần verify selector khi
  có mạng thật, Lead/CRM/Marketplace module, rate limiting/Helmet/CSRF,
  OAuth (Google/Facebook/Apple) + OTP, thanh toán (Stripe/VNPay/Momo/ZaloPay).
