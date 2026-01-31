"use client";

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
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";
import { PermissionGuard } from "@/hooks/usePermissions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

type NavGroup = {
  title: string;
  items: NavItem;
};

type NavItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
  isComing?: boolean;
  isDataBadge?: string;
  isNew?: boolean;
  newTab?: boolean;
  permission?: string;
  items?: NavItem;
}[];

export const navItems: NavGroup[] = [
  {
    title: "Main",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: Home, permission: "dashboard.read" },
      { title: "Hotels & Branches", href: "/dashboard/hotels", icon: Building2, permission: "hotels.read" },
      { title: "Rooms", href: "/dashboard/rooms", icon: Bed, permission: "rooms.read" },
      { title: "Room Types", href: "/dashboard/room-types", icon: Layout, permission: "room_types.read" },
    ],
  },
  {
    title: "Reservations",
    items: [
      { title: "Bookings", href: "/dashboard/bookings", icon: Calendar, permission: "bookings.read" },
      { title: "Guests", href: "/dashboard/guests", icon: Users, permission: "guests.read" },
    ],
  },
  {
    title: "Finance",
    items: [
      { title: "Invoices", href: "/dashboard/invoices", icon: FileText, permission: "invoices.read" },
      { title: "Payments", href: "/dashboard/payments", icon: DollarSign, permission: "payments.read" },
    ],
  },
  {
    title: "Analytics",
    items: [
      { title: "Reports", href: "/dashboard/reports", icon: BarChart3, permission: "reports.read" },
    ],
  },
];

export const adminNavItems: NavGroup[] = [
  {
    title: "Access Control",
    items: [
      { title: "Roles", href: "/dashboard/access-control/roles", icon: Users, permission: "roles.manage" },
      { title: "Permissions", href: "/dashboard/access-control/permissions", icon: Shield, permission: "permissions.view" },
      { title: "Menu Permissions", href: "/dashboard/access-control/menu_permissions", icon: Lock, permission: "menu_permissions.update" },
    ],
  },
  {
    title: "Subscription Management",
    items: [
      { title: "Plans", href: "/dashboard/subscription-management", icon: CreditCard, permission: "subscriptions.manage" },
    ],
  },
  {
    title: "Super Admin",
    items: [
      { title: "Tenant Management", href: "/dashboard/admin/tenants", icon: Building2, permission: "tenants.read" },
      { title: "System Settings", href: "/dashboard/settings", icon: Settings, permission: "settings.update" },
    ],
  },
];

export function NavMain() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.userType === "SUPER_ADMIN";

  const itemsToShow = [...navItems, ...(isSuperAdmin ? adminNavItems : [])];

  return (
    <>
      {itemsToShow.map((nav) => (
        <SidebarGroup key={nav.title}>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {nav.items.map((item) => (
                <PermissionGuard key={item.title} permission={item.permission}>
                  <SidebarMenuItem>
                    {Array.isArray(item.items) && item.items.length > 0 ? (
                      <>
                        <div className="hidden group-data-[collapsible=icon]:block">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <SidebarMenuButton tooltip={item.title}>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                              </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              side={isMobile ? "bottom" : "right"}
                              align={isMobile ? "end" : "start"}
                              className="min-w-48 rounded-lg">
                              <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                              {item.items?.map((item) => (
                                <PermissionGuard key={item.title} permission={item.permission}>
                                  <DropdownMenuItem
                                    className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10! active:bg-[var(--primary)]/10!"
                                    asChild>
                                    <a href={item.href}>{item.title}</a>
                                  </DropdownMenuItem>
                                </PermissionGuard>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <Collapsible
                          className="group/collapsible block group-data-[collapsible=icon]:hidden"
                          defaultOpen={!!item.items.find((s) => s.href === pathname)}>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                              tooltip={item.title}>
                              {item.icon && <item.icon />}
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item?.items?.map((subItem, key) => (
                                <PermissionGuard key={key} permission={subItem.permission}>
                                  <SidebarMenuSubItem>
                                    <SidebarMenuSubButton
                                      className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                                      isActive={pathname === subItem.href}
                                      asChild>
                                      <Link href={subItem.href} target={subItem.newTab ? "_blank" : ""}>
                                        <span>{subItem.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                </PermissionGuard>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </Collapsible>
                      </>
                    ) : (
                      <SidebarMenuButton
                        className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                        isActive={pathname === item.href}
                        tooltip={item.title}
                        asChild>
                        <Link href={item.href} target={item.newTab ? "_blank" : ""}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                    {!!item.isComing && (
                      <SidebarMenuBadge className="peer-hover/menu-button:text-foreground opacity-50">
                        Coming
                      </SidebarMenuBadge>
                    )}
                    {!!item.isNew && (
                      <SidebarMenuBadge className="border border-green-400 text-green-600 peer-hover/menu-button:text-green-600">
                        New
                      </SidebarMenuBadge>
                    )}
                    {!!item.isDataBadge && (
                      <SidebarMenuBadge className="peer-hover/menu-button:text-foreground">
                        {item.isDataBadge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                </PermissionGuard>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
