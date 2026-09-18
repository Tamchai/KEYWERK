import { useAuthStore } from "../stores/authStore";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

const knownMessages: Array<[RegExp, string]> = [
  [/invalid email or password/i, "อีเมลหรือรหัสผ่านไม่ถูกต้อง"],
  [/email already exists/i, "อีเมลนี้ถูกใช้งานแล้ว"],
  [/not enough stock|insufficient stock/i, "สินค้าในคลังมีไม่เพียงพอ"],
  [/cart is empty/i, "ไม่มีสินค้าในตะกร้า"],
  [/already been submitted/i, "ส่งข้อมูลการชำระเงินสำหรับคำสั่งซื้อนี้แล้ว"],
  [/payment amount must match/i, "ยอดชำระเงินไม่ตรงกับยอดคำสั่งซื้อ"],
  [/access denied|modification denied|deletion denied/i, "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้"],
  [/not found/i, "ไม่พบข้อมูลที่ต้องการ"],
  [/invalid .*id|must be a uuid/i, "รหัสข้อมูลไม่ถูกต้อง"],
  [/invalid order status|cannot change order status/i, "ไม่สามารถเปลี่ยนเป็นสถานะที่เลือกได้"],
  [/required|incomplete|invalid request/i, "กรุณาตรวจสอบข้อมูลที่กรอก"],
];

function localizeError(status: number, message?: string) {
  if (message) {
    const known = knownMessages.find(([pattern]) => pattern.test(message));
    if (known) return known[1];
  }
  if (status === 401) return "กรุณาเข้าสู่ระบบอีกครั้ง";
  if (status === 403) return "คุณไม่มีสิทธิ์ดำเนินการนี้";
  if (status >= 500) return "ระบบขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง";
  return message || `ดำเนินการไม่สำเร็จ (${status})`;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { auth = true, headers: initHeaders, ...rest } = options;

  const headers = new Headers(initHeaders);
  if (!headers.has("Content-Type") && rest.body && !(rest.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = useAuthStore.getState().token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...rest, headers });
  } catch (error) {
    throw new ApiError(0, error instanceof DOMException && error.name === "AbortError"
      ? "ยกเลิกคำขอแล้ว"
      : "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่อีกครั้ง");
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      message?: string;
      error?: string;
    };
    if (response.status === 401 && auth) {
      useAuthStore.getState().logout();
    }
    throw new ApiError(
      response.status,
      localizeError(response.status, body.message || body.error),
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
