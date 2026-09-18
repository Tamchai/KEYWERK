# KEYWERK — Technology Stack and Architecture

เอกสารนี้อธิบายเทคโนโลยี โครงสร้างระบบ และขอบเขตความรับผิดชอบของ KEYWERK ตามโค้ดปัจจุบัน

> สถานะ: Active development สำหรับ local/test environment โดย backend หลักอยู่ใน `backend/`

## ภาพรวมระบบ

KEYWERK ใช้สถาปัตยกรรมแบบแยก Frontend SPA ออกจาก REST API:

```text
Browser
  │
  ▼
React SPA ───────► Go/Fiber REST API ───────► PostgreSQL / Neon
                        │
                        ├────────────────────► SeaweedFS S3
                        │                       ├── products
                        │                       └── profiles
                        │
                        └────────────────────► Stripe Checkout
                                                ▲
                                                └── Signed Webhook
```

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript 6, Vite 8, Tailwind CSS 4 |
| Client state | Zustand, TanStack Query |
| Backend | Go 1.25, Fiber v2, Ports and Adapters |
| Database | PostgreSQL / Neon ผ่าน sqlx และ lib/pq |
| Object storage | SeaweedFS ผ่าน S3-compatible API |
| Payment | Stripe Checkout test mode และ signed webhook |
| API contract | OpenAPI 3.0.3 |

## Frontend (`frontend/`)

### Dependencies หลัก

| Category | Package | Version | หน้าที่ |
| --- | --- | --- | --- |
| UI runtime | React / React DOM | `^19.2.7` | Component rendering |
| Language | TypeScript | `~6.0.2` | Static type checking |
| Build tool | Vite | `^8.1.1` | Dev server, HMR และ production build |
| Styling | Tailwind CSS | `^4.3.2` | Utility-first CSS ผ่าน Vite plugin |
| Routing | React Router DOM | `^7.18.1` | Public, protected และ admin routes |
| Server state | TanStack React Query | `^5.102.8` | Query cache, mutation และ request state |
| Client state | Zustand | `^5.0.15` | Authentication และ cart state |
| Accessible UI | Radix Alert Dialog | `^1.1.23` | Confirm/prompt dialog ที่ไม่ใช้ browser alert |
| Toast | Sonner | `^2.0.8` | Non-blocking notifications |
| Icons | Lucide React | `^1.47.0` | SVG icon components |
| Class utilities | CVA, clsx, tailwind-merge | ตาม `package.json` | Variant และ class composition |
| Linter | Oxlint | `^1.71.0` | JavaScript/TypeScript linting |

### Frontend architecture

```text
frontend/src/
├── api/                  # HTTP client, endpoint functions และ shared API types
├── components/
│   ├── account/          # Account page primitives
│   ├── admin/            # Admin modal, upload และ pagination
│   ├── layout/           # Navbar และ Footer
│   ├── products/         # Product cards, grids และ carousel
│   ├── routing/          # ProtectedRoute, AdminRoute และ session sync
│   └── ui/               # Button, dialog provider และ toaster
├── hooks/
│   ├── queries/          # TanStack Query hooks
│   ├── usePagination.ts
│   └── useAdminTablePageSize.ts
├── pages/                # Customer และ Admin route components
├── stores/               # Zustand auth/cart stores
├── utils/                # Catalog, image, formatting และ pagination logic
├── App.tsx               # Route tree และ lazy-loaded pages
└── index.css             # Tailwind import, tokens และ global styling
```

### State ownership

- TanStack Query ดูแลข้อมูลจาก API เช่น catalog, orders, payments และ admin lists
- Zustand ดูแล authentication session และ cart state ที่ต้องแชร์ข้ามหน้า
- React local state ใช้กับ form, modal, filter และ UI state ภายใน component
- `SessionSync` ประสาน session กับ server cart เมื่อ login/logout

### Styling และ design system

