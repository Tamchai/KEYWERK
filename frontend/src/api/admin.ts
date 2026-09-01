import { apiFetch } from "./client";
import type { MessageResponse, ProductVariant } from "./types";

export interface ProductPayload {
  category_id: string;
  brand_id: string;
  product_name: string;
  description?: string;
}

export interface ProductVariantPayload {
  product_id: string;
  image_id?: string;
  variant_name: string;
  stock?: number;
  price: number;
  attributes?: Record<string, unknown>;
}

export interface BrandPayload {
  name: string;
}

export interface CategoryPayload {
  name: string;
}

export interface UploadedImage {
  image_id: string;
  image_url: string;
}

// ─── Products ────────────────────────────────────────────────────────────────

export function adminCreateProduct(payload: ProductPayload) {
  return apiFetch<MessageResponse>("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function adminUpdateProduct(productId: string, payload: Partial<ProductPayload>) {
  return apiFetch<MessageResponse>(`/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function adminDeleteProduct(productId: string) {
  return apiFetch<MessageResponse>(`/products/${productId}`, {
    method: "DELETE",
  });
}

// ─── Product Variants ────────────────────────────────────────────────────────

export function listProductVariants() {
  return apiFetch<ProductVariant[]>("/product-variants");
}

export function adminCreateProductVariant(payload: ProductVariantPayload) {
  return apiFetch<MessageResponse>("/product-variants", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function adminUpdateProductVariant(
  variantId: string,
  payload: Partial<ProductVariantPayload>,
) {
  return apiFetch<MessageResponse>(`/product-variants/${variantId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function adminDeleteProductVariant(variantId: string) {
  return apiFetch<MessageResponse>(`/product-variants/${variantId}`, {
    method: "DELETE",
  });
}

// ─── Brands ──────────────────────────────────────────────────────────────────

export function adminCreateBrand(payload: BrandPayload) {
  return apiFetch<MessageResponse>("/brands", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function adminUpdateBrand(brandId: string, payload: BrandPayload) {
  return apiFetch<MessageResponse>(`/brands/${brandId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function adminDeleteBrand(brandId: string) {
  return apiFetch<MessageResponse>(`/brands/${brandId}`, {
    method: "DELETE",
  });
}

// ─── Categories ──────────────────────────────────────────────────────────────

export function adminCreateCategory(payload: CategoryPayload) {
  return apiFetch<MessageResponse>("/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function adminUpdateCategory(categoryId: string, payload: CategoryPayload) {
  return apiFetch<MessageResponse>(`/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function adminDeleteCategory(categoryId: string) {
  return apiFetch<MessageResponse>(`/categories/${categoryId}`, {
    method: "DELETE",
  });
}

// ─── Upload ──────────────────────────────────────────────────────────────────

export async function adminUploadImage(file: File): Promise<UploadedImage> {
  const { useAuthStore } = await import("../stores/authStore");
  const token = useAuthStore.getState().token;

  const formData = new FormData();
  formData.append("file", file);

  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`/api/v1/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message || `อัปโหลดไม่สำเร็จ (${response.status})`);
  }

  const data = await response.json();
  const list = data?.data;
  if (Array.isArray(list) && list.length > 0) {
    return list[0] as UploadedImage;
  }
  throw new Error("อัปโหลดไม่สำเร็จ: ไม่ได้รับข้อมูลรูป");
}
