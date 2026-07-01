# Hướng dẫn deploy — Vercel (frontend) + Railway (backend)

## Vì sao tách 2 nơi?

Vercel chạy code dưới dạng serverless function — mỗi request khởi tạo và
tắt trong vài giây, không giữ được **kết nối Postgres liên tục** và
**không chạy được cron job** (`@nestjs/schedule` trong backend dùng để
tự động cập nhật giá vàng/tỷ giá/tin tức mỗi 30-60 phút). Next.js frontend
thì được sinh ra cho đúng mô hình này nên hợp Vercel 100%.

Railway (hoặc Render/Fly.io) chạy container thường trực — đúng thứ NestJS
+ Postgres + cron cần. Cách deploy (kết nối GitHub → auto-deploy khi push)
gần như giống hệt Vercel nên không phát sinh thêm quy trình mới phải học.

---

## Bước 0 — Đẩy code lên GitHub

Repo đã có sẵn `git init` + 1 commit. Bạn chỉ cần:

```bash
cd finmatch-platform
git remote add origin https://github.com/<username>/finmatch-platform.git
git branch -M main
git push -u origin main
```

---

## Bước 1 — Deploy backend lên Railway

1. Vào https://railway.app → **New Project** → **Deploy from GitHub repo**
   → chọn repo `finmatch-platform`.
2. Trong phần cấu hình project, đặt **Root Directory = `finmatch-api`**
   (Railway build đúng thư mục con này, dùng `Dockerfile` có sẵn).
3. **New → Database → PostgreSQL** trong cùng project — Railway tự tạo
   biến `DATABASE_URL`, `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`.
4. Vào tab **Variables** của service backend, thêm:
   ```
   DB_HOST=${{Postgres.PGHOST}}
   DB_PORT=${{Postgres.PGPORT}}
   DB_USER=${{Postgres.PGUSER}}
   DB_PASSWORD=${{Postgres.PGPASSWORD}}
   DB_NAME=${{Postgres.PGDATABASE}}
   JWT_SECRET=<chuỗi ngẫu nhiên dài, vd: openssl rand -hex 32>
   AI_PROVIDER=openai
   OPENAI_API_KEY=<key thật của bạn>
   NODE_ENV=production
   CORS_ORIGIN=https://<tên-project-của-bạn>.vercel.app
   PORT=3001
   ```
5. Deploy xong, Railway cấp domain dạng
   `https://finmatch-api-production.up.railway.app`. Test:
   `curl https://<domain>/api/products` → phải trả `[]` (chưa seed).
6. Seed dữ liệu demo (chạy 1 lần, qua Railway CLI hoặc tab Shell):
   ```bash
   railway run npm run seed
   ```

---

## Bước 2 — Deploy frontend lên Vercel

1. Vào https://vercel.com → **Add New → Project** → import repo
   `finmatch-platform`.
2. **Root Directory = `finmatch-web`** (bấm "Edit" ở bước import để chọn).
   Vercel tự nhận diện Next.js, không cần chỉnh build command.
3. Thêm **Environment Variables**:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://<domain-railway-của-bạn>/api
   NEXT_PUBLIC_USE_MOCK=false
   ```
   → Nếu bạn muốn xem giao diện chạy ngay **trước khi** có backend, cứ để
   `NEXT_PUBLIC_USE_MOCK=true` (mặc định) — toàn bộ trang vẫn hiển thị đầy
   đủ với dữ liệu mẫu, không lỗi.
4. Bấm **Deploy**. Xong, bạn có domain dạng
   `https://finmatch-web.vercel.app`.

---

## Bước 3 — Nối 2 chiều

Quay lại Railway → cập nhật biến `CORS_ORIGIN` của backend thành đúng
domain Vercel vừa nhận được (Bước 2.4), để trình duyệt không bị chặn CORS
khi frontend gọi API. Railway sẽ tự redeploy khi bạn lưu biến môi trường.

---

## Kiểm tra sau khi deploy

- `https://<domain-vercel>` load được, trang chủ hiển thị lãi suất/tin tức
- `https://<domain-vercel>/ai` chat được (cần `OPENAI_API_KEY` thật ở Railway)
- `https://<domain-railway>/api/docs` mở được Swagger

## Nếu chưa muốn trả tiền AI provider ngay

Để `NEXT_PUBLIC_USE_MOCK=true` ở Vercel — site chạy đầy đủ giao diện +
chat AI giả lập (không tốn phí), bạn bật `false` khi nào sẵn sàng dùng
API key thật.
