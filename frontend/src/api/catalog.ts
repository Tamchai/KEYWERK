import { apiFetch } from "./client";
import type { Brand, Category, Product, ProductVariant } from "./types";

export function listCategories() {
  return apiFetch<Category[]>("/categories");
}

export function listBrands() {
  return apiFetch<Brand[]>("/brands");
}

export function listProducts(params?: {
  category_id?: string;
  brand_id?: string;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params?.category_id) query.set("category_id", params.category_id);
  if (params?.brand_id) query.set("brand_id", params.brand_id);
  if (params?.search) query.set("search", params.search);

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiFetch<Product[]>(`/products${suffix}`);
}

export function getProduct(productId: string) {
  return apiFetch<Product>(`/products/${productId}`);
}

export function getProductVariants(productId: string) {
  return apiFetch<ProductVariant[]>(`/product-variants/product/${productId}`);
}

export function listProductVariants() {
  return apiFetch<ProductVariant[]>("/product-variants");
}
