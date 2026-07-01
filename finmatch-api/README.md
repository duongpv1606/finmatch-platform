# FinMatch API (NestJS)

Backend thật cho FinMatch AI — thay thế toàn bộ mock trong `finmatch-web`.

## Đã dựng

- **Auth**: đăng ký/đăng nhập bằng email+password, JWT access token (15 phút)
  + refresh token (30 ngày, hash lưu DB), guard theo role
  (`customer/sale/agency/bank/admin/super_admin`)
- **Products**: CRUD sản phẩm tài chính (vay/thẻ/bảo hiểm/đầu tư/tiết kiệm),
  đọc công khai — ghi chỉ role `admin/super_admin/bank`. Endpoint
  `rate-history` cho biểu đồ lãi suất.
- **Market**: bảng `gold_prices`, `exchange_rates`, `news_articles` +
  cron job (NestJS `@Cron`) tự refresh — gold mỗi 30 phút, tỷ giá/tin tức
  mỗi giờ. Đọc luôn từ DB nên endpoint không bao giờ bị chậm/treo dù
  crawler bên ngoài lỗi.
- **AI Chat**: streaming thật (plain text chunk, khớp với
  `services/aiChatService.ts` ở frontend), pluggable OpenAI/Anthropic/Gemini
  qua `AI_PROVIDER` trong `.env`, lưu lịch sử chat vào bảng `chat_messages`.
- **Swagger**: `GET /api/docs`
- Đã test thật với Postgres: đăng ký/login/refresh, role guard (403 đúng khi
  customer cố tạo sản phẩm), tạo/đọc sản phẩm, rate-history, xử lý lỗi khi
  thiếu AI API key.

## Chạy local (không cần Docker)

```bash
# 1. Có sẵn Postgres chạy ở localhost:5432, tạo database "finmatch"
cp .env.example .env   # rồi điền JWT_SECRET, OPENAI_API_KEY...
npm install
npm run seed            # tạo admin@finmatch.vn / Admin@123 + 4 sản phẩm demo
npm run start:dev
```

API chạy ở `http://localhost:3001/api`, Swagger ở `/api/docs`.

## Chạy qua Docker (khuyến nghị)

Xem `docker-compose.yml` ở thư mục gốc `finmatch-platform/` — khởi động
Postgres + Redis + API + Web + Nginx cùng lúc.

## Việc còn thiếu / cần làm tiếp trước khi lên production thật

1. **Migrations thay vì `synchronize: true`** — hiện dùng
   `synchronize: true` cho tiện dev; trước production phải chuyển sang
   `typeorm migration:generate` để tránh mất dữ liệu khi đổi schema.
2. **Crawler giá vàng thật** — `market.service.ts` có khung crawler SJC với
   TODO rõ ràng: cần verify lại selector CSS thật trên trang SJC (giao diện
   web có thể đã đổi), rồi làm tương tự cho DOJI/PNJ.
3. **RSS tin tức** — URL feed CafeF/VnEconomy trong `market.service.ts` là
   feed công khai chuẩn, nhưng cần chạy thử trong môi trường có internet để
   xác nhận đường dẫn hiện tại còn hoạt động (feed có thể đổi URL).
4. **Redis cache** — đã cài `ioredis`/`cache-manager` nhưng chưa gắn vào
   endpoint nào; nên cache `GET /products`, `/market/*` để giảm tải DB.
5. **Lead/CRM/Marketplace module** — chưa có, cần cho các trang dashboard
   phía frontend (`/dashboard/*`).
6. **Rate limiting, Helmet, CSRF** — chưa cấu hình, cần trước khi public.
7. **Google/Facebook/Apple OAuth, OTP** — auth hiện chỉ có email+password.

## Cấu trúc

```
src/
  auth/       # JWT, guards, roles
  users/      # User entity + repository
  products/   # CRUD sản phẩm tài chính
  market/     # gold/fx/news + cron crawler
  ai/         # streaming chat, đa provider
  common/     # guards & decorators dùng chung
  seed.ts     # script tạo dữ liệu demo
```
