# พจนานุกรมฟังก์ชัน Backend

อ่าน [README.md](README.md) ก่อนหากยังไม่คุ้นกับลำดับ Route → Handler → Service → Repository เอกสารนี้อธิบายชื่อฟังก์ชันที่อยู่ใน Go production code ณ ปัจจุบัน โดยใช้ชื่อจริงเพื่อให้ค้นด้วย `rg 'ชื่อฟังก์ชัน' backend` ได้ ฟังก์ชัน `New...` ทุกตัวทำหน้าที่ประกอบ dependency แล้วคืน interface/handler ไม่ได้เรียก API หรือเขียน DB ด้วยตัวเอง เว้นแต่ระบุไว้ต่างหาก ฟังก์ชันใน `*_test.go` อธิบายแยกท้ายไฟล์

## 1. การเริ่มระบบ, การตั้งค่า และ error

| ไฟล์ / ฟังก์ชัน | ทำอะไร |
| --- | --- |
| `cmd/main.go:main` | โหลด config, สร้าง Fiber/middleware, เชื่อม DB, ลงทะเบียน route แล้วเปิด server |
| `cmd/main.go:apiErrorHandler` | แปลง `AppError` หรือ Fiber error เป็น JSON `message` พร้อม HTTP status; error ที่ไม่รู้จักเป็น 500 และไม่เปิดเผยรายละเอียดภายใน |
| `cmd/resetdb/main.go:main` | เครื่องมือล้าง `public` schema ของ DB ที่ config ชี้อยู่ แล้วรัน migrations/seed ใหม่ ต้องเป็น `dev` และมี `--confirm-reset`; ระวังอย่าชี้ DB จริง |
| `internal/infrastructure/config.go:InitConfig` | โหลด `config.yaml` กับ environment variables, ตั้งค่า default, ตรวจ key ที่จำเป็น และบังคับ Stripe test key เมื่อเปิด Stripe |
| `internal/infrastructure/neon.go:OpenConfiguredDatabase` | สร้าง connection pool ของ PostgreSQL จาก config และ `Ping` เพื่อยืนยันว่าเชื่อมได้ |
| `internal/infrastructure/neon.go:InitNeon` | เปิด DB, รัน migrations, seed development admin ตาม config แล้วเก็บ connection ไว้ใน `infrastructure.DB` |
| `internal/infrastructure/neon.go:CloseNeon` | ปิด connection pool ตอนหยุด server |
| `internal/infrastructure/neon.go:seedDevelopmentAdmin` | เพิ่มหรืออัปเดตบัญชี admin เฉพาะเมื่อ `app.env=dev` และเปิด `dev_admin.enabled`; hash รหัสผ่านก่อนบันทึก |
| `internal/infrastructure/migrations.go:RunMigrations` | อ่าน SQL ที่ embed ไว้ตามลำดับชื่อไฟล์, ใช้ transaction ต่อ migration, บันทึกชื่อใน `schema_migrations` เพื่อไม่รันซ้ำ |
| `internal/middleware/middleware.go:AuthMiddleware` | คืน middleware ที่ตรวจลายเซ็น JWT และตอบ 401 หาก token ไม่ผ่าน |
| `internal/middleware/middleware.go:CheckAdminRole` | คืน middleware ที่อ่าน `user_role` จาก JWT แล้วตอบ 403 หากไม่ใช่ admin |
| `internal/adapter/inbound/http/helper.go:GetUserIDFromCtx` | ดึง `user_id` จาก token ที่ middleware เก็บใน request; ไม่มีหรือผิดรูปแบบจะเป็น 401 |
| `internal/adapter/inbound/http/helper.go:IsAdminFromCtx` | คืน `true` เมื่อ claim ใน token ระบุ role `admin` |

`internal/core/domain/errs/apperror.go` กำหนด `AppError` ที่มี `Code`, ข้อความให้ลูกค้า (`Message`) และสาเหตุภายใน (`Err`):

