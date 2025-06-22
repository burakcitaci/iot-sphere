import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChartIcon,
  BoxesIcon,
  CameraIcon,
  FileCodeIcon,
  FileTextIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
  BugIcon,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/',
      icon: LayoutDashboardIcon,
    },
   /*  {
      title: 'Devices',
      url: '/devices',
      icon: BoxesIcon,
    }, */
    // {
    //   title: 'Analytics',
    //   url: '/analytics',
    //   icon: BarChartIcon,
    // },
    {
      title: 'Monitoring',
      url: '/monitoring',
      icon: BugIcon,
      children: [
        { title: 'Metrics', url: '/monitoring/metrics' },
        { title: 'Traces', url: '/monitoring/traces' },
        { title: 'Logs', url: '/monitoring/logs' },
      ],
    },
    {
      title: 'Projects',
      url: '/projects',
      icon: FolderIcon,
    },
    {
      title: 'Team',
      url: '/team',
      icon: UsersIcon,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '/settings',
      icon: SettingsIcon,
    },
    {
      title: 'Get Help',
      url: '/help',
      icon: HelpCircleIcon,
    },
    {
      title: 'Search',
      url: '/search',
      icon: SearchIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="py-2 px-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-8 px-2"
            >
              <Link to="/">
                <BoxesIcon className="h-4 w-4" />
                <span className="text-sm font-medium">IOT Sphere</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="py-2 px-3">
        <NavMain items={data.navMain} currentPath={location.pathname} />
        <NavSecondary
          items={data.navSecondary}
          currentPath={location.pathname}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter className="py-2 px-3">
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
