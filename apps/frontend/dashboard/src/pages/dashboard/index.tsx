import { SectionCards } from '@/components/section-cards';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable, columns } from '@/components/data-table';
import data from '@/app/data.json';

export function DashboardPage() {
  return (
    <div className="container mx-auto gap-2">
      <div className="space-y-6">
      <h1 className="mb-6 text-2xl font-bold px-4">Dashboard</h1>
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <DataTable data={data} columns={columns} />
      </div>
    </div>
  );
} 