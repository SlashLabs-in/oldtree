import React from "react";
import { Button } from "@/components/ui/button";

export interface Column<T> {
  header: string;
  render: (row: T) => React.ReactNode;
}

interface AppTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;

  // search
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;

  // pagination
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;

  // empty
  emptyMessage?: string;
  onAddFirst?: () => void;
  addLabel?: string;
}

export default function AppTable<T>({
  data,
  columns,
  loading,

  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",

  page = 1,
  totalPages = 1,
  onPageChange,

  emptyMessage = "No data",
  onAddFirst,
  addLabel = "Add",
}: AppTableProps<T>) {
  return (
    <>
   
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">Loading...</div>
        ) : data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {columns.map((col, i) => (
                    <th key={i} className="px-5 py-3 text-left text-xs font-semibold">
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 group">
                    {columns.map((col, j) => (
                      <td key={j} className="px-5 py-4">
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center">
            <p>{emptyMessage}</p>
            {onAddFirst && (
              <Button onClick={onAddFirst} className="mt-3">
                {addLabel}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 📄 Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex justify-between mt-4">
          <p className="text-sm">
            Page {page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}