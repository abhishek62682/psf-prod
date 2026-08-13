import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboard, User, Megaphone, HandCoins, Landmark, Mail, Briefcase, History } from "lucide-react"

import { ROLE_GROUPS } from "@/config/roles";

// Add one entry per sidebar link. `roles` controls who sees it (via RoleGuard).
const data = {
  navMain: [
    { title: "Dashboard",          url: "/dashboard/home",              icon: LayoutDashboard, roles: ROLE_GROUPS.ALL },
    { title: "Campaigns",          url: "/dashboard/campaigns",         icon: Megaphone,       roles: ROLE_GROUPS.ALL },
    { title: "Donations",          url: "/dashboard/donations",         icon: HandCoins,       roles: ROLE_GROUPS.ALL },
    { title: "Payment Accounts",   url: "/dashboard/payment-receiving", icon: Landmark,        roles: ROLE_GROUPS.ALL },
    { title: "Audit Logs",         url: "/dashboard/audit-logs",        icon: History,         roles: ROLE_GROUPS.ALL },
    { title: "Messages",           url: "/dashboard/contact",           icon: Mail,            roles: ROLE_GROUPS.ALL },
    { title: "Careers",            url: "/dashboard/careers",           icon: Briefcase,       roles: ROLE_GROUPS.ALL },
    { title: "Profile",            url: "/dashboard/profile",           icon: User,            roles: ROLE_GROUPS.ALL },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <a href="/dashboard/home">
              <img className="w-10" src="/logo.png" alt="" />
            </a>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
