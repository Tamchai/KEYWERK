import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { calculateAdminPageSize } from "../utils/pagination";

const FALLBACK_ROW_HEIGHT = 72;
const FALLBACK_HEADER_HEIGHT = 48;
const FALLBACK_PAGINATION_HEIGHT = 65;

export function useAdminTablePageSize(itemCount: number) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const tallestRowRef = useRef(FALLBACK_ROW_HEIGHT);
  const panelRef = useCallback((node: HTMLDivElement | null) => setContainer(node), []);

  const measure = useCallback(() => {
    if (!container) return;

    const rows = Array.from(container.querySelectorAll<HTMLTableRowElement>("tbody tr"));
    const measuredTallestRow = rows.reduce(
      (height, row) => Math.max(height, row.getBoundingClientRect().height),
      FALLBACK_ROW_HEIGHT,
    );
    tallestRowRef.current = Math.max(tallestRowRef.current, measuredTallestRow);

    const headerHeight = container.querySelector("thead")?.getBoundingClientRect().height
      ?? FALLBACK_HEADER_HEIGHT;
    const paginationHeight = container.querySelector(".admin-pagination")?.getBoundingClientRect().height
      ?? FALLBACK_PAGINATION_HEIGHT;
    const nextPageSize = calculateAdminPageSize({
      containerHeight: container.clientHeight,
      headerHeight,
      rowHeight: tallestRowRef.current,
      paginationHeight,
      itemCount,
    });

    setPageSize((current) => current === nextPageSize ? current : nextPageSize);
  }, [container, itemCount]);

  useLayoutEffect(measure);

  useLayoutEffect(() => {
    if (!container) return;
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [container, measure]);

  return { panelRef, pageSize };
}
