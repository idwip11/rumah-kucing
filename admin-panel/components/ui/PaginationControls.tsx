interface PaginationControlsProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: PaginationControlsProps) {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-1 py-2 text-sm text-gray-500">
      <span>
        Showing {start}–{end} of {total.toLocaleString()} results
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-2.5 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ‹
        </button>
        <span className="px-3 py-1 text-gray-700 font-medium">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-2.5 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ›
        </button>
      </div>
    </div>
  );
}