| ฟังก์ชัน | ทำอะไร |
| --- | --- |
| `Error` | สร้างข้อความ error สำหรับ log/debug จาก message กับ error ต้นเหตุ |
| `Unwrap` | เปิดทางให้ `errors.Is`/`errors.As` ตรวจ error ต้นเหตุ |
| `BadRequest` | สร้าง HTTP 400 สำหรับ input ผิด |
| `Unauthorized` | สร้าง HTTP 401 สำหรับยังไม่ยืนยันตัวตน |
| `Forbidden` | สร้าง HTTP 403 สำหรับมีตัวตนแต่ไม่มีสิทธิ์ |
| `NotFound` | สร้าง HTTP 404 สำหรับหา resource ไม่พบ |
| `Conflict` | สร้าง HTTP 409 สำหรับสถานะชนกันหรือข้อมูลซ้ำ |
| `Internal` | สร้าง HTTP 500 เมื่อระบบภายในล้มเหลว |
| `Unavailable` | สร้าง HTTP 503 เมื่อบริการที่ต้องใช้ไม่พร้อม |

## 2. Router: URL นี้ไปหาใคร

ทุกเส้นทางมี prefix `/api/v1` จาก `SetupApiRoutes` → `SetupV1Routes` ฟังก์ชัน `Setup...Routes` สร้าง repository/service/handler แล้วผูก HTTP method กับ handler พร้อม middleware ที่จำเป็น

| ฟังก์ชันใน `cmd/router/` | กลุ่ม URL และหน้าที่ |
| --- | --- |
| `SetupApiRoutes` (`api.go`) | สร้างกลุ่ม `/api` แล้วเรียกตัวตั้งค่า v1 |
| `SetupV1Routes` (`v1/v1.go`) | สร้าง `/v1` แล้วลงทะเบียนทุกกลุ่มด้านล่าง |
| `SetupUserRoutes` | `/login`, `/register`, `/profile`; profile ต้อง login |
| `SetupAddressRoutes` | `/addresses`; ทุกคำขอต้อง login |
| `SetupBrandRoutes` | `/brands`; อ่านได้สาธารณะ, เพิ่ม/แก้/ลบต้อง admin |
| `SetupCategoryRoutes` | `/categories`; อ่านได้สาธารณะ, เพิ่ม/แก้/ลบต้อง admin |
| `SetupProductRoutes` | `/products`; อ่านได้สาธารณะ, เพิ่ม/แก้/ลบต้อง admin |
| `SetupProductVariantRoutes` | `/product-variants`; อ่านได้สาธารณะ, เพิ่ม/แก้/ลบต้อง admin |
| `SetupCartRoutes` | `/cart`; ทุกคำขอต้อง login |
| `SetupOrderRoutes` | `/orders` ของลูกค้า และ `/admin/orders` ของ admin |
| `SetupPaymentRoutes` | `/payments`, `/admin/payments`; webhook เป็น public route ที่ตรวจ Stripe signature เอง |
| `SetupImageRoutes` | สร้าง S3 client/bucket; `/upload` เป็น admin, `/profile/image` เป็นสมาชิกที่ login |

## 3. HTTP Handler: แปล HTTP ให้ Service

ตัว `New...Handler` แต่ละตัวรับ service แล้วสร้าง handler: `NewUserHandler`, `NewAddressHandler`, `NewBrandHandler`, `NewCategoryHandler`, `NewProductHandler`, `NewProductVariantHandler`, `NewCartHandler`, `NewOrderHandler`, `NewPaymentHandler`, `NewImageHandler` ชื่อ `NewProductHanlder` ใน `product.go` เป็น alias ที่สะกดผิดของ `NewProductHandler` และไม่ได้ถูก router เรียก; เก็บไว้ตามโค้ดเดิม

หลักร่วมกันของ handler คืออ่าน path/query/body หรือ multipart, parse/validate เบื้องต้น, ขอ user ID จาก JWT เมื่อจำเป็น, เรียก service และเลือก HTTP status/JSON response **กฎธุรกิจไม่ควรไปอาศัยการตรวจเฉพาะใน handler**

