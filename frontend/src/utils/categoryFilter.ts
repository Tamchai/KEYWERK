import type { Category } from "../api/types";

export interface CategoryFilter {
  categoryId?: string;
  canQuery: boolean;
}

export function resolveCategoryFilter(
  categoryName: string | undefined,
  categories: Category[],
): CategoryFilter {
  const normalizedName = categoryName?.trim().toLowerCase();
  const categoryId = normalizedName
    ? categories.find((category) => category.name.trim().toLowerCase() === normalizedName)?.id
    : undefined;

  return {
    categoryId,
    canQuery: !normalizedName || Boolean(categoryId),
  };
}
