export function paginateItems<T>(items: readonly T[], requestedPage: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    totalItems: items.length,
    totalPages,
    startIndex: items.length === 0 ? 0 : start + 1,
    endIndex: Math.min(start + pageSize, items.length),
  };
}

interface AdminPageSizeInput {
  containerHeight: number;
  headerHeight: number;
  rowHeight: number;
  paginationHeight: number;
  itemCount: number;
}

export function calculateAdminPageSize({
  containerHeight,
  headerHeight,
  rowHeight,
  paginationHeight,
  itemCount,
}: AdminPageSizeInput) {
  const safeRowHeight = Math.max(1, rowHeight);
  const availableWithoutPagination = Math.max(0, containerHeight - headerHeight - 2);
  const rowsWithoutPagination = Math.max(1, Math.floor(availableWithoutPagination / safeRowHeight));

  if (itemCount <= rowsWithoutPagination) return Math.max(1, itemCount);

  const availableWithPagination = Math.max(0, availableWithoutPagination - paginationHeight);
  return Math.max(1, Math.floor(availableWithPagination / safeRowHeight));
}