| ไฟล์ `internal/adapter/inbound/http/` | ฟังก์ชันและหน้าที่ |
| --- | --- |
| `user.go` | `Register` อ่านข้อมูลสมัคร; `Login` อ่านอีเมล/รหัสแล้วคืน JWT; `GetProfile` คืนบัญชีเจ้าของ token; `UpdateProfile` แก้ชื่อหรือ URL รูป |
| `address.go` | `CreateAddress` เพิ่มที่อยู่; `GetAddresses` คืนที่อยู่ของตน; `GetAddressByID` อ่านรายการเดียว; `UpdateAddress` แก้; `DeleteAddress` ลบ |
| `brand.go` | `CreateBrand` เพิ่มแบรนด์; `GetBrandByID` อ่านรายการเดียว; `GetAllBrands` อ่านทั้งหมด; `UpdateBrand` แก้; `DeleteBrand` ลบ |
| `category.go` | `SaveCategory` เพิ่มหมวด; `ListCategories` อ่านทั้งหมด; `FindCategoryByID` อ่านรายการเดียว; `UpdateCategory` แก้; `DeleteCategory` ลบ |
| `product.go` | `CreateProduct` เพิ่มรุ่น; `ListProducts` อ่านตาม filter; `FindProductByID` อ่านรายการเดียว; `UpdateProduct` แก้; `DeleteProduct` ลบ |
| `product_variant.go` | `CreateProductVariant` เพิ่มตัวเลือกสินค้า; `GetAllProductVariants` อ่านทั้งหมด; `GetVariantsByProductID` อ่านเฉพาะรุ่น; `FindProductVariantByID` อ่านตัวเลือกเดียว; `UpdateProductVariant` แก้; `DeleteProductVariant` ลบ |
| `cart.go` | `GetCart` อ่านตะกร้า; `AddToCart` เพิ่มตัวเลือก; `UpdateCartItem` เปลี่ยนจำนวน; `RemoveCartItem` ลบรายการ; `ClearCart` ล้างทั้งตะกร้า |
| `order.go` | `CreateOrder` สั่งซื้อ; `GetMyOrders` รายการของตน; `GetOrderDetail` รายละเอียดตามสิทธิ์; `CancelMyOrder` ยกเลิกของตน; `UpdateOrderAddress` แก้ที่อยู่; `AdminGetAllOrders` ทั้งหมด; `AdminUpdateOrderStatus` เปลี่ยนสถานะ; `AdminUpdateTracking` บันทึกเลขติดตาม/สถานะ |
| `payment.go` | `CreatePayment` เริ่ม Checkout; `StripeWebhook` รับ event ดิบจาก Stripe; `GetPaymentStatus` อ่านตาม Order; `ReconcilePayment` ให้ backend ถาม Stripe ซ้ำ; `AdminGetAllPayments` รายการทั้งหมด; `AdminVerifyPayment` manual fallback |
| `image.go` | `UploadImage` ตรวจ multipart field `images`, ชนิด/ขนาด/จำนวน แล้วส่งให้ service; `UploadProfileImage` จำกัด 1 ไฟล์ก่อนใช้ `UploadImage` เดียวกัน |

`FingProductVariantByID` ใน `product_variant.go` เป็น alias สะกดผิดที่เรียก `FindProductVariantByID`; router ใช้ตัวที่สะกดถูก

## 4. Service: กฎของร้าน

### บัญชีและที่อยู่

