# KEYWERK — Acceptance Verification

บันทึกผลการตรวจวันที่ 26 กันยายน 2026 บน Windows, Chrome headless, PostgreSQL 17 แยกสำหรับทดสอบ และ SeaweedFS ในเครื่อง การทดสอบนี้ไม่ reset DB ที่ผู้ใช้ใช้งานอยู่ ไม่ deploy และไม่ตรวจ mobile สคริปต์ acceptance test ที่ใช้ในรอบนั้นถูกนำออกจาก repository แล้ว จึงไม่ใช่ขั้นตอนทดสอบที่รันซ้ำได้จากไฟล์นี้

## ขอบเขตและหลักฐาน

การตรวจรอบนั้นใช้ browser และ API กับ backend จริง ไม่ mock ข้อมูล catalog, cart, order, stock หรือ storage โดยเริ่มจาก catalog และรายการธุรกรรมที่ว่าง มีเฉพาะ development admin และหมวดหมู่จาก migrations

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

## หมายเหตุเกี่ยวกับผลทดสอบ

ผลในตารางเป็นหลักฐานย้อนหลัง ไม่ใช่สถานะ CI ที่รันอัตโนมัติในปัจจุบัน การทดสอบ Stripe ใช้ test card และ event จริงจาก Stripe ที่ส่งเข้า local webhook handler พร้อมตรวจ duplicate และ invalid signature แต่ไม่ได้ยืนยันว่า Stripe ส่ง webhook ผ่านอินเทอร์เน็ตถึงเครื่องโดยอัตโนมัติ สำหรับการรับ event ในเครื่องยังต้องใช้ Stripe CLI ตาม README

หากต้องทดสอบ flow แบบ end-to-end อีกครั้ง ให้ใช้ฐานข้อมูลทดสอบแยกจากข้อมูลจริง และสร้างขั้นตอนทดสอบใหม่ก่อน เพราะไม่มี acceptance runner ใน repository แล้ว คำสั่ง unit test, lint และ build ปัจจุบันอยู่ใน README

## ข้อจำกัดที่ตั้งใจคงไว้

- Customer cancellation ใช้ได้เมื่อ order เป็น `pending` และไม่มี payment หรือ payment เป็น `failed` ยังไม่ expire active Checkout Session และไม่คืนเงินออเดอร์ที่จ่ายแล้ว
- หน้าเลือกสินค้าแสดง variant เป็นรายการ ยังไม่แยกปุ่มเลือกสีและ switch
- ใช้ Stripe test mode เท่านั้น และไม่มี production deployment ใน scope
- SeaweedFS ใช้ volume ชื่อ `backend2_seaweedfs_data` เพื่อรักษารูปเดิมหลังย้าย backend directory; ชื่อนี้ไม่ใช่ directory ของ backend ที่ใช้งานอยู่
