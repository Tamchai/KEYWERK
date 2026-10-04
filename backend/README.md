# คู่มืออ่าน Backend ของ KEYWERK

เอกสารนี้อธิบาย **โค้ดที่มีอยู่จริง** ใน `backend/` เพื่อให้ไล่จากคำขอของเว็บไปถึงฐานข้อมูลและบริการภายนอกได้ ไม่ใช่บันทึกว่าใครเขียนไฟล์ไหน: Git ไม่พอบอกความเป็นเจ้าของของโค้ดแต่ละบรรทัดอย่างน่าเชื่อถือ

ถ้าต้องการค้นหน้าที่ของฟังก์ชันตามชื่อ เปิด [FUNCTIONS.md](FUNCTIONS.md) คำจำกัดความของ Product, Variant, Order และ Payment อธิบายไว้ในหัวข้อด้านล่าง ส่วนสัญญา API และรูปแบบ request/response ดู [openapi.yaml](openapi.yaml)

## เริ่มอ่านจากตรงไหน

```text
HTTP request
  → cmd/router/v1/                 เลือก URL และตรวจสิทธิ์
  → internal/adapter/inbound/http/  อ่าน input และส่ง HTTP response
  → internal/core/domain/service/   ตัดสินกฎของร้าน
  → internal/core/port/             interface ที่ service ต้องการ
  → internal/adapter/outbound/      SQL, Stripe หรือ SeaweedFS จริง
```

`dto/` เป็นโครงสร้างข้อมูลที่ใช้รับ/ส่งระหว่างชั้นและ JSON; `errs/` เป็นข้อผิดพลาดพร้อม HTTP status; `infrastructure/` โหลด config, เชื่อม DB และรัน migrations การแยกชั้นนี้ทำให้เปลี่ยนวิธีเก็บข้อมูลหรือ mock dependency ใน test ได้โดยไม่ย้ายกฎธุรกิจไปไว้ใน handler

ตัวอย่าง ถ้าเปิด `POST /api/v1/orders` ให้เริ่มที่ `cmd/router/v1/order.go` → `internal/adapter/inbound/http/order.go:CreateOrder` → `internal/core/domain/service/order.go:CreateOrder` → `internal/adapter/outbound/neon/order.go:Create` จุดที่ **หักสต็อกและล้างตะกร้าพร้อมกัน** อยู่ที่ repository ซึ่งเปิด SQL transaction ไม่ใช่ที่หน้าเว็บ

## คำศัพท์และความสัมพันธ์

- Category และ Brand เป็นข้อมูลประกอบ Product; Product มี `category_id` หนึ่งค่าและ `brand_id` หนึ่งค่า จึงไม่ควรทำให้สินค้ารุ่นเดียวปรากฏทุกหมวด
- Variant เป็นรายการที่ขายจริง มี `price`, `stock`, `image_id`, `sold_count` และ `attributes` แบบ JSON เช่น สีหรือชนิดสวิตช์ โค้ดยังไม่ได้บังคับว่าแต่ละ Product ต้องมีทุกคู่สี/สวิตช์
- Cart มี CartItem ที่ชี้ไป Variant; ตอนสั่งซื้อจะสร้าง OrderItem และบันทึกราคา ณ เวลานั้น ไม่อ่านราคาปัจจุบันมาย้อนแก้ออเดอร์
- Order กับ Payment เป็นคนละสถานะ: `pending/processing/shipped/cancelled` เทียบกับ `pending/paid/failed` การกลับจาก Stripe ไม่ควรถือว่าจ่ายแล้วจน backend ตรวจ Stripe
- รูปสินค้ากับรูปโปรไฟล์ใช้ SeaweedFS คนละ bucket คือ `products` กับ `profiles` โดย URL metadata เก็บในตาราง `images`

## โฟลว์สำคัญที่ควรรู้

### เริ่มระบบและสิทธิ์

`cmd/main.go:main` โหลดค่า config, สร้าง Fiber พร้อม CORS/log/recovery, เชื่อม PostgreSQL, รัน migrations แล้วผูก routes หาก `app.env=dev` และ `dev_admin.enabled=true` การเริ่ม DB จะ seed หรืออัปเดต development admin ตามค่าใน config จากนั้น server รับคำขอที่พอร์ต `app.port` (`8080` โดยปริยาย)

`AuthMiddleware` ตรวจ JWT ใน `Authorization: Bearer ...`; `CheckAdminRole` ตรวจ claim `user_role=admin` เส้นทาง public ไม่ผ่าน middleware นี้ เช่นรายการสินค้า ส่วนการแก้สินค้าและ `/admin/*` ต้องเป็น admin ข้อสำคัญ: การซ่อนปุ่มใน frontend ไม่ใช่การตรวจสิทธิ์; backend ต้องตรวจเองเสมอ

### ตะกร้า → คำสั่งซื้อ → สต็อก

`CartService` อ่านตะกร้าของผู้ใช้และเช็กสต็อกก่อนเพิ่ม/ปรับจำนวน แต่การใส่ตะกร้า **ยังไม่จองสต็อก** `OrderService.CreateOrder` รับได้ทั้ง `items` สำหรับซื้อทันที หรืออ่านจาก Cart เมื่อ `items` ว่าง โดยเลือก saved address หรือข้อมูลที่อยู่ที่ส่งมา จากนั้นเช็กสินค้าและคำนวณยอดเป็นหน่วยสตางค์ `NeonOrderRepository.Create` หักสต็อก Variant, เพิ่ม `sold_count`, บันทึก Order/OrderItem และล้าง CartItem ใน transaction เดียว ถ้าสต็อกถูกซื้อไปก่อนหน้า SQL จะไม่หักติดลบและ transaction จะ rollback