| ไฟล์ | ฟังก์ชัน | ทำอะไร |
| --- | --- | --- |
| `user.go` | `NewUserService` | รับ `UserRepository` แล้วสร้าง service |
| | `Register` | ทำอีเมลเป็นตัวพิมพ์เล็ก, กันอีเมลซ้ำ, hash password และสร้าง role `member` |
| | `Login` | หาอีเมล, ตรวจ bcrypt แล้วออก JWT ที่มี `user_id`, `email`, `user_role`, อายุ 7 วัน |
| | `GetProfile` | ตรวจ ID, อ่าน User แล้วคืนข้อมูลที่ไม่รวมรหัสผ่าน |
| | `UpdateProfile` | ตรวจเจ้าของ token ผ่าน ID, ยอมรับชื่อหรือรูปที่ไม่ว่าง/ยาวเกิน แล้วอัปเดต |
| `address.go` | `NewAddressService` | รับ `AddressRepository` แล้วสร้าง service |
| | `CreateAddress` | จัดรูปข้อมูล, ตรวจช่องสำคัญ, สร้าง UUID แล้วบันทึกภายใต้ user |
| | `GetAddressesByUserID` | อ่านที่อยู่ทั้งหมดของ user และแปลงเป็น response |
| | `GetAddressByID` | อ่านที่อยู่เดียวและปฏิเสธหากไม่ได้เป็นเจ้าของ |
| | `UpdateAddress` | ตรวจ UUID/input/เจ้าของก่อนแก้ |
| | `DeleteAddress` | ตรวจ UUID/เจ้าของก่อนลบ |
| | `normalizeAddress` | ตัดช่องว่างหัวท้ายของฟิลด์ที่อยู่ |
| | `validateAddress` | บังคับชื่อผู้รับ, เบอร์, ที่อยู่หลัก, เขต, จังหวัด, รหัสไปรษณีย์ |

### แค็ตตาล็อก

| ไฟล์ | ฟังก์ชัน | ทำอะไร |
| --- | --- | --- |
| `brand.go` | `NewBrandSerivce` | constructor ของ BrandService; ชื่อ `Serivce` สะกดผิดตาม source |
| | `CreateBrand` | สร้างแบรนด์ใหม่ |
| | `FindBrandByID` | ตรวจ UUID แล้วอ่านแบรนด์เดียว |
| | `ListBrands` | อ่านแบรนด์ทั้งหมด |
| | `UpdateBrand` | ตรวจ ID/การมีอยู่ก่อนแก้ |
| | `DeleteBrand` | ตรวจ ID/การมีอยู่ก่อนลบและแปลง FK conflict เป็นข้อผิดพลาดที่เข้าใจได้ |
| `category.go` | `NewCategoryService` | รับ repository ของหมวดแล้วสร้าง service |
| | `SaveCategory` | สร้างหมวดใหม่ |
| | `FindCategoryByID` | อ่านหมวดเดียว |
| | `ListCategories` | อ่านหมวดทั้งหมด |
| | `UpdateCategory` | ตรวจ ID/การมีอยู่ก่อนแก้ |
| | `DeleteCategory` | ตรวจ ID/การมีอยู่ก่อนลบ |
| `product.go` | `NewProductService` | รับ ProductRepository แล้วสร้าง service |
| | `CreateProduct` | สร้าง Product ที่ผูก Category/Brand และเริ่มยอดขายเป็นศูนย์ |
| | `ListProducts` | ตรวจ filter UUID, อ่านตาม category/brand/search แล้วแปลงเป็น response |
| | `FindProduct` | อ่าน Product เดียวจาก ID |
| | `UpdateProduct` | โหลดของเดิมก่อนแก้เฉพาะค่าที่ส่งมาและไม่ว่าง |
| | `DeleteProduct` | ตรวจว่ามีอยู่ก่อนลบ; ข้อมูลที่ Order อ้างถึงอาจทำให้ลบไม่ได้ |
| `product_variant.go` | `NewProductVariantService` | รับ repository ของ Variant แล้วสร้าง service |
| | `CreateProductVariant` | แปลง `attributes` เป็น JSON, กำหนด Product/Image/ชื่อ/ราคา/สต็อก แล้วสร้าง |
| | `FindProductVariantByID` | อ่าน Variant เดียวพร้อมแปลง attributes จาก JSON |
| | `GetVariantsByProductID` | อ่านทุก Variant ของ Product ที่ระบุ |
| | `GetAllProductVariants` | อ่าน Variant ทั้งหมด |
| | `UpdateProductVariant` | โหลดข้อมูลเดิมก่อนแก้ชื่อ, รูป, ราคา, สต็อกหรือ attributes ที่ส่งมา |
| | `DeleteProductVariant` | ตรวจการมีอยู่แล้วลบ; OrderItem ที่อ้างถึงอาจทำให้ลบไม่ได้ |

### ตะกร้าและคำสั่งซื้อ

