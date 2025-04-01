import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/components/layout';
import { DashboardPage } from '@/pages/dashboard';
import { DevicesPage } from '@/pages/devices';
import { AnalyticsPage } from '@/pages/analytics';
import { MonitoringPage } from '@/pages/monitoring';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'devices',
        element: <DevicesPage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
      {
        path: 'monitoring',
        element: <MonitoringPage />,
      },
    ],
  },
]); 