/**
 * App
 *
 * The main app component. This component is responsible for rendering the
 * entire app, including the navigation and routes.
 *
 * The app is currently very basic and just renders a simple form and a few
 * links to navigate between pages.
 *
 * @returns The app component.
 */

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import data from './data.json';
import { SectionCards } from '@/components/section-cards';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';
import { DeviceList } from '@/components/DeviceList';

export function App() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <DeviceList />
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
export default App;