| ไฟล์ | ฟังก์ชัน | ทำอะไร |
| --- | --- | --- |
| `cart.go` | `NewCartService` | รับ Cart/Variant repositories แล้วสร้าง service |
| | `GetCart` | สร้างตะกร้าหากยังไม่มี, อ่านรายการ, รวมจำนวน/ยอดเงิน |
| | `AddToCart` | ตรวจ Variant/สต็อก แล้วเพิ่มรายการหรือบวกจำนวนเดิม |
| | `UpdateCartItem` | ตรวจว่ารายการเป็นของตะกร้าผู้ใช้และจำนวนไม่เกินสต็อก |
| | `RemoveCartItem` | ตรวจเจ้าของแล้วลบ; เรียกซ้ำกับรายการที่หายไปจะไม่ error |
| | `ClearCart` | ลบ CartItem ทั้งหมดของผู้ใช้ |
| `order.go` | `NewOrderService` | ประกอบ Order/Cart/Address/Variant/Product/Payment repositories |
| | `CreateOrder` | เลือกที่อยู่และรายการจาก `items` หรือ Cart, ตรวจสต็อก, คำนวณราคา แล้วสั่ง repository ทำ transaction |
| | `GetUserOrders` | คืนรายการ Order ของ user |
| | `GetOrderDetail` | ตรวจ ID/เจ้าของ (admin อ่านได้), รวม OrderItem กับ Payment |
| | `UpdateOrderAddress` | ให้เจ้าของแก้ที่อยู่เฉพาะ Order ที่ยัง `pending` |
| | `CancelMyOrder` | ให้เจ้าของยกเลิก Order `pending` เมื่อไม่มี Payment ที่กำลังจ่ายหรือจ่ายแล้ว |
| | `GetAllOrdersForAdmin` | อ่าน Order ทั้งหมดสำหรับ admin |
| | `UpdateOrderStatus` | ตรวจสถานะที่ขอและกฎเปลี่ยนสถานะ ก่อนสั่ง DB อัปเดต |
| | `UpdateTrackingNumber` | บันทึก tracking; ถ้าไม่ส่ง status จะใช้ `shipped` แล้วตรวจว่าการเปลี่ยนสถานะทำได้ |

### การชำระเงินและรูปภาพ

| ไฟล์ | ฟังก์ชัน | ทำอะไร |
| --- | --- | --- |
| `payment.go` | `NewPaymentService` | ประกอบ repositories, Stripe gateway และ URL ของ frontend |
| | `CreatePayment` | เช็กเจ้าของ/ยอด/สถานะ Order, ใช้ Session เดิมหรือสร้าง attempt ใหม่และเก็บ Checkout URL |
| | `HandleStripeWebhook` | ตรวจ signature/metadata, แปลงชนิด event เป็น paid/pending/failed แล้วส่งให้ repository ทำ transaction |
| | `GetPaymentByOrderID` | ตรวจสิทธิ์อ่าน Order ก่อนคืน Payment |
| | `ReconcilePayment` | ถาม Stripe เมื่อ Payment ยัง pending, ตรวจ Session/metadata แล้วปรับสถานะผ่านทางเดียวกับ webhook |
| | `GetAllPaymentsForAdmin` | อ่าน Payment ทั้งหมดและแปลงเป็น response |
| | `VerifyPayment` | manual fallback ของ admin: เปลี่ยนเป็น paid/failed โดยกันการแก้ paid และ paid ของ Order cancelled |
| | `paymentResponse` | แปลง record ภายในเป็น JSON response DTO |
| | `shortID` | เอา 8 ตัวแรกของ UUID ไปใช้ในชื่อ Checkout |
| `image.go` | `NewImageService` | รับ ImageRepository แล้วสร้าง service |
| | `UploadImage` | ตรวจชนิดไฟล์, ตั้งชื่อ UUID, อัปโหลด/บันทึก metadata ทีละรูป และ rollback รูปที่เพิ่มแล้วหากล้มเหลว |

### ตัวช่วยตรวจข้อมูล

