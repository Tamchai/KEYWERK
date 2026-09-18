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

export interface BrandPayload { name: string }
export interface CategoryPayload { name: string }
export interface UploadedImage { image_id: string; image_url: string }

export function adminCreateProduct(payload: ProductPayload) {
  return apiFetch<MessageResponse>("/products", { method: "POST", body: JSON.stringify(payload) });
}

export function adminUpdateProduct(productId: string, payload: Partial<ProductPayload>) {
  return apiFetch<MessageResponse>(`/products/${productId}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function adminDeleteProduct(productId: string) {
  return apiFetch<void>(`/products/${productId}`, { method: "DELETE" });
}

export function listProductVariants() {
  return apiFetch<ProductVariant[]>("/product-variants");
}

export function adminCreateProductVariant(payload: ProductVariantPayload) {
  return apiFetch<MessageResponse>("/product-variants", { method: "POST", body: JSON.stringify(payload) });
}

export function adminUpdateProductVariant(variantId: string, payload: Partial<ProductVariantPayload>) {
  return apiFetch<MessageResponse>(`/product-variants/${variantId}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function adminDeleteProductVariant(variantId: string) {
  return apiFetch<void>(`/product-variants/${variantId}`, { method: "DELETE" });
}

export function adminCreateBrand(payload: BrandPayload) {
  return apiFetch<MessageResponse>("/brands", { method: "POST", body: JSON.stringify({ brand_name: payload.name }) });
}

export function adminUpdateBrand(brandId: string, payload: BrandPayload) {
  return apiFetch<MessageResponse>(`/brands/${brandId}`, { method: "PATCH", body: JSON.stringify({ brand_name: payload.name }) });
}

export function adminDeleteBrand(brandId: string) {
  return apiFetch<void>(`/brands/${brandId}`, { method: "DELETE" });
}

export function adminCreateCategory(payload: CategoryPayload) {
  return apiFetch<MessageResponse>("/categories", { method: "POST", body: JSON.stringify({ category_name: payload.name }) });
}

export function adminUpdateCategory(categoryId: string, payload: CategoryPayload) {
  return apiFetch<MessageResponse>(`/categories/${categoryId}`, { method: "PATCH", body: JSON.stringify({ category_name: payload.name }) });
}

export function adminDeleteCategory(categoryId: string) {
  return apiFetch<void>(`/categories/${categoryId}`, { method: "DELETE" });
}

export async function adminUploadImage(file: File): Promise<UploadedImage> {
  const formData = new FormData();
  formData.append("images", file);

  const images = await apiFetch<UploadedImage[]>("/upload", { method: "POST", body: formData });
  if (images.length === 0) {
    throw new Error("อัปโหลดไม่สำเร็จ: ไม่ได้รับข้อมูลรูปภาพ");
  }
  return images[0];
}
