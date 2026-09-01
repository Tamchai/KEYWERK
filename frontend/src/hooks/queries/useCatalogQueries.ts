import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listCategories,
  listBrands,
  listProducts,
  listProductVariants,
  getProduct,
  getProductVariants,
} from "../../api/catalog";
import {
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminCreateProductVariant,
  adminUpdateProductVariant,
  adminDeleteProductVariant,
  adminCreateBrand,
  adminUpdateBrand,
  adminDeleteBrand,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  listProductVariants as adminListProductVariants,
} from "../../api/admin";
import type { ProductPayload, ProductVariantPayload, BrandPayload, CategoryPayload } from "../../api/admin";
import { buildDisplayProducts } from "../../utils/catalog";
import type { DisplayProduct } from "../../api/types";

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const queryKeys = {
  categories: ["categories"] as const,
  brands: ["brands"] as const,
  products: (params?: { category_id?: string; search?: string }) =>
    ["products", params] as const,
  productVariants: ["productVariants"] as const,
  productDetail: (id: string) => ["product", id] as const,
  productVariantsByProduct: (id: string) => ["productVariants", id] as const,
  cart: ["cart"] as const,
};

// ─── Shared Data Queries ─────────────────────────────────────────────────────

export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: listCategories,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBrandsQuery() {
  return useQuery({
    queryKey: queryKeys.brands,
    queryFn: listBrands,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductVariantsQuery() {
  return useQuery({
    queryKey: queryKeys.productVariants,
    queryFn: listProductVariants,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Display Products Query ──────────────────────────────────────────────────

interface UseDisplayProductsOptions {
  categoryName?: string;
  search?: string;
  limit?: number;
  sortBySold?: boolean;
}

export function useDisplayProductsQuery(options: UseDisplayProductsOptions = {}) {
  const { categoryName, search, limit, sortBySold = false } = options;

  const categoriesQuery = useCategoriesQuery();
  const brandsQuery = useBrandsQuery();
  const variantsQuery = useProductVariantsQuery();

  const categories = categoriesQuery.data ?? [];
  const brands = brandsQuery.data ?? [];
  const variants = variantsQuery.data ?? [];

  const categoryId = categoryName
    ? categories.find(
        (c) => c.name.trim().toLowerCase() === categoryName.trim().toLowerCase(),
      )?.id
    : undefined;

  const productsQuery = useQuery({
    queryKey: queryKeys.products({ category_id: categoryId, search: search?.trim() || undefined }),
    queryFn: () =>
      listProducts({
        category_id: categoryId,
        search: search?.trim() || undefined,
      }),
    enabled: categoriesQuery.isSuccess && brandsQuery.isSuccess && variantsQuery.isSuccess,
    staleTime: 2 * 60 * 1000,
  });

  const isLoading =
    categoriesQuery.isLoading || brandsQuery.isLoading || variantsQuery.isLoading || productsQuery.isLoading;
  const isError = categoriesQuery.isError || brandsQuery.isError || variantsQuery.isError || productsQuery.isError;
  const error = categoriesQuery.error || brandsQuery.error || variantsQuery.error || productsQuery.error;

  let displayProducts: DisplayProduct[] = [];
  if (productsQuery.data) {
    displayProducts = buildDisplayProducts(productsQuery.data, variants, brands, categories);

    if (sortBySold) {
      displayProducts = [...displayProducts].sort((a, b) => {
        const soldA = productsQuery.data.find((p) => p.product_id === a.id)?.total_sold ?? 0;
        const soldB = productsQuery.data.find((p) => p.product_id === b.id)?.total_sold ?? 0;
        return soldB - soldA;
      });
    }

    if (limit && limit > 0) {
      displayProducts = displayProducts.slice(0, limit);
    }
  }

  return {
    products: displayProducts,
    isLoading,
    isError,
    error: error instanceof Error ? error.message : null,
  };
}

// ─── Product Detail Query ────────────────────────────────────────────────────

export function useProductDetailQuery(productId: string | undefined) {
  const productQuery = useQuery({
    queryKey: queryKeys.productDetail(productId ?? ""),
    queryFn: () => getProduct(productId!),
    enabled: Boolean(productId),
    staleTime: 5 * 60 * 1000,
  });

  const variantsQuery = useQuery({
    queryKey: queryKeys.productVariantsByProduct(productId ?? ""),
    queryFn: () => getProductVariants(productId!),
    enabled: Boolean(productId) && productQuery.isSuccess,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const categoriesQuery = useCategoriesQuery();
  const brandsQuery = useBrandsQuery();

  return {
    product: productQuery.data ?? null,
    variants: variantsQuery.data ?? [],
    categories: categoriesQuery.data ?? [],
    brands: brandsQuery.data ?? [],
    isLoading:
      productQuery.isLoading ||
      variantsQuery.isLoading ||
      categoriesQuery.isLoading ||
      brandsQuery.isLoading,
    isError: productQuery.isError,
    error: productQuery.error?.message || null,
  };
}

// ─── Admin Mutations ─────────────────────────────────────────────────────────

export function useAdminProductsQuery() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.products({}) });
  };

  return {
    createProduct: useMutation({
      mutationFn: (payload: ProductPayload) => adminCreateProduct(payload),
      onSuccess: invalidate,
    }),
    updateProduct: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: Partial<ProductPayload> }) =>
        adminUpdateProduct(id, payload),
      onSuccess: invalidate,
    }),
    deleteProduct: useMutation({
      mutationFn: (id: string) => adminDeleteProduct(id),
      onSuccess: invalidate,
    }),
    productsQuery: useQuery({
      queryKey: queryKeys.products({}),
      queryFn: () => listProducts(),
      staleTime: 30 * 1000,
    }),
  };
}

