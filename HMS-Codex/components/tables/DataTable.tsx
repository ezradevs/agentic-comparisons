'use client';
import styles from './DataTable.module.css';
import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => ReactNode;
}

interface Props<T> {
  data: T[];
  columns: Array<Column<T>>;
  getRowKey?: (row: T, index: number) => string;
  emptyState?: ReactNode;
  footer?: ReactNode;
}

export function DataTable<T>({ data, columns, getRowKey, emptyState, footer }: Props<T>) {
  if (!data.length) {
    return <div className={styles.emptyState}>{emptyState ?? 'No records found.'}</div>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={{ width: column.width, textAlign: column.align ?? 'left' }}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={getRowKey ? getRowKey(row, index) : (row as unknown as { id?: string }).id ?? index}>
              {columns.map((column) => (
                <td key={column.key} style={{ textAlign: column.align ?? 'left' }}>
                  {column.render ? column.render(row) : (row as Record<string, ReactNode>)[column.key] ?? null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer ? <tfoot><tr><td colSpan={columns.length}>{footer}</td></tr></tfoot> : null}
      </table>
    </div>
  );
}
