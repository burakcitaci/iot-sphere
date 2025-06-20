import { ColumnDef, Row } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2Icon, CircleX } from 'lucide-react';
import { DataTable } from './data-table';
import { useNavigate } from 'react-router-dom';

interface HemsSystem {
  id: string;
  customerName: string;
  systemName: string;
  location: string;
  status: 'online' | 'offline' | 'warning' | 'error';
  totalPower: number;
  deviceCount: number;
  lastUpdate: string;
}


const columns: ColumnDef<HemsSystem>[] = [
  {
    accessorKey: 'systemName',
    header: 'System Name',
    cell: ({ row }: { row: Row<HemsSystem> }) => {
      return (
        <div className="flex flex-col">
          <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            {row.original.systemName}
          </div>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: 'customerName',
    header: 'Customer',
    cell: ({ row }: { row: Row<HemsSystem> }) => (
      <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
        {row.original.customerName}
      </div>
    ),
  },
  {
    accessorKey: 'location',
    header: 'Location',
    cell: ({ row }: { row: Row<HemsSystem> }) => (
      <div className="text-gray-700 text-sm dark:text-gray-300 max-w-xs truncate">
        {row.original.location}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: { row: Row<HemsSystem> }) => {
      const status = row.original.status;
      const getStatusColor = () => {
        switch (status) {
          case 'online':
            return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
          case 'offline':
            return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
          case 'warning':
            return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
          case 'error':
            return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
          default:
            return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        }
      };

      const getStatusIcon = () => {
        switch (status) {
          case 'online':
            return <CheckCircle2Icon className="w-3 h-3" />;
          case 'offline':
          case 'error':
            return <CircleX className="w-3 h-3" />;
          case 'warning':
            return <CircleX className="w-3 h-3" />;
          default:
            return null;
        }
      };

      return (
        <Badge
          variant="outline"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor()}`}
        >
          {getStatusIcon()}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'totalPower',
    header: 'Total Power',
    cell: ({ row }: { row: Row<HemsSystem> }) => {
      return (
        <div className="font-semibold text-left text-blue-600 dark:text-blue-400">
          {(row.original.totalPower / 1000).toFixed(1)} kW
        </div>
      );
    },
  },
  {
    accessorKey: 'deviceCount',
    header: 'Devices',
    cell: ({ row }: { row: Row<HemsSystem> }) => (
      <Badge variant="secondary" className="font-medium">
        {row.original.deviceCount}
      </Badge>
    ),
  },
  {
    accessorKey: 'lastUpdate',
    header: 'Last Update',
    cell: ({ row }: { row: Row<HemsSystem> }) => {
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {row.original.lastUpdate}
        </div>
      );
    },
  },
];

interface HemsSystemDataTableProps {
  data: HemsSystem[];
}

export function HemsSystemDataTable({ data }: HemsSystemDataTableProps) {
  const navigate = useNavigate();
  const handleRowClick = (systemId: string) => {
    console.log('Row clicked with system ID:', systemId);
    console.log('Navigating to:', `/devices/${systemId}`);
    navigate(`/devices/${systemId}`);
  };

  return (
    <DataTable data={data} columns={columns} onRowClick={handleRowClick} />
  );
}
