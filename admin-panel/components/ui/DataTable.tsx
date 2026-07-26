import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  emptyMessage = "Tidak ada data",
}: {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-sm text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-sm text-gray-700 ${col.className ?? ""}`}
                  >
                    {col.render
                      ? col.render(row)
                      : (row as Record<string, ReactNode>)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({
  page,
  total,
  limit,
  onPageChange,
}: {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-sm text-gray-500">
        Halaman {page} dari {totalPages} ({total} total)
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-md border px-3 py-1.5 text-sm font-medium text-gray-700 disabled:opacity-40 hover:bg-gray-50"
        >
          Sebelumnya
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-md border px-3 py-1.5 text-sm font-medium text-gray-700 disabled:opacity-40 hover:bg-gray-50"
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}
