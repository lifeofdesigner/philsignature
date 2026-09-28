import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Download,
  SlidersHorizontal,
  Search,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface Column<T> {
  key: string;
  header: string;
  accessor: (item: T) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (item: T) => string | number;
  width?: string;
}

export interface BulkAction<T> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'dark' | 'luxury' | 'outline' | 'ghost' | 'destructive';
  action: (selectedItems: T[]) => void | Promise<void>;
}

export interface EnterpriseDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  searchPlaceholder?: string;
  bulkActions?: BulkAction<T>[];
  exportFilename?: string;
  defaultSortKey?: string;
  emptyMessage?: string;
  pageSize?: number;
}

export function EnterpriseDataTable<T>({
  data,
  columns,
  keyExtractor,
  searchPlaceholder = 'Search records...',
  bulkActions = [],
  exportFilename = 'export.csv',
  defaultSortKey,
  emptyMessage = 'No matching records found.',
  pageSize: initialPageSize = 10,
}: EnterpriseDataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | undefined>(defaultSortKey);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map((c) => c.key))
  );
  const [showColPicker, setShowColPicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Search filtering
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((item) =>
      columns.some((col) => {
        const val = col.sortValue ? col.sortValue(item) : col.accessor(item);
        return String(val || '').toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filteredData;

    return [...filteredData].sort((a, b) => {
      const valA = col.sortValue ? col.sortValue(a) : String(col.accessor(a) || '');
      const valB = col.sortValue ? col.sortValue(b) : String(col.accessor(b) || '');

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDirection, columns]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Selection
  const allPaginatedSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedIds.has(keyExtractor(item)));

  const toggleSelectAll = () => {
    const next = new Set(selectedIds);
    if (allPaginatedSelected) {
      paginatedData.forEach((item) => next.delete(keyExtractor(item)));
    } else {
      paginatedData.forEach((item) => next.add(keyExtractor(item)));
    }
    setSelectedIds(next);
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // CSV Export
  const handleExportCSV = () => {
    const activeCols = columns.filter((c) => visibleColumns.has(c.key));
    const headers = activeCols.map((c) => `"${c.header}"`).join(',');
    const rows = sortedData.map((item) =>
      activeCols
        .map((c) => {
          const val = c.sortValue ? c.sortValue(item) : String(c.accessor(item) || '');
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportFilename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectedItems = useMemo(
    () => data.filter((item) => selectedIds.has(keyExtractor(item))),
    [data, selectedIds, keyExtractor]
  );

  return (
    <div className="space-y-3">
      {/* Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 text-xs border-slate-300 focus:border-slate-900 focus:ring-slate-900 bg-white font-medium text-black placeholder:text-black"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Column Visibility Picker */}
          <div className="relative">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowColPicker(!showColPicker)}
              className="text-xs border-slate-300 text-black hover:bg-slate-100 gap-1.5 font-medium"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-black" />
              <span>Columns</span>
            </Button>

            {showColPicker && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-2 space-y-1 animate-fade-in">
                <div className="text-[10px] font-bold text-black uppercase tracking-wider px-2 py-1">
                  Toggle Columns
                </div>
                {columns.map((col) => {
                  const isVisible = visibleColumns.has(col.key);
                  return (
                    <button
                      key={col.key}
                      onClick={() => {
                        const next = new Set(visibleColumns);
                        if (isVisible && next.size > 1) next.delete(col.key);
                        else next.add(col.key);
                        setVisibleColumns(next);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-black hover:bg-slate-100 rounded-lg text-left"
                    >
                      <span>{col.header}</span>
                      {isVisible && <Check className="h-3.5 w-3.5 text-black font-bold" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Export CSV Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="text-xs border-slate-300 text-black hover:bg-slate-100 gap-1.5 font-medium"
          >
            <Download className="h-3.5 w-3.5 text-black" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-slate-900 text-white rounded-xl p-3 flex items-center justify-between text-xs font-semibold shadow-xs animate-fade-in">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {selectedIds.size} item(s) selected
          </span>
          <div className="flex items-center gap-2">
            {bulkActions.map((action, i) => (
              <Button
                key={i}
                size="sm"
                variant={action.variant || 'outline'}
                onClick={() => action.action(selectedItems)}
                className="text-xs h-7 gap-1 bg-slate-800 hover:bg-slate-700 text-white border-slate-700 font-medium"
              >
                {action.icon && <action.icon className="h-3 w-3" />}
                <span>{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Enterprise Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white text-black uppercase tracking-wider border-b border-slate-200 font-bold sticky top-0">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allPaginatedSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-400 text-black focus:ring-slate-900 cursor-pointer"
                  />
                </th>
                {columns
                  .filter((c) => visibleColumns.has(c.key))
                  .map((col) => {
                    const isSorted = sortKey === col.key;
                    return (
                      <th
                        key={col.key}
                        style={{ width: col.width }}
                        className={`py-3 px-4 text-black font-bold ${
                          col.sortable !== false ? 'cursor-pointer select-none hover:text-black' : ''
                        }`}
                        onClick={() => {
                          if (col.sortable === false) return;
                          if (sortKey === col.key) {
                            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortKey(col.key);
                            setSortDirection('asc');
                          }
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{col.header}</span>
                          {col.sortable !== false &&
                            (isSorted ? (
                              sortDirection === 'asc' ? (
                                <ChevronUp className="h-3.5 w-3.5 text-black font-bold" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5 text-black font-bold" />
                              )
                            ) : (
                              <ChevronsUpDown className="h-3.5 w-3.5 text-black opacity-0 group-hover:opacity-100" />
                            ))}
                        </div>
                      </th>
                    );
                  })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-12 text-center text-black font-medium">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const id = keyExtractor(item);
                  const isSelected = selectedIds.has(id);
                  return (
                    <tr
                      key={id}
                      className={`transition-colors ${
                        isSelected ? 'bg-slate-100/90 font-medium' : 'hover:bg-slate-100'
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(id)}
                          className="rounded border-slate-400 text-black focus:ring-slate-900 cursor-pointer"
                        />
                      </td>
                      {columns
                        .filter((c) => visibleColumns.has(c.key))
                        .map((col) => (
                          <td key={col.key} className="py-3 px-4 text-black font-medium">
                            {col.accessor(item)}
                          </td>
                        ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-black font-medium">
          <div>
            Showing <span className="font-bold text-black">{paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
            <span className="font-bold text-black">{Math.min(currentPage * pageSize, sortedData.length)}</span> of{' '}
            <span className="font-bold text-black">{sortedData.length}</span> entries
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-black">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-black font-medium cursor-pointer"
              >
                {[10, 25, 50, 100].map((sz) => (
                  <option key={sz} value={sz}>
                    {sz}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-7 px-2.5 text-xs border-slate-300 text-black font-medium"
              >
                Previous
              </Button>
              <span className="px-2 font-semibold text-black">
                {currentPage} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-7 px-2.5 text-xs border-slate-300 text-black font-medium"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
