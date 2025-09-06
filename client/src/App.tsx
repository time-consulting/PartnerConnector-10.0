import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import SubmitReferral from "@/pages/submit-referral";
import LearningPortal from "@/pages/learning-portal";
import UploadBills from "@/pages/upload-bills";
import AdminPortal from "@/pages/admin";
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
import NotFound from "@/pages/not-found";

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
      
      {/* Protected routes for authenticated users */}
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/leads" component={Leads} />
          <Route path="/submit-referral" component={SubmitReferral} />
          <Route path="/learning-portal" component={LearningPortal} />
          <Route path="/training" component={Training} />
          <Route path="/upload-bills" component={UploadBills} />
          <Route path="/track-referrals" component={TrackReferrals} />
          <Route path="/team-management" component={TeamManagement} />
          <Route path="/admin" component={AdminPortal} />
        </>
      )}
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
