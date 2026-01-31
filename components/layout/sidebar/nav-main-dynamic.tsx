"use client";

import { useState, useEffect } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from "@/components/ui/sidebar";
import {
  Home,
  Building2,
  Bed,
  Users,
  Calendar,
  FileText,
  DollarSign,
  BarChart3,
  Layout,
  ChevronRight,
  Shield,
  Settings,
  CreditCard,
  Lock,
  Plus,
  List,
  User,
  Building,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";
import { AccessControlService } from "@/lib/services/access-control.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// Icon mapping for menu items
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard: Home,
  Calendar: Calendar,
  Bed: Bed,
  Users: Users,
  User: Users,
  FileText: FileText,
  BarChart: BarChart3,
  BarChart3: BarChart3,
  Settings: Settings,
  CreditCard: CreditCard,
  Shield: Shield,
  Plus: Plus,
  List: List,
  Building: Building2,
  Building2: Building2,
  Lock: Lock,
};

type DynamicNavItem = {
  menu_key: string;
  menu_name: string;
  parent_menu_key: string | null;
  display_order: number;
  icon: string;
  route: string;
  sub_items?: DynamicNavItem[];
};

export function NavMainDynamic() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const { user } = useAuthStore();
  const [menus, setMenus] = useState<DynamicNavItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserMenus();
  }, [user]);

  const loadUserMenus = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await AccessControlService.getUserMenus(user.id);
      
      if (response.success && response.data) {
        // Organize menus into hierarchy
        const organizedMenus = organizeMenus(response.data);
        setMenus(organizedMenus);
      }
    } catch (error) {
      console.error('Failed to load user menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const organizeMenus = (menuData: any[]): DynamicNavItem[] => {
    // Convert API response to our format
    const flatMenus: DynamicNavItem[] = menuData.map(item => ({
      menu_key: item.menu_key,
      menu_name: item.menu_name,
      parent_menu_key: item.parent_menu_key,
      display_order: item.display_order,
      icon: item.icon,
      route: item.route,
    }));

    // Create hierarchy
    const parentMenus = flatMenus.filter(menu => !menu.parent_menu_key);
    const childMenus = flatMenus.filter(menu => menu.parent_menu_key);

    return parentMenus.map(parent => ({
      ...parent,
      sub_items: childMenus
        .filter(child => child.parent_menu_key === parent.menu_key)
        .sort((a, b) => a.display_order - b.display_order)
    })).sort((a, b) => a.display_order - b.display_order);
  };

  const getIcon = (iconName: string): LucideIcon => {
    return iconMap[iconName] || Layout;
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No menus available</p>
      </div>
    );
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {menus.map((menu) => (
              <SidebarMenuItem key={menu.menu_key}>
                {Array.isArray(menu.sub_items) && menu.sub_items.length > 0 ? (
                  <>
                    <div className="hidden group-data-[collapsible=icon]:block">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuButton tooltip={menu.menu_name}>
                            {menu.icon && (() => {
                              const Icon = getIcon(menu.icon);
                              return <Icon />;
                            })()}
                            <span>{menu.menu_name}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          side={isMobile ? "bottom" : "right"}
                          align={isMobile ? "end" : "start"}
                          className="min-w-48 rounded-lg">
                          <DropdownMenuLabel>{menu.menu_name}</DropdownMenuLabel>
                          {menu.sub_items?.map((subItem) => (
                            <DropdownMenuItem
                              className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10! active:bg-[var(--primary)]/10!"
                              asChild
                              key={subItem.menu_key}>
                              <a href={subItem.route}>{subItem.menu_name}</a>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Collapsible
                      className="group/collapsible block group-data-[collapsible=icon]:hidden"
                      defaultOpen={!!menu.sub_items.find((s) => s.route === pathname)}>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                          tooltip={menu.menu_name}>
                          {menu.icon && (() => {
                            const Icon = getIcon(menu.icon);
                            return <Icon />;
                          })()}
                          <span>{menu.menu_name}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {menu?.sub_items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.menu_key}>
                              <SidebarMenuSubButton
                                className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                                isActive={pathname === subItem.route}
                                asChild>
                                <Link href={subItem.route}>
                                  <span>{subItem.menu_name}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  </>
                ) : (
                  <SidebarMenuButton
                    className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                    isActive={pathname === menu.route}
                    tooltip={menu.menu_name}
                    asChild>
                    <Link href={menu.route}>
                      {menu.icon && (() => {
                        const Icon = getIcon(menu.icon);
                        return <Icon />;
                      })()}
                      <span>{menu.menu_name}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}