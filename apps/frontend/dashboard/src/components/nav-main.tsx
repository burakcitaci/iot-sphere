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
      <SidebarGroupContent className="flex flex-col gap-2">
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
                        className="flex items-center justify-between w-full"
                      >
                        <div className="flex items-center gap-2">
                          {item.icon && <item.icon className="h-4 w-4" />}
                          <span>{item.title}</span>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-300 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-6">
                      <SidebarMenu className="mt-1">
                        {item?.children?.map((child) => (
                          <SidebarMenuItem key={child.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={currentPath === child.url}
                            >
                              <Link to={child.url}>
                                <span>{child.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link to={item.url}>
                      {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                      <span>{item.title}</span>
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
