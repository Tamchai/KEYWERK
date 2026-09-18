import { useEffect, useMemo, useState } from "react";
import { paginateItems } from "../utils/pagination";

export function usePagination<T>(items: readonly T[], pageSize = 10, resetKey = "") {
  const [requestedPage, setPage] = useState(1);
  const pagination = useMemo(
    () => paginateItems(items, requestedPage, pageSize),
    [items, pageSize, requestedPage],
  );

  useEffect(() => setPage(1), [resetKey]);
  useEffect(() => {
    if (requestedPage !== pagination.page) setPage(pagination.page);
  }, [pagination.page, requestedPage]);

  return { ...pagination, setPage };
}
