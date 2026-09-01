import type { Brand, Category, DisplayProduct, Product, ProductVariant } from "../api/types";
import { formatPriceTHB } from "./format";
import { resolveProductImage } from "./image";

export function buildDisplayProducts(
  products: Product[],
  variants: ProductVariant[],
  brands: Brand[],
  categories: Category[],
): DisplayProduct[] {
  const brandMap = new Map(brands.map((brand) => [brand.id, brand.name]));
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));

  const variantsByProduct = variants.reduce<Map<string, ProductVariant[]>>((map, variant) => {
    const list = map.get(variant.product_id) ?? [];
    list.push(variant);
    map.set(variant.product_id, list);
    return map;
  }, new Map());

  return products.map((product) => {
    const productVariants = variantsByProduct.get(product.product_id) ?? [];
    const cheapestVariant = productVariants.reduce<ProductVariant | undefined>((best, current) => {
      if (!best || current.price < best.price) return current;
      return best;
    }, undefined);

    return {
      id: product.product_id,
      image: resolveProductImage(product, productVariants),
      category: categoryMap.get(product.category_id) ?? "",
      brand: brandMap.get(product.brand_id),
      name: product.product_name,
      price: cheapestVariant ? formatPriceTHB(cheapestVariant.price) : "—",
      href: `/product/${product.product_id}`,
    };
  });
}

export function findCategoryId(categories: Category[], name: string) {
  const normalized = name.trim().toLowerCase();
  return categories.find((category) => category.name.trim().toLowerCase() === normalized)?.id;
}
