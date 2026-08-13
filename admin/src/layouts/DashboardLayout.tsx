import { useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import "../theme.css";
import { useAuthStore } from "@/config/store/auth";
import { getMe } from "@/config/api/auth.api";
import { useQuery } from "@tanstack/react-query";
import { getPageTitle } from "@/Utils/constant";

export default function DashboardLayout() {
  const location = useLocation();

  // Flat, always-defined booleans — safe to read on first render.
  const isAuthenticated = useAuthStore((store) => store.isAuthenticated);
  const isHydrated = useAuthStore((store) => store.isHydrated);
  const updateUser = useAuthStore((store) => store.updateUser);

  // Silent background sync via GET /api/auth/me — keeps name/avatar/role
  // fresh if they changed elsewhere (another tab, direct profile edit).
  // Never blocks rendering: the persisted user from login is shown
  // immediately, this just refreshes it. A 401 here is handled globally by
  // httpClient's response interceptor (logs out + redirects).
  const { data: freshUser } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: isAuthenticated && isHydrated,
    retry: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (freshUser) updateUser(freshUser);
  }, [freshUser, updateUser]);

  if (!isHydrated) return null;

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }

  const title = getPageTitle(location.pathname);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={title} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2 p-2 lg:p-6">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
