import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminPaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
}

type PageItem = number | "start-gap" | "end-gap";

function visiblePageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "end-gap", totalPages];
  if (page >= totalPages - 3) {
    return [1, "start-gap", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "start-gap", page - 1, page, page + 1, "end-gap", totalPages];
}

export function AdminPagination({ page, pageSize, totalItems, totalPages, startIndex, endIndex, onPageChange }: AdminPaginationProps) {
  if (totalItems <= pageSize) return null;

  return (
    <nav className="admin-pagination flex items-center justify-between border-t border-[var(--line)] bg-black/15 px-4 py-3" aria-label="แบ่งหน้ารายการ">
      <p className="text-xs text-[var(--text-dim)]">แสดง {startIndex}–{endIndex} จาก {totalItems} รายการ</p>
      <div className="flex items-center gap-1">
        <button className="grid h-9 w-9 place-items-center border border-[var(--line)] bg-transparent text-[var(--text-dim)] disabled:opacity-30" type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)} aria-label="หน้าก่อนหน้า"><ChevronLeft size={16} /></button>
        {visiblePageItems(page, totalPages).map((item) => typeof item === "number" ? (
            <button
              className={`h-9 min-w-9 border px-2 text-xs font-bold ${item === page ? "border-[var(--accent)] bg-[var(--accent)] text-[#18140a]" : "border-[var(--line)] bg-transparent text-[var(--text-dim)] hover:border-[var(--line-bright)] hover:text-[var(--text)]"}`}
              type="button"
              key={item}
              onClick={() => onPageChange(item)}
              aria-current={item === page ? "page" : undefined}
            >
              {item}
            </button>
          ) : (
            <span key={item} className="grid h-9 min-w-7 place-items-center text-xs text-[var(--text-dim)]" aria-hidden="true">…</span>
          ))}
        <button className="grid h-9 w-9 place-items-center border border-[var(--line)] bg-transparent text-[var(--text-dim)] disabled:opacity-30" type="button" disabled={page === totalPages} onClick={() => onPageChange(page + 1)} aria-label="หน้าถัดไป"><ChevronRight size={16} /></button>
      </div>
    </nav>
  );
}
