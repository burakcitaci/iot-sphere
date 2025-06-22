import { LucideIcon, ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as React from 'react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';

interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  children?: {
    title: string;
    url: string;
  }[];
}

interface NavMainProps {
  items: NavItem[];
  currentPath: string;
}

export function NavMain({ items, currentPath }: NavMainProps) {
  const [openItem, setOpenItem] = React.useState<string | null>(null);

  return (
    <SidebarGroup>
      <SidebarGroupContent className="space-y-1">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = currentPath === item.url;
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openItem === item.title;

            return (
              <SidebarMenuItem key={item.title}>
                {hasChildren ? (
                  <Collapsible
                    open={isOpen}
                    onOpenChange={() => {
                      setOpenItem(isOpen ? null : item.title);
                    }}
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={isActive}
                        className="flex items-center justify-between w-full h-8 px-2"
                      >
                        <div className="flex items-center gap-2">
                          {item.icon && <item.icon className="h-4 w-4" />}
                          <span className="text-sm">{item.title}</span>
                        </div>
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-6">
                      <SidebarMenu className="mt-1 space-y-0.5">
                        {item?.children?.map((child) => (
                          <SidebarMenuItem key={child.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={currentPath === child.url}
                              className="h-7 px-2"
                            >
                              <Link to={child.url}>
                                <span className="text-sm">{child.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuButton asChild isActive={isActive} className="h-8 px-2">
                    <Link to={item.url}>
                      {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
