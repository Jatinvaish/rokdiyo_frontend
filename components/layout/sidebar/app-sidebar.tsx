"use client";
import * as React from "react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useIsTablet } from "@/hooks/use-mobile";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/layout/sidebar/nav-main";
import { NavUser } from "@/components/layout/sidebar/nav-user";
import { ScrollArea } from "@/components/ui/scroll-area";
import Logo from "@/components/layout/logo";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { setOpen, setOpenMobile, isMobile } = useSidebar();
  const isTablet = useIsTablet();

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname]);

  useEffect(() => {
    setOpen(!isTablet);
  }, [isTablet]);

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* HEADER (clean - no button, no dropdown) */}
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-3 h-10">
              <Logo />
              <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
                Rokdio
              </span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent className="border-b">
        <ScrollArea className="h-full px-1 py-2">
          <NavMain />
        </ScrollArea>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="pt-2">
        <NavUser />
      </SidebarFooter>

    </Sidebar>
  );
}
