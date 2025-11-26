import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { LiveTokenIndicator } from "@/components/common/LiveTokenIndicator";
import { TokenLimitAlert } from "@/components/common/TokenLimitAlert";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import AuraLayout from "@/components/common/AuraLayout";

// Component to use the admin notifications hook
function AdminNotificationsProvider() {
  useAdminNotifications();
  return null;
}
import CreateProject from "./pages/CreateProject";
import Landing from "./pages/Landing";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import AcceptInvite from "./pages/AcceptInvite";
import RequestAccess from "./pages/RequestAccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuraLayout>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AdminNotificationsProvider />
            <LiveTokenIndicator />
            <TokenLimitAlert />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/request-access" element={<RequestAccess />} />
              {/* Admin Routes */}
              <Route path="/admin" element={<Admin />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreateProject />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <Projects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:id"
                element={
                  <ProtectedRoute>
                    <ProjectDetail />
                  </ProtectedRoute>
                }
              />
              <Route path="/pricing" element={<Pricing />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuraLayout>
  </QueryClientProvider>
);

export default App;
