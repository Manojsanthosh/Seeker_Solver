import React from 'react';
import { cn } from '../../lib/utils';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  renderMobileCard?: (item: T) => React.ReactNode;
  emptyState?: React.ReactNode;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  renderMobileCard,
  emptyState,
  onRowClick,
  className,
}: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop / Tablet Table View (hidden on small screens) */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} scope="col" className={cn('px-6 py-4', col.className)}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={cn(
                    'transition-colors hover:bg-slate-50/80',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((col, idx) => (
                    <td key={idx} className={cn('px-6 py-4 text-slate-700', col.className)}>
                      {col.cell
                        ? col.cell(item)
                        : col.accessorKey
                        ? (item[col.accessorKey] as unknown as React.ReactNode)
                        : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List View (visible on < md screens) */}
      <div className="md:hidden space-y-3">
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            onClick={() => onRowClick && onRowClick(item)}
            className={cn(
              'rounded-2xl border border-slate-200/90 bg-white p-4 shadow-card text-left transition-all',
              onRowClick && 'active:scale-[0.99] cursor-pointer'
            )}
          >
            {renderMobileCard ? (
              renderMobileCard(item)
            ) : (
              <div className="space-y-2">
                {columns.map((col, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-500 text-xs">{col.header}:</span>
                    <span className="text-slate-800 text-right">
                      {col.cell
                        ? col.cell(item)
                        : col.accessorKey
                        ? (item[col.accessorKey] as unknown as React.ReactNode)
                        : null}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