export function useAdminBrandsQuery() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.brands });
  };

  return {
    createBrand: useMutation({
      mutationFn: (payload: BrandPayload) => adminCreateBrand(payload),
      onSuccess: invalidate,
    }),
    updateBrand: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: BrandPayload }) =>
        adminUpdateBrand(id, payload),
      onSuccess: invalidate,
    }),
    deleteBrand: useMutation({
      mutationFn: (id: string) => adminDeleteBrand(id),
      onSuccess: invalidate,
    }),
    brandsQuery: useBrandsQuery(),
  };
}

export function useAdminCategoriesQuery() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.categories });
  };

  return {
    createCategory: useMutation({
      mutationFn: (payload: CategoryPayload) => adminCreateCategory(payload),
      onSuccess: invalidate,
    }),
    updateCategory: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: CategoryPayload }) =>
        adminUpdateCategory(id, payload),
      onSuccess: invalidate,
    }),
    deleteCategory: useMutation({
      mutationFn: (id: string) => adminDeleteCategory(id),
      onSuccess: invalidate,
    }),
    categoriesQuery: useCategoriesQuery(),
  };
}

export function useAdminProductVariantsQuery() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.productVariants });
  };

  return {
    createVariant: useMutation({
      mutationFn: (payload: ProductVariantPayload) => adminCreateProductVariant(payload),
      onSuccess: invalidate,
    }),
    updateVariant: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: Partial<ProductVariantPayload> }) =>
        adminUpdateProductVariant(id, payload),
      onSuccess: invalidate,
    }),
    deleteVariant: useMutation({
      mutationFn: (id: string) => adminDeleteProductVariant(id),
      onSuccess: invalidate,
    }),
    variantsQuery: useQuery({
      queryKey: queryKeys.productVariants,
      queryFn: adminListProductVariants,
      staleTime: 30 * 1000,
    }),
    productsQuery: useQuery({
      queryKey: queryKeys.products({}),
      queryFn: () => listProducts(),
      staleTime: 30 * 1000,
    }),
  };
}
