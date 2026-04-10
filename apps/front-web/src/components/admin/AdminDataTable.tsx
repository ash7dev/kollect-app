'use client';

import { ReactNode } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  width?: string | number;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  actions?: (item: T) => ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function AdminDataTable<T extends { id: string | number }>({
  columns,
  data,
  actions,
  isLoading,
  emptyMessage = "Aucune donnée disponible.",
}: AdminDataTableProps<T>) {
  return (
    <div style={{
      width: '100%',
      background: '#fff',
      borderRadius: 16,
      border: '1px solid rgba(0,0,0,0.06)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
      overflow: 'hidden',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: 14,
        }}>
          <thead>
            <tr style={{ background: '#F8F9FA', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              {columns.map((column, i) => (
                <th
                  key={i}
                  style={{
                    padding: '16px 24px',
                    fontWeight: 600,
                    color: 'rgba(0,0,0,0.45)',
                    textTransform: 'uppercase',
                    fontSize: 11,
                    letterSpacing: '0.5px',
                    width: column.width,
                  }}
                >
                  {column.header}
                </th>
              ))}
              {actions && (
                <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600, color: 'rgba(0,0,0,0.45)', fontSize: 11, textTransform: 'uppercase' }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} style={{ padding: '48px', textAlign: 'center' }}>
                  <div className="spinner-center" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} style={{ padding: '48px', textAlign: 'center', color: 'rgba(0,0,0,0.4)' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: rowIndex === data.length - 1 ? 'none' : '1px solid rgba(0,0,0,0.03)',
                    transition: 'background 0.2s',
                  }}
                  className="table-row-hover"
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} style={{ padding: '16px 24px', color: '#111', verticalAlign: 'middle' }}>
                      {typeof column.accessor === 'function'
                        ? column.accessor(item)
                        : (item[column.accessor] as ReactNode)}
                    </td>
                  ))}
                  {actions && (
                    <td style={{ padding: '16px 24px', textAlign: 'right', verticalAlign: 'middle' }}>
                      {actions(item)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .table-row-hover:hover {
          background-color: rgba(0,0,0,0.01);
        }
        .spinner-center {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(0,0,0,0.05);
          border-top-color: #FF3B30;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
