# KEYWERK

เว็บ E-Commerce สำหรับคีย์บอร์ด Mechanical/Magnetic, Keycaps, Switches และอุปกรณ์เสริม ประกอบด้วยหน้าร้านสำหรับลูกค้า ระบบตะกร้าและคำสั่งซื้อ การชำระเงินผ่าน Stripe Checkout และ Dashboard สำหรับผู้ดูแลระบบ

> โปรเจกต์นี้ตั้งค่าสำหรับการพัฒนาและทดสอบในเครื่อง ยังไม่มีขั้นตอน deploy production

## ความสามารถหลัก

### ลูกค้า

- สมัครสมาชิกและเข้าสู่ระบบด้วย JWT
- เลือกดูสินค้าตามหมวดหมู่และค้นหาสินค้า
- ดูรูปและสต็อกของ Product Variant แยกตามตัวเลือก
- เพิ่มสินค้าและแก้ไขจำนวนในตะกร้า
- จัดการที่อยู่จัดส่งและข้อมูลโปรไฟล์
- อัปโหลดรูปโปรไฟล์ไปยัง SeaweedFS bucket `profiles`
- สร้างคำสั่งซื้อและติดตามสถานะการจัดส่ง
- ชำระเงินผ่าน Stripe Checkout ใน test mode

### ผู้ดูแลระบบ

- Dashboard แยกสิทธิ์ด้วย role `admin`
- จัดการสินค้า, Variant, แบรนด์ และหมวดหมู่
- อัปโหลดรูปสินค้าไปยัง SeaweedFS bucket `products`
- ตรวจสอบคำสั่งซื้อ อัปเดตสถานะ และเลขติดตามพัสดุ
- ตรวจสอบรายการชำระเงินและใช้งาน manual fallback เมื่อจำเป็น
- ตาราง Admin แบ่งหน้าอัตโนมัติตามพื้นที่หน้าจอ

## Tech Stack

| ส่วน | เทคโนโลยี |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| UI และ State | Radix UI, Lucide, Sonner, Zustand, TanStack Query |
| Backend | Go 1.25, Fiber, sqlx |
| Database | PostgreSQL / Neon |
| Object Storage | SeaweedFS ผ่าน S3-compatible API |
| Payment | Stripe Checkout และ signed webhook |
| API Contract | OpenAPI 3.0 |

## โครงสร้างโปรเจกต์

```text
KEYWERK/
├── backend/                 # Go REST API, migrations และ OpenAPI
│   ├── cmd/                 # API server และ reset command
│   ├── internal/            # handlers, services, repositories, infrastructure
│   ├── config.example.yaml  # ตัวอย่าง config ที่ commit ได้
│   ├── docker-compose.yml   # SeaweedFS สำหรับ local development
│   └── openapi.yaml         # API contract ปัจจุบัน
├── frontend/                # React application
│   └── src/
│       ├── api/             # API clients และ types
│       ├── components/      # UI และ shared components
│       ├── pages/           # Customer และ Admin pages
│       ├── stores/          # Zustand stores
│       └── hooks/           # Queries และ shared hooks
└── README.md
```

## สิ่งที่ต้องติดตั้ง

- Node.js 22 ขึ้นไป และ npm
- Go 1.25 ขึ้นไป
- Docker Desktop หรือ Docker Engine พร้อม Compose
- PostgreSQL หรือ Neon database
- Stripe CLI สำหรับทดสอบ webhook ในเครื่อง (ใช้เมื่อเปิด Stripe)

## เริ่มใช้งานในเครื่อง

### 1. Clone และติดตั้ง Frontend

```powershell
git clone https://github.com/Tamchai/KEYWERK.git
cd KEYWERK/frontend
npm install
Copy-Item .env.example .env
```

ค่าเริ่มต้นใน `frontend/.env.example` ชี้ API ไปที่:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### 2. ตั้งค่า Backend

```powershell
cd ../backend
Copy-Item config.example.yaml config.yaml
```

แก้ `backend/config.yaml` ให้ตรงกับเครื่อง โดยเฉพาะ:

- `app.secret` — secret สำหรับเซ็น JWT
- `database.neon.*` — PostgreSQL/Neon credentials
- `seaweedfs.*` — credentials สำหรับ S3 API
- `stripe.*` — Stripe test keys เมื่อเปิดใช้งาน

ห้าม commit `backend/config.yaml` หรือไฟล์ `.env` เพราะมีข้อมูลลับ โดยทั้งสองไฟล์ถูก ignore ไว้แล้ว

