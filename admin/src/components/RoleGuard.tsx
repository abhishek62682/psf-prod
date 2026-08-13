import { useAuthStore } from "@/config/store/auth";
import { Navigate } from "react-router-dom";
import type { Role } from "@/config/roles";

type RoleGuardProps =
  | {
      allowedRoles: readonly Role[];
      children: React.ReactNode;
      behavior: "redirect";
      redirectTo?: string;
      fallback?: never;
    }
  | {
      allowedRoles: readonly Role[];
      children: React.ReactNode;
      behavior: "hide";
      fallback?: React.ReactNode;
      redirectTo?: never;
    };

export const RoleGuard = ({
  allowedRoles,
  children,
  behavior,
  redirectTo,
  fallback = null,
}: RoleGuardProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const user = useAuthStore((state) => state.user);

  if (!isHydrated) return null;

  if (!isAuthenticated || !user) {
    return behavior === "redirect"
      ? <Navigate to="/auth/login" replace />
      : null;
  }

  const isAllowed = allowedRoles.includes(user.role as Role);

  if (!isAllowed) {
    if (behavior === "hide") return <>{fallback}</>;
    return <Navigate to={redirectTo ?? "/dashboard/home"} replace />;
  }

  return <>{children}</>;
};
