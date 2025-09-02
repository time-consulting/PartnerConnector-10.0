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
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/submit-referral" component={SubmitReferral} />
          <Route path="/learning-portal" component={LearningPortal} />
          <Route path="/upload-bills" component={UploadBills} />
          <Route path="/track-referrals" component={TrackReferrals} />
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
