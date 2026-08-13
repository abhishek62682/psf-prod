import { RoleGuard } from "@/components/RoleGuard";
import { ROLE_GROUPS } from "@/config/roles";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import LoginPage from "@/pages/auth-pages/LoginPage";
import VerifyOTP from "@/pages/auth-pages/VerifyOtpPage";
import ForgotPasswordPage from "@/pages/auth-pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth-pages/ResetPasswordPage";
import HomePage from "@/pages/dashboard-pages/HomePage";
import ProfilePage from "@/pages/dashboard-pages/profile-page";
import CampaignsPage from "@/pages/dashboard-pages/campaign-page/CampaignsPage";
import CreateCampaignPage from "@/pages/dashboard-pages/campaign-page/CreateCampaignPage";
import EditCampaignPage from "@/pages/dashboard-pages/campaign-page/EditCampaignPage";
import CampaignDetailPage from "@/pages/dashboard-pages/campaign-page/CampaignDetailPage";
import CampaignDonationsPage from "@/pages/dashboard-pages/campaign-page/CampaignDonationsPage";
import DonationsPage from "@/pages/dashboard-pages/donation-page/DonationsPage";
import DonationDetailPage from "@/pages/dashboard-pages/donation-page/DonationDetailPage";
import PaymentReceivingPage from "@/pages/dashboard-pages/payment-receiving-page";
import AuditLogsPage from "@/pages/dashboard-pages/audit-log-page/AuditLogsPage";
import ContactMessagesPage from "@/pages/dashboard-pages/contact-page/ContactMessagesPage";
import CareersPage from "@/pages/dashboard-pages/career-page/CareersPage";
import CreateCareerPage from "@/pages/dashboard-pages/career-page/CreateCareerPage";
import EditCareerPage from "@/pages/dashboard-pages/career-page/EditCareerPage";
import { createBrowserRouter, Navigate } from "react-router-dom";

// Skeleton route table. Login → OTP is the only real (backend-wired) flow.
// Add new dashboard pages as children of "dashboard", wrapped in
// <RoleGuard> if they need role restrictions.
const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard/home" />,
  },
  {
    path: "auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "verify-otp", element: <VerifyOTP /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
    ],
  },
  {
    path: "dashboard",
    element: <DashboardLayout />,
    children: [
      {
        path: "home",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.ALL}>
            <HomePage />
          </RoleGuard>
        ),
      },
      {
        path: "profile",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.ALL}>
            <ProfilePage />
          </RoleGuard>
        ),
      },
      {
        path: "campaigns",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.ALL}>
            <CampaignsPage />
          </RoleGuard>
        ),
      },
      {
        path: "campaigns/create",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.ALL}>
            <CreateCampaignPage />
          </RoleGuard>
        ),
      },
      {
        path: "campaigns/:id/edit",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.ALL}>
            <EditCampaignPage />
          </RoleGuard>
        ),
      },
      {
        path: "campaigns/:id",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.ALL}>
            <CampaignDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: "campaigns/:id/donations",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.ALL}>
            <CampaignDonationsPage />
          </RoleGuard>
        ),
      },
      {
        path: "donations",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.ALL}>
            <DonationsPage />
          </RoleGuard>
        ),
      },
      {
        path: "donations/:id",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.ALL}>
            <DonationDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: "payment-receiving",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.ALL}>
            <PaymentReceivingPage />
          </RoleGuard>
        ),
      },
      {
        path: "audit-logs",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.ALL}>
            <AuditLogsPage />
          </RoleGuard>
        ),
      },
      {
        path: "contact",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.ALL}>
            <ContactMessagesPage />
          </RoleGuard>
        ),
      },
      {
        path: "careers",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.ALL}>
            <CareersPage />
          </RoleGuard>
        ),
      },
      {
        path: "careers/create",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.ALL}>
            <CreateCareerPage />
          </RoleGuard>
        ),
      },
      {
        path: "careers/:id/edit",
        element: (
          <RoleGuard behavior="redirect" allowedRoles={ROLE_GROUPS.ALL}>
            <EditCareerPage />
          </RoleGuard>
        ),
      },
    ],
  },
]);

export default router;
