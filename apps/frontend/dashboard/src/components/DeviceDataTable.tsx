import { ColumnDef, Row } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2Icon, CircleX } from 'lucide-react';
import { Device } from '@/types/device';
import { DataTable } from './data-table';

const columns: ColumnDef<Device>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }: { row: Row<Device> }) => {
      return <div className="w-32 px-0">{row.original.name}</div>;
    },
    enableHiding: false,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }: { row: Row<Device> }) => (
      <div>
        <Badge variant="outline" className="w-24 px-1.5 text-muted-foreground">
          {row.original.type}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: { row: Row<Device> }) => (
      <Badge
        variant="outline"
        className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3"
      >
        {(() => {
          if (row.original.status === 'online') {
            return (
              <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
            );
          } else if (row.original.status === 'offline') {
            return <CircleX className="text-red-500 dark:text-red-400" />;
          } else {
            return null;
          }
        })()}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'lastSeen',
    header: 'Last Seen',
    cell: ({ row }: { row: Row<Device> }) => {
      return <div className="w-32 px-0">{new Date(row.original.lastSeen).toLocaleString()}</div>;
    },
  },
];

interface DeviceDataTableProps {
  data: Device[];
}

export function DeviceDataTable({ data }: DeviceDataTableProps) {
  return <DataTable data={data} columns={columns} />;
} 