| ฟังก์ชันใน `service/validation.go` | ทำอะไร |
| --- | --- |
| `validateUUID` | ตรวจว่า ID เป็น UUID และคืน 400 เมื่อไม่ถูกต้อง |
| `amountToCents` | แปลงจำนวนเงินเป็นหน่วยสตางค์ก่อนคำนวณ/ส่ง Stripe |
| `centsToAmount` | แปลงสตางค์กลับเป็นจำนวนเงินบาทใน response |
| `isPostgresError` | ตรวจ PostgreSQL error code |
| `isUniqueViolation` | ตรวจข้อผิดพลาด unique constraint เช่นอีเมลซ้ำ |
| `isForeignKeyViolation` | ตรวจ FK constraint เช่นอ้าง Category/Image ที่ไม่มี |

## 5. Repository: เขียนและอ่าน PostgreSQL จริง

ชื่อ package คือ `internal/adapter/outbound/neon/` แม้ DB สำหรับ local จะเป็น PostgreSQL ธรรมดาก็ใช้ repository ชุดเดียวกัน `NewNeon...Repository` ทุกตัวรับ `*sqlx.DB` แล้วคืน interface ที่ service ใช้

### ผู้ใช้และที่อยู่

| ไฟล์ | ฟังก์ชัน | ทำอะไรใน DB |
| --- | --- | --- |
| `user.go` | `NewNeonUserRepository` | สร้าง repository ของ User |
| | `Save` | `INSERT users` |
| | `FindEmail` | หา User ด้วยอีเมล รวม password hash สำหรับ Login |
| | `FindByID` | หา User ด้วย ID สำหรับ Profile |
| | `UpdateProfile` | แก้ชื่อ/รูปเฉพาะฟิลด์ที่ส่งมา |
| `address.go` | `NewNeonAddressRepository` | สร้าง repository ของ Address |
| | `Save` | เพิ่มที่อยู่; ดูแลค่า default address ให้สอดคล้องกัน |
| | `FindByUserID` | อ่านที่อยู่ทั้งหมดของ User |
| | `FindByID` | อ่านที่อยู่เดียว |
| | `Update` | แก้ที่อยู่และค่า default |
| | `Delete` | ลบที่อยู่; จัดการผลต่อ default address ตาม SQL ในไฟล์ |

### แค็ตตาล็อก

| ไฟล์ | ฟังก์ชัน | ทำอะไรใน DB |
| --- | --- | --- |
| `brand.go` | `NewNeonBrandRepository` | สร้าง repository ของ Brand |
| | `GetAll` | อ่านแบรนด์ทั้งหมด |
| | `Get` | อ่านแบรนด์ด้วย ID |
| | `Save` | เพิ่มแบรนด์ |
| | `Update` | แก้แบรนด์ |
| | `Delete` | ลบแบรนด์ |
| `category.go` | `NewNeonCategoryRepository` | สร้าง repository ของ Category |
| | `GetAll` | อ่านหมวดทั้งหมด |
| | `Get` | อ่านหมวดด้วย ID |
| | `Save` | เพิ่มหมวด |
| | `Update` | แก้หมวด |
| | `Delete` | ลบหมวด |
| `product.go` | `NewNeonProductRepository` | สร้าง repository ของ Product |
| | `Create` | เพิ่ม Product พร้อม category/brand ID |
| | `GetAll` | กรองตามหมวด, แบรนด์, คำค้น; `total_sold` อ่านจาก Order ที่ชำระแล้วและไม่ยกเลิก |
| | `Get` | อ่าน Product เดียวพร้อมยอดขายที่คำนวณจาก Order จริง |
| | `Update` | แก้ Product |
| | `Delete` | ลบ Product; FK อาจปฏิเสธหากมีข้อมูลที่อ้างถึง |
| | `IncrementSold` | เพิ่มค่า cached `products.total_sold`; ไม่ใช่แหล่งหลักของ `total_sold` ใน GET ปัจจุบัน |
| `product_variant.go` | `NewNeonProductVariantRepository` | สร้าง repository ของ Variant |
| | `Create` | เพิ่ม Variant รวมราคา, สต็อก, รูปและ JSON attributes |
| | `FindByID` | อ่าน Variant พร้อม URL รูปจากตาราง `images` |
| | `GetByProductID` | อ่านทุก Variant ของ Product เดียว |
| | `GetAll` | อ่าน Variant ทั้งหมด |
| | `Update` | แก้ Variant |
| | `Delete` | ลบ Variant |
| | `UpdateStock` | ปรับสต็อกด้วยค่า delta โดยมีเงื่อนไขไม่ให้ติดลบ; ไม่ใช่ transaction สั่งซื้อหลัก |
| | `IncrementSold` | เพิ่ม `sold_count` ของ Variant; เส้นทางสั่งซื้อหลักปรับใน Order transaction |

