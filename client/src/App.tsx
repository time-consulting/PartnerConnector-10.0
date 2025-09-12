import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import SubmitReferral from "@/pages/submit-referral";
import UploadBills from "@/pages/upload-bills";
import AdminPortal from "@/pages/admin";
import AdminDiagnostics from "@/pages/admin-diagnostics";
import TrackReferrals from "@/pages/track-referrals";
import TeamManagement from "@/pages/team-management";
import Training from "@/pages/training";
import Leads from "@/pages/leads";
import PartnerOnboarding from "@/pages/partner-onboarding";
import CommissionStructure from "@/pages/commission-structure";
import LeadTracking from "@/pages/lead-tracking";
import PartnerPortal from "@/pages/partner-portal";
import About from "@/pages/about";
import HelpCenter from "@/pages/help-center";
import PartnerRecruitment from "@/pages/partner-recruitment";
import ProfilePage from "@/pages/account/profile";
import BankingPage from "@/pages/account/banking";
import FeedbackPage from "@/pages/account/feedback";
import NotFound from "@/pages/not-found";

// Private route wrapper that redirects to login if not authenticated
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/api/login';
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Redirecting to login...</div>
      </div>
    );
  }

  return <>{children}</>;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes available to everyone */}
      <Route path="/partner-onboarding" component={PartnerOnboarding} />
      <Route path="/commission-structure" component={CommissionStructure} />
      <Route path="/lead-tracking" component={LeadTracking} />
      <Route path="/partner-portal" component={PartnerPortal} />
      <Route path="/about" component={About} />
      <Route path="/help-center" component={HelpCenter} />
      <Route path="/partner-recruitment" component={PartnerRecruitment} />
      
      {/* Home route - Landing if not authenticated, Dashboard if authenticated */}
      <Route path="/" component={() => {
        if (isLoading) {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-lg">Loading...</div>
            </div>
          );
        }
        return isAuthenticated ? <Dashboard /> : <Landing />;
      }} />
      
      {/* Protected routes - always register but guard with PrivateRoute */}
      <Route path="/leads" component={() => <PrivateRoute><Leads /></PrivateRoute>} />
      <Route path="/submit-referral" component={() => <PrivateRoute><SubmitReferral /></PrivateRoute>} />
      <Route path="/training" component={() => <PrivateRoute><Training /></PrivateRoute>} />
      <Route path="/upload-bills" component={() => <PrivateRoute><UploadBills /></PrivateRoute>} />
      <Route path="/track-referrals" component={() => <PrivateRoute><TrackReferrals /></PrivateRoute>} />
      <Route path="/team-management" component={() => <PrivateRoute><TeamManagement /></PrivateRoute>} />
      <Route path="/account/profile" component={() => <PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/account/banking" component={() => <PrivateRoute><BankingPage /></PrivateRoute>} />
      <Route path="/account/feedback" component={() => <PrivateRoute><FeedbackPage /></PrivateRoute>} />
      <Route path="/admin" component={() => <PrivateRoute><AdminPortal /></PrivateRoute>} />
      <Route path="/admin/diagnostics" component={() => <PrivateRoute><AdminDiagnostics /></PrivateRoute>} />
      
      {/* Catch-all for unknown routes */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