- Tailwind CSS v4 โหลดผ่าน `@tailwindcss/vite`
- Radix UI ใช้สำหรับ accessible dialog primitives
- CSS variables ใน `index.css` เป็นแหล่งสีและพื้นผิวร่วมกัน
- หน้า Admin desktop ใช้ viewport-locked layout และคำนวณจำนวนแถวต่อหน้าให้พอดีกับพื้นที่
- ฟอนต์หลักคือ `Google Sans Flex` และ fallback ภาษาไทยเป็น `Noto Sans Thai`

```css
--font-sans: 'Google Sans Flex', 'Noto Sans Thai', system-ui, sans-serif;
```

สีหลักที่ใช้งาน:

| Token | ค่า | การใช้งาน |
| --- | --- | --- |
| `--bg` | `#0e0c08` | พื้นหลังหลัก |
| `--bg-alt` | `#17140d` | พื้นหลังรอง |
| `--surface` | `#1f1b12` | Card และ modal |
| `--surface-top` | `#292319` | Elevated surface |
| `--line` | `#35301f` | Border และ divider |
| `--text` | `#f2ede0` | ข้อความหลัก |
| `--text-dim` | `#a89f8a` | ข้อความรอง |
| `--accent` | `#e8b923` | Brand accent |

### Frontend development flow

Vite proxy ส่ง request ที่ขึ้นต้นด้วย `/api` ไปยัง backend:

```text
http://localhost:5173/api/* → http://127.0.0.1:8080/api/*
```

สามารถ override ด้วย `VITE_API_BASE_URL` ใน `frontend/.env`

## Backend (`backend/`)

### Dependencies หลัก

| Category | Package | Version | หน้าที่ |
| --- | --- | --- | --- |
| Language | Go | `1.25.1` | Backend runtime |
| HTTP framework | Fiber v2 | `v2.52.14` | Router, middleware และ HTTP handlers |
| Database access | sqlx | `v1.4.0` | SQL execution และ struct scanning |
| PostgreSQL driver | lib/pq | `v1.12.3` | PostgreSQL connectivity |
| Configuration | Viper | `v1.21.0` | YAML config และ environment overrides |
| Authentication | golang-jwt/jwt v5 | `v5.3.1` | JWT creation และ claims |
| Fiber JWT middleware | gofiber/jwt v4 | `v4.0.0` | Protected route middleware |
| Validation | validator/v10 | `v10.30.3` | Request DTO validation |
| Password hashing | x/crypto/bcrypt | `v0.54.0` | Password hashing และ verification |
| UUID | google/uuid | `v1.6.0` | Entity identifiers |
| S3 client | AWS SDK for Go v2 | Core `v1.43.5`, S3 `v1.107.1` | SeaweedFS object storage |
| Payment SDK | stripe-go v82 | `v82.5.1` | Checkout Session และ webhook verification |

### Ports and Adapters

Backend แบ่ง dependency direction เพื่อแยก business rules ออกจาก Fiber, PostgreSQL, SeaweedFS และ Stripe:

```text
cmd/router
    │
    ▼
adapter/inbound/http       Fiber handlers และ request/response mapping
    │
    ▼
core/domain/service        Business rules
    │
    ▼
core/port                  Repository และ payment gateway interfaces
    │
    ▼
adapter/outbound           PostgreSQL, SeaweedFS และ Stripe implementations
```

```text
backend/
├── cmd/
│   ├── main.go                       # Server bootstrap และ global middleware
│   ├── resetdb/main.go               # Development database reset command
│   └── router/v1/                    # API v1 route registration
├── internal/
│   ├── adapter/
│   │   ├── inbound/http/             # Fiber handlers
│   │   ├── inbound/s3/               # S3 client และ bucket initialization
│   │   └── outbound/
│   │       ├── neon/                 # PostgreSQL repository implementations
│   │       ├── seaweedfs/            # Image storage implementation
│   │       └── stripe/               # Stripe payment gateway
│   ├── core/
│   │   ├── domain/dto/               # Domain and transport data structures
│   │   ├── domain/service/           # Business services
│   │   └── port/                     # Repository/gateway contracts
│   ├── infrastructure/
│   │   ├── migrations/               # Ordered SQL migrations
│   │   ├── config.go                 # Viper configuration
│   │   └── neon.go                   # Database lifecycle
│   └── middleware/                   # JWT และ admin authorization
├── config.example.yaml
├── docker-compose.yml
└── openapi.yaml
```

