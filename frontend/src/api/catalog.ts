import { apiFetch } from "./client";
import type { Brand, Category, Product, ProductVariant } from "./types";

interface CategoryResponse {
  category_id: string;
  category_name: string;
}

interface BrandResponse {
  brand_id: string;
  brand_name: string;
}

export function listCategories() {
  return apiFetch<CategoryResponse[]>("/categories").then((categories): Category[] =>
    categories.map((category) => ({ id: category.category_id, name: category.category_name })),
  );
}

export function listBrands() {
  return apiFetch<BrandResponse[]>("/brands").then((brands): Brand[] =>
    brands.map((brand) => ({ id: brand.brand_id, name: brand.brand_name })),
  );
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
