# FinMatch AI — Web (Giai đoạn 1: Frontend component hoá)

Đây là bản khởi tạo Next.js/TypeScript/Tailwind chuyển đổi từ file HTML demo
`finmatch-ai-v5.html`, **giữ nguyên 100% CSS/thiết kế gốc** (xem
`app/original-design.css` — copy y nguyên từ file HTML, KHÔNG được sửa để
tránh làm lệch giao diện).

## Đã hoàn thành

- Next.js 15 (App Router) + TypeScript strict + Tailwind v4
- Kiến trúc thư mục chuẩn: `components/`, `services/`, `store/`, `types/`, `constants/`, `hooks/`
- Layout dùng chung: `Sidebar`, `Topbar`, `AppShell` (menu tự ẩn/hiện theo `role`)
- State toàn cục bằng Zustand (`store/useAppStore.ts`)
- Data layer tách biệt hoàn toàn khỏi UI (`services/*.ts`) — mỗi file có
  comment mô tả **contract API thật cần dựng ở backend** và nguồn dữ liệu
  thực tế (xem phần "Về dữ liệu thật" bên dưới)
- React Query cho fetching + cache
- Trang đã dựng đầy đủ, chạy thật với service layer:
  - `/` — Trang chủ (hero search, biểu đồ lãi suất Chart.js, sản phẩm nổi bật, tin tức)
  - `/ai` — AI Chat với **streaming token thật** (`services/aiChatService.ts`,
    hiện dùng mock generator giả lập streaming; chỉ cần dựng endpoint
    `POST /api/ai/chat` ở backend là chạy thật ngay, không cần sửa UI)
  - `/loans`, `/cards`, `/insurance`, `/invest`, `/savings` — danh sách sản phẩm
    lấy từ `productsService`
  - `/compare` — bảng so sánh sản phẩm theo tab (vay/thẻ/bảo hiểm/tiết kiệm),
    dữ liệu thật từ `productsService`
  - `/calc` — máy tính vay mua nhà (amortization đầy đủ + biểu đồ dư nợ),
    công thức port 1:1 từ `runCalc()` trong file HTML gốc
  - `/news` — tin tức + giá vàng SJC/DOJI/PNJ + tỷ giá ngoại tệ, dữ liệu
    từ `marketService`
- Build production chạy sạch (`npm run build`), type-check sạch (`npx tsc --noEmit`)

## Còn là khung (stub), cần tiếp tục điền UI chi tiết

`/dashboard/marketplace`, `/dashboard/sale`, `/dashboard/crm`,
`/dashboard/membership`, `/dashboard/community`, `/dashboard/admin` — mỗi
trang đã có route, AppShell, và TODO comment mô tả chính xác cần chuyển hàm
nào từ file HTML gốc (VD: `renderAdmin`, `renderSaleDash`, `renderCRM`...)
sang component React. Nhóm này phụ thuộc vào **auth + role thật + backend
lead/CRM**, nên hợp lý để làm ở giai đoạn 2 sau khi có NestJS API — làm UI
tĩnh trước sẽ phải build lại khi có data thật.

`/calc` mới có máy tính vay mua nhà; các máy tính còn lại (khả năng vay,
đầu tư tích luỹ, quỹ khẩn cấp, DTI, hưu trí) theo đúng pattern
`MortgageCalculator.tsx`, công thức gốc nằm trong `runCalc()` của file HTML.

## Chạy thử

```bash
npm install
npm run dev
# mở http://localhost:3000
```

Mặc định `NEXT_PUBLIC_USE_MOCK=true` nên chạy được ngay, không cần backend.

## Về dữ liệu thật (quan trọng — đọc trước khi tích hợp)

- **Lãi suất ngân hàng** (VPBank/MB/Techcombank/ACB/Vietcombank): các ngân
  hàng này **không có API công khai chính thức**. Hai hướng khả thi:
  1. Crawler (NestJS cron 30-60 phút) đọc trang lãi suất công khai — cần
     kiểm tra robots.txt/ToS từng ngân hàng trước khi triển khai.
  2. Nhập tay qua CMS (Admin Dashboard) — đã có sẵn field `updatedAt` và
     `sourceUrl` trong type `FinancialProduct` để hiển thị minh bạch nguồn.
- **Giá vàng SJC/DOJI/PNJ**: tương tự, cần crawler hoặc nhà cung cấp trả phí.
- **Tỷ giá**: SBV công bố tỷ giá tham chiếu hàng ngày; có thể kết hợp thêm
  exchangerate-api.com cho các ngoại tệ khác.
- **Chứng khoán**: cần đăng ký tài khoản API với FireAnt/TCBS/SSI.
- **Crypto**: CoinGecko có free tier phù hợp để bắt đầu.
- **Tin tức**: parse RSS feed công khai của CafeF/VnEconomy/Vietstock/Google
  News bằng cron job.
- **AI Chat**: cần API key riêng của bạn (OpenAI/Anthropic/Google) đặt ở
  backend `.env`, không đặt ở frontend.
- **Thanh toán**: cần tài khoản merchant Stripe/VNPay/Momo/ZaloPay thật.

Không có bước nào trong danh sách trên có thể "giả lập cho chạy thật" — đều
cần tài khoản/thoả thuận với bên thứ 3 trước.

## Roadmap đề xuất cho các giai đoạn tiếp theo

1. **Backend NestJS**: dựng module `products`, `market`, `ai`, `leads`,
   `auth` theo đúng contract đã comment sẵn trong từng file `services/*.ts`
   — để `NEXT_PUBLIC_USE_MOCK=false` là chạy được ngay.
2. **Auth thật**: JWT + refresh token + OAuth (Google/Facebook/Apple) + OTP.
3. **AI Recommendation Engine**: endpoint chấm điểm/xếp hạng sản phẩm theo
   hồ sơ người dùng (income, occupation, credit history...).
4. **Lead & Marketplace**: bảng `leads` trong Postgres, logic chống bán
   trùng, routing theo khu vực/ngân hàng/sale.
5. **CMS Admin**: quản lý banner/FAQ/blog/lãi suất không hardcode.
6. **Thanh toán, SEO, Analytics, Notification** — theo đúng thứ tự ưu tiên
   kinh doanh của bạn, mỗi mục nên làm thành 1 giai đoạn riêng để kiểm thử kỹ.

## Cấu trúc thư mục

```
app/                  # routes (Next.js App Router)
components/
  layout/              # Sidebar, Topbar, AppShell
  home/                # các block của trang chủ
  ai/                  # chat UI
services/              # data layer — MOCK hôm nay, REAL API sau này
store/                  # Zustand global state
types/                  # domain types dùng chung FE/BE contract
constants/              # nav config, v.v.
```
