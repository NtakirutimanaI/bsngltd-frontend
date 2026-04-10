import { createBrowserRouter } from "react-router";
import { PublicLayout } from "@/app/components/PublicLayout";
import { RootLayout } from "@/app/components/RootLayout";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";

import { router as originalRouter } from './routes.tsx'; // Just to keep reference if needed
import Home from "../pages/Home";
import About from "../pages/About";
import Service from "../pages/Service";
import Project from "../pages/Project";
import Contact from "../pages/Contact";
import Feature from "../pages/Feature";
import Team from "../pages/Team";
import Testimonial from "../pages/Testimonial";
import NotFound from "../pages/NotFound";

export const router = createBrowserRouter([
  // Public Routes
  {
    path: "/",
    Component: PublicLayout,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "service", element: <Service /> },
      { path: "project", element: <Project /> },
      { path: "contact", element: <Contact /> },
      { path: "feature", element: <Feature /> },
      { path: "team", element: <Team /> },
      { path: "testimonial", element: <Testimonial /> },
      { path: "login", lazy: () => import("@/app/pages/Login").then(m => ({ Component: m.Login })) },
      { path: "register", lazy: () => import("@/app/pages/Register").then(m => ({ Component: m.Register })) },
      { path: "forgot-password", lazy: () => import("@/app/pages/ForgotPassword").then(m => ({ Component: m.ForgotPassword })) },
      { path: "reset-password", lazy: () => import("@/app/pages/ResetPassword").then(m => ({ Component: m.ResetPassword })) },
      { path: "*", element: <NotFound /> },
    ],
  },

  // Protected Dashboard Routes
  {
    path: "/dashboard",
    Component: ProtectedRoute,
    children: [
      {
        Component: RootLayout,
        children: [
          { index: true, lazy: () => import("@/app/pages/Dashboard").then(m => ({ Component: m.Dashboard })) },
          { path: "projects", lazy: () => import("@/app/pages/Portfolio").then(m => ({ Component: m.Portfolio })) },
          { path: "sites", lazy: () => import("@/app/pages/ManageSites").then(m => ({ Component: m.ManageSites })) },
          { path: "users", lazy: () => import("@/app/pages/ManageUsers").then(m => ({ Component: m.ManageUsers })) },
          { path: "workforce", lazy: () => import("@/app/pages/Workforce").then(m => ({ Component: m.Workforce })) },
          { path: "employees", lazy: () => import("@/app/pages/Employees").then(m => ({ Component: m.Employees })) },
          { path: "finance", lazy: () => import("@/app/pages/Finance").then(m => ({ Component: m.Finance })) },
          { path: "admin", lazy: () => import("@/app/pages/Administration").then(m => ({ Component: m.Administration })) },
          { path: "settings", lazy: () => import("@/app/pages/Settings").then(m => ({ Component: m.Settings })) },
          { path: "attendance", lazy: () => import("@/app/pages/Attendance").then(m => ({ Component: m.Attendance })) },
          { path: "content", lazy: () => import("@/app/pages/ContentManagement").then(m => ({ Component: m.ContentManagement })) },
          { path: "insights", lazy: () => import("@/app/pages/Insights").then(m => ({ Component: m.Insights })) },
          { path: "calendar", lazy: () => import("@/app/pages/Calendar").then(m => ({ Component: m.Calendar })) },
          { path: "updates", lazy: () => import("@/app/pages/public/Updates").then(m => ({ Component: m.Updates })) },
          { path: "services", lazy: () => import("@/app/pages/public/Services").then(m => ({ Component: m.Services })) },
          { path: "contact", lazy: () => import("@/app/pages/public/Contact").then(m => ({ Component: m.Contact })) },
          { path: "communications", lazy: () => import("@/app/pages/Communications").then(m => ({ Component: m.Communications })) },
          { path: "notifications", lazy: () => import("@/app/pages/Notifications").then(m => ({ Component: m.Notifications })) },
          { path: "bookings", lazy: () => import("@/app/pages/Bookings").then(m => ({ Component: m.Bookings })) },
          { path: "analytics", lazy: () => import("@/app/pages/Analytics").then(m => ({ Component: m.Analytics })) },
          { path: "salary-payments", lazy: () => import("@/app/pages/SalaryPayments").then(m => ({ Component: m.SalaryPayments })) },
          { path: "rent-buy", lazy: () => import("@/app/pages/RentBuy").then(m => ({ Component: m.RentBuy })) },
        ],
      },
    ],
  },
]);
