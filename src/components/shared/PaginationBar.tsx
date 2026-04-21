import type { Pagination } from "@/src/api/types";

interface Props {
  pagination: Pagination | null;
  totalFiltered: number;
  onPageChange: (page: number) => void;
  label?: string;
}

export default function PaginationBar({ pagination, totalFiltered, onPageChange, label = "items" }: Props) {
  if (!pagination) return (
    <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-600">
      Showing {totalFiltered} {label}
    </div>
  );

  const { page, page_size, total_count, total_pages, has_next, has_previous } = pagination;

  return (
    <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 flex-wrap">
      <span className="text-xs text-gray-400 dark:text-gray-600">
        Showing {total_count === 0 ? 0 : (page - 1) * page_size + 1}–{Math.min(page * page_size, total_count)} of {total_count} {label}
      </span>
      {total_pages > 1 && (
        <div className="flex items-center gap-1">
          <button onClick={() => onPageChange(page - 1)} disabled={!has_previous}
            className="px-2.5 py-1 rounded text-xs border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            ‹ Prev
          </button>
          {Array.from({ length: total_pages }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => onPageChange(n)}
              className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                n === page
                  ? "bg-violet-600 border-violet-600 text-white"
                  : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}>
              {n}
            </button>
          ))}
          <button onClick={() => onPageChange(page + 1)} disabled={!has_next}
            className="px-2.5 py-1 rounded text-xs border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Next ›
          </button>
        </div>
      )}
    </div>
  );
}
