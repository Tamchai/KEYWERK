# KEYWERK — Acceptance Verification

ตรวจล่าสุด: 26 กันยายน 2026 บน Windows, Chrome headless, PostgreSQL 17 แยกสำหรับทดสอบ และ SeaweedFS ในเครื่อง การทดสอบนี้ไม่ reset DB ที่ผู้ใช้ใช้งานอยู่ ไม่ deploy และไม่ตรวจ mobile

## ขอบเขตและหลักฐาน

`scripts/verify-local.mjs` ตรวจ browser และ API กับ backend จริง ไม่ mock ข้อมูล catalog, cart, order, stock หรือ storage โดยเริ่มจาก catalog และรายการธุรกรรมที่ว่าง มีเฉพาะ development admin และหมวดหมู่จาก migrations

ผลละเอียดและภาพหน้าจอเก็บใน `.verification/` ซึ่งถูก ignore ไม่เก็บ token, Stripe secret หรือ config ลงรายงาน

| รายการ | ผลล่าสุด |
| --- | --- |
| Empty catalog และ public pages | ผ่าน |
| สมัคร member และ redirect ไป profile | ผ่าน |
| Empty profile/address/order/cart/checkout และ admin lists ใน light/dark | ผ่าน |
| Product CRUD และรูปสินค้าเข้า SeaweedFS `products` | ผ่าน create/update/delete ผ่าน API จริง และตรวจรูปจริง |
| รูปโปรไฟล์เข้า `profiles` และแสดงใน browser | ผ่าน |
| Form labels, modal focus และ Escape | ผ่านฟอร์มสินค้า/variant/brand/category |
| Admin pagination ที่ 1280×800, 1440×900 และ 1920×1080 | ผ่านหน้ารายการแบรนด์ 25 รายการ |
| ยกเลิกออเดอร์: owner guard, คืน stock/sold count และไม่คืนซ้ำ | ผ่านกับ PostgreSQL จริง |
| Icon cart → ที่อยู่ → checkout → หัก stock และล้าง cart | ผ่าน |
| Stripe-hosted test checkout และ reconciliation | ผ่านด้วยบัตร test บน Stripe Checkout จริง |
| Signed Stripe event replay และ duplicate event | ผ่าน event จริง, duplicate และ invalid signature; webhook อัปเดต pending → paid/processing ได้เมื่อปิด reconciliation |
| Admin tracking → shipped → customer detail | ผ่าน |
| Frontend test/lint/build และ backend test/vet | ผ่านรอบสุดท้าย; frontend tests 13/13 |

การตรวจ labels, named buttons, viewport overflow และ keyboard focus เป็น focused acceptance check ไม่ใช่การรับรอง WCAG ทั้งเว็บไซต์

## วิธีรันกับฐานข้อมูลแยก

ต้องมี Docker, Go, Node.js, Chrome และ Stripe test-mode config ใน `backend/config.yaml` ที่ถูก ignore ต้องเริ่มด้วย DB สำหรับทดสอบที่ไม่มี products; script จะหยุดก่อนสร้าง fixture หาก catalog ไม่ว่าง

จาก root ให้เริ่ม PostgreSQL ชั่วคราวและ SeaweedFS:

```powershell
docker run --detach --name keywerk-acceptance-db --publish 127.0.0.1:55432:5432 --env POSTGRES_USER=keywerk_test --env POSTGRES_PASSWORD=keywerk_local_test --env POSTGRES_DB=keywerk_acceptance postgres:17-alpine
docker compose -f backend/docker-compose.yml up -d
```

เปิด terminal สำหรับ backend:

```powershell
cd backend
$env:DATABASE_NEON_HOST='127.0.0.1'
$env:DATABASE_NEON_USER='keywerk_test'
$env:DATABASE_NEON_PASSWORD='keywerk_local_test'
$env:DATABASE_NEON_NAME='keywerk_acceptance'
$env:DATABASE_NEON_PORT='55432'
$env:DATABASE_NEON_SSLMODE='disable'
go run ./cmd
```

เปิดอีก terminal สำหรับ frontend:

```powershell
cd frontend
npm run dev -- --host 127.0.0.1
```

ติดตั้ง test runner แยกจาก application dependencies แล้วรันจาก root:

```powershell
npm install --prefix .verification/runner --no-package-lock playwright@1.63.0
$env:PLAYWRIGHT_MODULE_PATH=(Join-Path (Get-Location) '.verification/runner/node_modules/playwright')
$env:VERIFY_STRIPE='1'
node scripts/verify-local.mjs
```

หากไม่ได้ตั้ง `VERIFY_STRIPE=1` รายการ Stripe จะเป็น `unavailable` ไม่ใช่ `pass` Script ใช้ Stripe test card และสร้างธุรกรรมทดสอบจริงในบัญชี test mode

Signed event replay ดึง event จาก Stripe แล้วลงลายเซ็นด้วย webhook secret ของ local config เพื่อส่งเข้า HTTP webhook handler และตรวจ idempotency วิธีนี้ทดสอบ handler กับ event จริง แต่ไม่ยืนยันการส่ง webhook จาก Stripe ผ่านอินเทอร์เน็ตมาถึงเครื่อง สำหรับการรับ event อัตโนมัติใน local ใช้ Stripe CLI ตาม README

เมื่อจบทดสอบ ให้หยุด backend/frontend ที่เปิดไว้ แล้วลบเฉพาะ container ฐานข้อมูลชั่วคราว:

```powershell
docker stop keywerk-acceptance-db
docker rm keywerk-acceptance-db
docker compose -f backend/docker-compose.yml stop
```

ไม่ลบ volume ของ SeaweedFS เพื่อรักษารูปเดิม รอบที่บันทึกผลนี้ได้คืนสถานะ services และลบ DB ชั่วคราวหลังตรวจเสร็จแล้ว

## ข้อจำกัดที่ตั้งใจคงไว้

- Customer cancellation ใช้ได้เมื่อ order เป็น `pending` และไม่มี payment หรือ payment เป็น `failed` ยังไม่ expire active Checkout Session และไม่คืนเงินออเดอร์ที่จ่ายแล้ว
- หน้าเลือกสินค้าแสดง variant เป็นรายการ ยังไม่แยกปุ่มเลือกสีและ switch
- ใช้ Stripe test mode เท่านั้น และไม่มี production deployment ใน scope
- SeaweedFS ใช้ volume ชื่อ `backend2_seaweedfs_data` เพื่อรักษารูปเดิมหลังย้าย backend directory; ชื่อนี้ไม่ใช่ directory ของ backend ที่ใช้งานอยู่
