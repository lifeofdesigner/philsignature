# Data Table Component (`<DataTable />`)

## Architecture
Built on `@tanstack/react-table` for Shopify-grade admin data tables:
- Server and client-side pagination.
- Column-based sorting and multi-column filtering.
- Row selection for bulk actions (archive, delete, export).
- Empty state fallbacks.
- CSV export integration.

## Usage Blueprint
```tsx
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
});
```

