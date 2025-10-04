import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

const alignmentClass = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right'
} as const;

const DataTable = <T,>({ columns, data, emptyMessage = 'No records found.' }: DataTableProps<T>) => (
  <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
    <table className="min-w-full divide-y divide-slate-800">
      <thead className="bg-slate-900/80">
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 ${
                alignmentClass[column.align ?? 'left']
              }`}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800">
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-slate-500">
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-800/40">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 text-sm text-slate-200 ${alignmentClass[column.align ?? 'left']}`}
                >
                  {column.render ? column.render(row) : (row as any)[column.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default DataTable;