`CancelMyOrder` ให้เจ้าของยกเลิกได้เฉพาะ Order `pending` ที่ยังไม่มี Payment หรือ Payment `failed` หาก Stripe Checkout ยัง `pending` หรือจ่ายแล้วจะปฏิเสธ การเปลี่ยนสถานะเป็น `cancelled` ใน repository จะคืนสต็อกและลด `sold_count` ใน transaction เดียว ป้องกันการคืนซ้ำด้วยการเทียบสถานะเดิม ไม่รวมการคืนเงิน Stripe

**ข้อควรระวังสำหรับ admin:** endpoint เปลี่ยนสถานะ Order อนุญาต `processing → cancelled` แต่โค้ดนี้ไม่ได้เรียก Stripe Refund จึงไม่ควรใช้กับออเดอร์ที่จ่ายแล้วโดยคิดว่าจะคืนเงินอัตโนมัติ

`Product.total_sold` ที่ API คืนมาคำนวณจาก OrderItem ของ Payment ที่ `paid` และ Order ที่ไม่ถูกยกเลิก ไม่ใช่การนับเพียงตอนกดสั่งซื้อ ส่วน `Variant.sold_count` ถูกปรับตอนสร้าง/ยกเลิก Order จึงมีความหมายไม่เหมือนกันทั้งหมด

### Stripe test mode

`CreatePayment` ตรวจเจ้าของ Order และสถานะ `pending` ก่อนสร้างหรือใช้ Stripe Checkout Session เดิม หากจ่ายล้มเหลวจะเริ่ม attempt ใหม่ Stripe gateway ส่ง `payment_id`/`order_id` เป็น metadata และใช้ idempotency key ของ attempt นั้น Browser ได้เพียง URL เพื่อไปจ่ายเงิน ไม่ได้สั่งเปลี่ยน Payment เป็น `paid` เอง

`StripeWebhook` รับ raw body โดยไม่ใช้ JWT เพราะ Stripe เป็นผู้เรียก `ParseWebhook` ตรวจลายเซ็น และ `ProcessStripeEvent` บันทึก event ID เพื่อกัน event ซ้ำ เช็กว่า payment/order/session ตรงกัน แล้วอัปเดต Payment/Order ใน transaction เมื่อจ่ายสำเร็จจะเป็น `paid`/`processing` ถ้า webhook มาช้า หน้าเว็บเรียก `ReconcilePayment` ให้ backend ถาม Stripe อีกครั้งโดยตรวจ metadata ก่อนอัปเดต Admin ยังมี `VerifyPayment` เป็น fallback เฉพาะกรณีจำเป็น ไม่ใช่ขั้นตอนประจำหลังลูกค้าจ่าย

Manual fallback นี้เป็นการเปลี่ยนสถานะใน DB โดย admin ไม่ใช่หลักฐานการโอนเงินจาก Stripe ต้องตรวจธุรกรรมจริงก่อนใช้

ระบบนี้รับเฉพาะ Stripe **test key** เมื่อเปิด `stripe.enabled` การใช้ local webhook แบบอัตโนมัติต้องรัน Stripe CLI ตาม README หลักของโปรเจกต์ อย่าใส่ secret ลงเอกสารหรือ Git

### รูปภาพ

`SetupImageRoutes` สร้าง S3 client สำหรับ SeaweedFS และตรวจ/สร้าง bucket ทั้งสอง `UploadImage` รับ multipart field `images` สูงสุด 5 ไฟล์ ไฟล์ละไม่เกิน 5 MB และเฉพาะ JPEG/PNG/WebP; `UploadProfileImage` ใช้ handler เดียวกันแต่จำกัด 1 ไฟล์ `ImageService.UploadImage` ตั้งชื่อไฟล์เป็น UUID, ส่ง object ไป bucket, เก็บ URL path ใน DB และพยายามลบไฟล์ที่เพิ่งอัปโหลดหากขั้นถัดไปล้มเหลว

## โครงสร้างที่ต้องระวัง

| ตำแหน่ง | ความหมาย |
| --- | --- |
| `internal/infrastructure/migrations/*.sql` | สร้าง/ปรับ schema ตามลำดับชื่อไฟล์; `RunMigrations` บันทึกไฟล์ที่เคยใช้แล้ว |
| `cmd/resetdb/main.go` | ล้าง `public` schema ทั้งหมดและสร้างใหม่ ใช้ได้เมื่อ `app.env=dev` พร้อม `--confirm-reset` แต่ **ยังต้องตรวจ DB เป้าหมายด้วยตัวเอง** ก่อนใช้ |
| `config.example.yaml` | แม่แบบ config ที่ commit ได้; `config.yaml` เป็นข้อมูลลับในเครื่องและถูก ignore |
| `openapi.yaml` | URL, request/response และสิทธิ์ของ API; แก้เมื่อเปลี่ยน contract |
| `*_test.go` | unit tests ของ image, order cancellation, payment reconciliation และ Stripe webhook |

## วิธีตามโค้ดเมื่อจะเปลี่ยนฟีเจอร์

1. หา path และ HTTP method ใน `cmd/router/v1/` หรือ `openapi.yaml`
2. อ่าน handler ว่ารับ field/ID จากที่ไหน แล้วอ่าน service ว่าเช็กกฎและสิทธิ์อะไร
3. อ่าน repository/gateway ก่อนเปลี่ยนกฎที่เกี่ยวกับ DB transaction, Stripe หรือไฟล์
4. เปลี่ยน DTO และ OpenAPI เมื่อรูปแบบข้อมูลเปลี่ยน แล้วรัน `go test ./...` และ `go vet ./...`

คู่มือชื่อฟังก์ชันฉบับละเอียด: [FUNCTIONS.md](FUNCTIONS.md)
