# KEYWERK backend2 (local development)

ระบบนี้ใช้ Go/Fiber, PostgreSQL (Neon ได้) และ SeaweedFS S3 โดยไม่รวมขั้นตอน deploy

## ตั้งค่า

1. คัดลอก `config.example.yaml` เป็น `config.yaml`
2. ใส่ค่า PostgreSQL และเปลี่ยน `app.secret` เป็นค่าสุ่มสำหรับเครื่องพัฒนา
3. ห้าม commit `config.yaml` เพราะมี credential
4. environment variable สามารถ override YAML ได้ เช่น `APP_SECRET` และ `DATABASE_NEON_PASSWORD`

ค่า development admin เริ่มต้นคือ `admin@gmail.com` / `1234` และจะ seed เฉพาะเมื่อ `app.env: dev` กับ `dev_admin.enabled: true` เท่านั้น

## รันในเครื่อง

```powershell
cd backend2
docker compose up -d
go run ./cmd
```

ระบบจะแยกไฟล์สินค้าไว้ใน bucket `products` และรูปโปรไฟล์ไว้ใน bucket `profiles` โดยสร้าง bucket ที่ขาดให้อัตโนมัติตอนเริ่ม backend

Backend เปิดที่ `http://localhost:8080` ตามค่าเริ่มต้น ส่วน frontend ต้องตั้ง `VITE_API_BASE_URL=http://localhost:8080/api/v1` หากไม่ได้ใช้ Vite proxy

Migration ใน `internal/infrastructure/migrations/` จะรันตามชื่อไฟล์เพียงครั้งเดียวและบันทึกในตาราง `schema_migrations`

## เตรียม catalog สำหรับทดสอบ

หลัง login ด้วยบัญชี development admin ให้สร้างข้อมูลผ่านหน้า `/admin` ตามลำดับนี้:

1. สร้าง brand และ category อย่างละอย่าง
2. สร้าง product แล้วเลือก brand/category ที่สร้างไว้
3. เปิดหน้า product variants, upload รูป และสร้าง variant โดยกำหนดราคาและ stock มากกว่า 0

ขั้นตอนนี้ใช้แทน seed catalog เพื่อให้ทดสอบ CRUD และ upload ผ่าน flow จริงได้ทุกครั้ง

## Stripe test mode

ระบบใช้ Stripe-hosted Checkout และเชื่อผลการชำระจาก webhook ที่ตรวจลายเซ็นเท่านั้น หน้า success ไม่ได้เปลี่ยนสถานะ payment เอง

ตั้งค่าผ่าน `config.yaml` หรือ environment variables โดยห้าม commit ค่าจริง:

```yaml
stripe:
  enabled: true
  secret_key: sk_test_...
  webhook_secret: whsec_...
```

ชื่อ environment variables คือ `STRIPE_ENABLED`, `STRIPE_SECRET_KEY` และ `STRIPE_WEBHOOK_SECRET` ระบบรับเฉพาะ secret key ที่ขึ้นต้นด้วย `sk_test_` เพื่อป้องกันการใช้ live mode โดยไม่ตั้งใจ

ระหว่างพัฒนา ให้ส่ง Stripe events มาที่:

```powershell
stripe listen --forward-to http://localhost:8080/api/v1/payments/stripe/webhook
```

นำ signing secret ที่ Stripe CLI แสดงไปใส่เป็น `STRIPE_WEBHOOK_SECRET` แล้ว restart backend จากนั้นใช้ test card `4242 4242 4242 4242`, วันหมดอายุอนาคต และ CVC 3 หลักใดก็ได้ ผู้ดูแลยังเปลี่ยนสถานะ payment ได้ในหน้า admin เฉพาะกรณี operational fallback

## ล้างฐานข้อมูล development

คำสั่งนี้ลบทุกตารางใน schema `public` ของฐานข้อมูลที่ระบุใน `config.yaml` แล้วสร้าง schema, migration และ development admin ใหม่ทั้งหมด:

```powershell
cd backend2
go run ./cmd/resetdb --confirm-reset
```

คำสั่งจะปฏิเสธการทำงานถ้า `app.env` ไม่ใช่ `dev` ควรตรวจชื่อฐานข้อมูลใน `database.neon.name` ก่อนทุกครั้ง

## ตรวจคุณภาพ

```powershell
go test ./...
go vet ./...
```
