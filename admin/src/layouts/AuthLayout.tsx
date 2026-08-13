import { useAuthStore } from "@/config/store/auth";
import { Navigate, Outlet } from "react-router-dom";

const AuthLayout = () => {
  // Flat, always-defined boolean — safe to read even before hydration/login.
  const isAuthenticated = useAuthStore((store) => store.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard/home" />;
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex w-35 items-center gap-2 font-medium">
            <img src="/wordmark-logo.png" alt="" />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full">
            <Outlet />
          </div>
        </div>
      </div>
      <div className="relative hidden lg:flex lg:items-center lg:justify-center bg-[#f7f4ef]">
        <img src="/logo.png" alt="Proyakh Social Foundation" className="w-56 h-56 object-contain" />
      </div>
    </div>
  );
};

export default AuthLayout;