### 3. เริ่ม SeaweedFS

สร้าง `backend/.env` สำหรับ Docker Compose:

```env
AWS_ACCESS_KEY_ID=local-access-key
AWS_SECRET_ACCESS_KEY=local-secret-key
S3_BUCKET=products
```

ค่าดังกล่าวต้องตรงกับ `seaweedfs.access_key` และ `seaweedfs.secret_key` ใน `config.yaml`

```powershell
docker compose up -d
```

บริการที่เปิดในเครื่อง:

| Service | URL/Port |
| --- | --- |
| SeaweedFS Master | `http://localhost:9333` |
| SeaweedFS S3 API | `http://localhost:8333` |
| SeaweedFS Filer | `http://localhost:8888` |

Backend จะสร้าง bucket `products` และ `profiles` ให้อัตโนมัติเมื่อเริ่มทำงาน

### 4. เริ่ม Backend

```powershell
go run ./cmd
```

API เปิดที่ `http://localhost:8080/api/v1` และจะรัน migrations ใน `internal/infrastructure/migrations/` ตามลำดับโดยอัตโนมัติ

### 5. เริ่ม Frontend

เปิด Terminal ใหม่:

```powershell
cd frontend
npm run dev
```

Frontend เปิดที่ `http://localhost:5173`

## บัญชี Admin สำหรับ Development

เมื่อใช้ค่าจาก `config.example.yaml` ระบบจะ seed บัญชีต่อไปนี้เฉพาะเมื่อ `app.env: dev` และ `dev_admin.enabled: true`:

```text
Email:    admin@gmail.com
Password: 1234
```

บัญชีนี้มีไว้สำหรับทดสอบในเครื่องเท่านั้น ห้ามใช้ credential นี้ใน production

## Stripe Test Mode

เปิด Stripe ใน `backend/config.yaml`:

```yaml
stripe:
  enabled: true
  secret_key: sk_test_...
  webhook_secret: whsec_...
```

Backend ยอมรับเฉพาะ secret key ที่ขึ้นต้นด้วย `sk_test_` เพื่อป้องกันการใช้ live mode โดยไม่ตั้งใจ

ส่ง webhook จาก Stripe CLI มายัง backend:

```powershell
stripe listen --forward-to http://localhost:8080/api/v1/payments/stripe/webhook
```

นำค่า `whsec_...` ที่ Stripe CLI แสดงไปใส่ใน `stripe.webhook_secret` แล้ว restart backend

บัตรสำหรับทดสอบ:

```text
Card number: 4242 4242 4242 4242
Expiry:      วันที่ในอนาคต
CVC:         เลข 3 หลักใดก็ได้
```

สถานะการชำระเงินอ้างอิง signed webhook จาก Stripe หน้า success จะไม่เปลี่ยน payment เป็น `paid` ด้วยตัวเอง

## API Documentation

สเปก API ปัจจุบันอยู่ที่ [`backend/openapi.yaml`](backend/openapi.yaml) ครอบคลุม 30 paths และ 49 operations

Base URL สำหรับ local development:

```text
http://localhost:8080/api/v1
```

## คำสั่งตรวจสอบคุณภาพ

Frontend:

```powershell
cd frontend
npm test
npm run lint
npm run build
```

Backend:

```powershell
cd backend
go test ./...
go vet ./...
```

## ล้างฐานข้อมูล Development

คำสั่งต่อไปนี้จะลบทุกตารางใน schema `public` แล้วสร้าง migrations และบัญชี development admin ใหม่:

```powershell
cd backend
go run ./cmd/resetdb --confirm-reset
```

คำสั่งจะทำงานเมื่อ `app.env` เป็น `dev` เท่านั้น ควรตรวจชื่อฐานข้อมูลใน `database.neon.name` ก่อนใช้งานทุกครั้ง

## การรักษาความปลอดภัย

- อย่า commit `backend/config.yaml`, `.env`, Stripe secret หรือ database credentials
- ใช้เฉพาะ Stripe test mode ระหว่างพัฒนา
- เปลี่ยน `app.secret` และปิด development admin ก่อนใช้งานในสภาพแวดล้อมจริง
- รูปโปรไฟล์และรูปสินค้าใช้คนละ bucket เพื่อลดการปะปนของข้อมูล

## License

โปรเจกต์นี้ยังไม่ได้ระบุ license สำหรับการเผยแพร่ต่อสาธารณะ