### ตะกร้าและคำสั่งซื้อ

| ไฟล์ | ฟังก์ชัน | ทำอะไรใน DB |
| --- | --- | --- |
| `cart.go` | `NewNeonCartRepository` | สร้าง repository ของ Cart |
| | `GetOrCreateCart` | อ่าน Cart ของ User หรือสร้างใหม่ถ้ายังไม่มี |
| | `GetCartItems` | อ่านรายการ พร้อมข้อมูล Variant/ราคา/รูปที่ใช้แสดงตะกร้า |
| | `FindCartItem` | หา item ของ Variant หนึ่งใน Cart |
| | `FindCartItemByID` | หา item จาก ID สำหรับแก้/ลบ |
| | `AddItem` | เพิ่ม CartItem |
| | `UpdateQuantity` | เปลี่ยนจำนวนของ CartItem |
| | `RemoveItem` | ลบ CartItem เดียว |
| | `ClearCart` | ลบ CartItem ทั้ง Cart |
| `order.go` | `NewNeonOrderRepository` | สร้าง repository ของ Order |
| | `Create` | ใน transaction เดียว: หักสต็อก Variant แบบมีเงื่อนไข, เพิ่ม sold count, เพิ่ม Order/OrderItem และล้าง Cart เมื่อซื้อจาก Cart |
| | `FindByID` | อ่าน Order ตาม ID |
| | `FindItemsByOrderID` | อ่าน OrderItem พร้อมชื่อ/รูปสำหรับหน้า detail |
| | `FindByUserID` | อ่านรายการ Order ของ User |
| | `FindAll` | อ่าน Order ทั้งหมดสำหรับ admin |
| | `UpdateStatus` | เปลี่ยนสถานะเมื่อค่าเดิมตรง; ถ้ายกเลิกจะล็อก Order/Payment และคืนสต็อก/ลด sold count ใน transaction |
| | `UpdateAddress` | เปลี่ยนที่อยู่ที่ฝังใน Order เฉพาะเมื่อ `pending` |
| | `UpdateTracking` | บันทึกเลขติดตามและสถานะใหม่ |

### การชำระเงิน

| ฟังก์ชันใน `neon/payment.go` | ทำอะไรใน DB |
| --- | --- |
| `NewNeonPaymentRepository` | สร้าง repository ของ Payment |
| `Create` | เพิ่ม record Payment ใหม่สำหรับ Order |
| `Retry` | เปลี่ยน Payment ที่ `failed` กลับเป็น `pending`, รีเซ็ตข้อมูล Session และเพิ่ม attempt อย่างมีเงื่อนไข |
| `AttachStripeSession` | บันทึก Stripe Session ID และ Checkout URL |
| `MarkCheckoutCreationFailed` | ทำเครื่องหมาย failed เมื่อสร้าง Checkout Session ไม่สำเร็จ |
| `FindByOrderID` | อ่าน Payment ของ Order |
| `FindByID` | อ่าน Payment ตาม ID |
| `FindAll` | อ่าน Payment ทั้งหมดสำหรับ admin |
| `ProcessStripeEvent` | transaction บันทึก event ID กันซ้ำ, ล็อก Payment, เช็ก order/session, อัปเดต Payment และเปลี่ยน Order เป็น `processing` เมื่อ paid |
| `VerifyAndUpdateOrder` | transaction สำหรับ manual fallback: ล็อก Payment/Order, เปลี่ยนสถานะและเวลา paid โดยไม่อนุมัติ Order ที่ cancelled |

