import { createBrowserRouter } from "react-router";
import { PublicLayout } from "@/app/components/PublicLayout";
import { RootLayout } from "@/app/components/RootLayout";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";

// Public Pages
import { Home } from "@/app/pages/public/Home";
import { Services } from "@/app/pages/public/Services";
import { About } from "@/app/pages/public/About";
import { Contact } from "@/app/pages/public/Contact";
import { PublicProperties } from "@/app/pages/public/PublicProperties";
import { PropertyDetails } from "@/app/pages/public/PropertyDetails";
import { Updates } from "@/app/pages/public/Updates";
import { UpdateDetails } from "@/app/pages/public/UpdateDetails";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";
import { Login } from "@/app/pages/Login";
import { Register } from "@/app/pages/Register";
import { ForgotPassword } from "@/app/pages/ForgotPassword";
import { ResetPassword } from "@/app/pages/ResetPassword";

// Dashboard Pages
import { Dashboard } from "@/app/pages/Dashboard";
import { Calendar } from "@/app/pages/Calendar";
import { Messages } from "@/app/pages/Messages";
import { Notifications } from "@/app/pages/Notifications";
import { Settings } from "@/app/pages/Settings";
import { Workforce } from "@/app/pages/Workforce";
import { Employees } from "@/app/pages/Employees";
import { Finance } from "@/app/pages/Finance";
import { Administration } from "@/app/pages/Administration";
import { Attendance } from "@/app/pages/Attendance";
import { ContentManagement } from "@/app/pages/ContentManagement";
import { Portfolio } from "@/app/pages/Portfolio";
import { Insights } from "@/app/pages/Insights";
import { Bookings } from "@/app/pages/Bookings";
import { Communications } from "@/app/pages/Communications";
import { Analytics } from "@/app/pages/Analytics";

export const router = createBrowserRouter([
  // Public Routes
  {
    path: "/",
    Component: PublicLayout,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, Component: Home },
      { path: "services", Component: Services },
      { path: "properties", Component: PublicProperties },
      { path: "properties/:id", Component: PropertyDetails },
      { path: "updates", Component: Updates },
      { path: "updates/:id", Component: UpdateDetails },
      { path: "about", Component: About },
      { path: "contact", Component: Contact },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "forgot-password", Component: ForgotPassword },
      { path: "reset-password", Component: ResetPassword },
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
          { index: true, Component: Dashboard },
          { path: "portfolio", Component: Portfolio },
          { path: "workforce", Component: Workforce },
          { path: "employees", Component: Employees },
          { path: "finance", Component: Finance },
          { path: "admin", Component: Administration },
          { path: "settings", Component: Settings },
          { path: "attendance", Component: Attendance },
          { path: "content", Component: ContentManagement },
          { path: "insights", Component: Insights },
          { path: "calendar", Component: Calendar },
          { path: "services", Component: Services },
          { path: "contact", Component: Contact },
          { path: "communications", Component: Communications },
          { path: "notifications", Component: Notifications },
          { path: "bookings", Component: Bookings },
          { path: "analytics", Component: Analytics },
        ],
      },
    ],
  },
]);