### API และ authorization

- API prefix: `/api/v1`
- JWT Bearer token ใช้กับ profile, address, cart, order และ payment routes
- Admin routes ตรวจทั้ง JWT และ claim `user_role=admin`
- OpenAPI ปัจจุบันมี 30 paths และ 49 operations
- Error response ภายนอกส่งเฉพาะข้อความที่ปลอดภัย ไม่เปิดเผย internal error

### Database และ migrations

- รองรับ PostgreSQL และ Neon
- SQL migrations อยู่ใน `backend/internal/infrastructure/migrations/`
- Backend รัน migration ที่ยังไม่เคยใช้เมื่อเริ่มระบบ
- ตาราง `schema_migrations` บันทึก migration ที่ทำสำเร็จแล้ว
- คำสั่ง `cmd/resetdb` เปิดให้ใช้เฉพาะ `app.env: dev`
- Development admin ถูก seed เมื่อ `dev_admin.enabled: true`

### Object storage

SeaweedFS รันผ่าน Docker Compose และเปิด S3-compatible endpoint ที่พอร์ต `8333`

| Bucket | ข้อมูล |
| --- | --- |
| `products` | รูป Product Variant |
| `profiles` | รูปโปรไฟล์ผู้ใช้ |

Backend ตรวจและสร้าง bucket ที่ขาดให้อัตโนมัติตอนเริ่มทำงาน รูปที่รองรับคือ JPEG, PNG และ WebP ขนาดไม่เกิน 5 MB ต่อไฟล์

### Payment flow

```text
Customer creates order
        │
        ▼
Backend creates/resumes Stripe Checkout Session
        │
        ▼
Customer completes Stripe-hosted Checkout
        │
        ▼
Stripe sends signed webhook
        │
        ▼
Backend verifies signature and updates payment/order atomically
```

- ใช้ Stripe test mode เท่านั้น
- Checkout Session ที่ยังใช้งานได้สามารถถูก resume ได้
- Webhook event ถูกประมวลผลแบบ idempotent
- หน้า payment success ไม่สามารถเปลี่ยนสถานะเป็น `paid` เอง
- Admin verification เป็น operational fallback ไม่ใช่ payment flow หลัก

## Infrastructure สำหรับ Local Development

| Service | Port | รายละเอียด |
| --- | --- | --- |
| Frontend | `5173` | Vite development server |
| Backend | `8080` | Fiber REST API |
| SeaweedFS Master | `9333` | Cluster master |
| SeaweedFS S3 | `8333` | S3-compatible API |
| SeaweedFS Filer | `8888` | Filer HTTP/UI |
| SeaweedFS Volume | `9340` | Volume server |
| PostgreSQL/Neon | `5432` | Relational database |

Redis ไม่ได้อยู่ใน runtime stack ปัจจุบัน

## Configuration และ secrets

Backend โหลดค่าจาก `backend/config.yaml` และสามารถ override ด้วย environment variables ผ่าน Viper ส่วน frontend โหลด `VITE_API_BASE_URL` จาก `frontend/.env`

ไฟล์ที่ต้องไม่ commit:

- `backend/config.yaml`
- `backend/.env`
- `frontend/.env`
- Stripe secret keys และ webhook signing secret
- Database credentials

ไฟล์ตัวอย่างที่ commit ได้:

- `backend/config.example.yaml`
- `frontend/.env.example`

## Quality Gates

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

รายละเอียดการติดตั้งและรันระบบอยู่ใน [`README.md`](README.md) และ API contract อยู่ใน [`backend/openapi.yaml`](backend/openapi.yaml)