`ProcessStripeEvent` อาจรับ event จาก Checkout attempt เก่าที่ล่าช้า: ถ้า Session ID ไม่ตรงกับที่เก็บอยู่ จะไม่เอา event เก่ามาทับสถานะปัจจุบัน นี่ต่างจากการรับ event ซ้ำที่เช็กด้วย event ID

## 6. Stripe และ SeaweedFS

| ไฟล์ | ฟังก์ชัน | ทำอะไร |
| --- | --- | --- |
| `internal/adapter/outbound/stripe/payment.go` | `NewPaymentGateway` | สร้าง Stripe client กับ webhook signing secret |
| | `CreateCheckoutSession` | ขอ hosted Checkout จาก Stripe เป็น THB, ใส่ Order/Payment ID ใน metadata และ idempotency key |
| | `GetCheckoutSession` | ถาม Stripe ว่า Session จ่ายแล้วหรือหมดอายุ เพื่อ reconciliation |
| | `ParseWebhook` | ตรวจลายเซ็นและ timestamp ของ raw payload แล้วแปลง Checkout event เป็นข้อมูลที่ service ใช้ |
| `internal/adapter/inbound/s3/s3.go` | `NewS3Client` | ตั้งค่า S3-compatible client สำหรับ SeaweedFS endpoint/credentials |
| | `EnsureBucket` | เช็ก bucket และสร้างถ้ายังไม่มี |
| `internal/adapter/outbound/seaweedfs/image.go` | `NewImageRepository` | สร้าง repository โดยผูก S3 client, ชื่อ bucket และ DB |
| | `UploadToSeaweed` | อัปโหลด object ไป bucket ที่กำหนดและคืน URL |
| | `SaveImageMetadata` | เพิ่ม `image_id` กับ URL path ในตาราง `images` |
| | `DeleteImage` | ลบทั้ง metadata และ object; ใช้ rollback เมื่ออัปโหลดชุดรูปไม่ครบ |

## 7. DTO, Ports และ Test

`internal/core/domain/dto/` ไม่ใช่ชั้นที่เรียก DB เป็น struct ของข้อมูล: `Req...` คือ request, `Res...` คือ response, ชื่อไม่มี prefix คือข้อมูลภายใน `port/repository/` และ `port/gateway/` เป็น interface ไม่ใช่ implementation; การไหลจริงดู service กับ adapter ด้านบน

| ฟังก์ชัน | ทำอะไร |
| --- | --- |
| `dto/order.go:OrderStatus.IsValid` | ตรวจว่าค่าเป็น pending, processing, shipped หรือ cancelled |
| `dto/order.go:CanTransitionOrderStatus` | อนุญาต pending → processing/cancelled, processing → shipped/cancelled หรือสถานะเดิม; shipped/cancelled ไปสถานะใหม่ไม่ได้ |
| `dto/payment.go:PaymentStatus.IsValidVerification` | จำกัด manual verify ให้เลือกได้เฉพาะ paid หรือ failed |

ไฟล์ test สำคัญอ่านประกอบกฎข้างบนได้: `service/order_cancel_test.go` ตรวจการยกเลิก/เจ้าของ/Checkout ที่ยัง active, `service/payment_reconcile_test.go` ตรวจ reconciliation ไม่เชื่อ metadata ผิดหรือสิทธิ์คนอื่น, `service/image_test.go` ตรวจ URL ของรูป และ `stripe/payment_test.go` ตรวจลายเซ็น webhook กับ event schema เวอร์ชันใหม่ ฟังก์ชัน stub เช่น `FindByID` ใน test เป็นตัวจำลอง repository เฉพาะ test ไม่ใช่ SQL อีกชุด

ถ้าชื่อฟังก์ชันเดียวกันอยู่หลายไฟล์ เช่น `Create`, `Get`, `Update` ให้ดู **ชื่อไฟล์และ receiver** (`orderService`, `neonOrderRepository` ฯลฯ) ประกอบเสมอ
