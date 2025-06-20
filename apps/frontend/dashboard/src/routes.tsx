import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/components/layout';
import { DashboardPage } from '@/pages/dashboard';
import { AnalyticsPage } from '@/pages/analytics';
import { MonitoringPage } from '@/pages/monitoring';
import { LogExplorer } from './pages/monitoring/pages/logs/index';
import { TraceExplorer } from './pages/monitoring/pages/traces';
import { MetricExplorer } from './pages/monitoring/pages/metrics';
import { DeviceExplorer } from './pages/devices';
import { DeviceDetail } from './pages/devices/detail';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <DeviceExplorer />,
      },
      // {
      //   path: 'devices',
      //   element: <DeviceExplorer />,
      // },
      {
        path: 'devices/:id',
        element: <DeviceDetail />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
      {
        path: 'monitoring',
        children: [
          {
            index: true,
            element: <MonitoringPage />, // Optional: could be a general overview
          },
        /*   {
            path: 'metrics',
            element: <MetricsPage />,
          },
          {
            path: 'traces',
            element: <TracesPage />,
          }, */
          {path: 'metrics',
            element: <MetricExplorer/>
          },
          {
            path: 'logs',
            element: <LogExplorer />,
          },
          {
            path: 'traces',
            element: <TraceExplorer />,
          },
        ],
      },
    ],
  },
]); 