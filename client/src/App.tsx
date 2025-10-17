import { Switch, Route, useLocation } from "wouter";
import { useEffect, lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
// import { Toaster } from "@/components/ui/toaster"; // Temporarily disabled due to React hook violation
// import { TooltipProvider } from "@/components/ui/tooltip"; // Temporarily disabled due to React hook violation
import { useAuth } from "@/hooks/useAuth";

// Lazy load all pages for optimal bundle splitting
const Landing = lazy(() => import("@/pages/landing"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const SubmitReferral = lazy(() => import("@/pages/submit-referral"));
const UploadBills = lazy(() => import("@/pages/upload-bills"));
const AdminPortal = lazy(() => import("@/pages/admin"));
const AdminDiagnostics = lazy(() => import("@/pages/admin-diagnostics"));
const TrackReferrals = lazy(() => import("@/pages/track-referrals"));
const TeamManagement = lazy(() => import("@/pages/team-management"));
const Training = lazy(() => import("@/pages/training"));
const Opportunities = lazy(() => import("@/pages/opportunities"));
const Contacts = lazy(() => import("@/pages/contacts"));
const PartnerOnboarding = lazy(() => import("@/pages/partner-onboarding"));
const CommissionStructure = lazy(() => import("@/pages/commission-structure"));
const LeadTracking = lazy(() => import("@/pages/lead-tracking"));
const PartnerPortal = lazy(() => import("@/pages/partner-portal"));
const About = lazy(() => import("@/pages/about"));
const HelpCenter = lazy(() => import("@/pages/help-center"));
const PartnerRecruitment = lazy(() => import("@/pages/partner-recruitment"));
const ProfilePage = lazy(() => import("@/pages/account/profile"));
const BankingPage = lazy(() => import("@/pages/account/banking"));
const FeedbackPage = lazy(() => import("@/pages/account/feedback"));
const WaitlistPage = lazy(() => import("@/pages/waitlist"));
const SignupPage = lazy(() => import("@/pages/signup"));
const LoginPage = lazy(() => import("@/pages/login"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading fallback component with app branding
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center" data-testid="loading-fallback">
      <div className="text-center space-y-6 max-w-md px-6">
        {/* Logo/Brand */}
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        
        {/* Loading Spinner */}
        <div className="relative">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        </div>
        
        {/* Brand Text */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">PartnerConnector</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading your experience...</p>
        </div>
      </div>
    </div>
  );
}

// Private route wrapper that redirects to login if not authenticated
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login';
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
  return (
    <Switch>
      {/* Public routes available to everyone */}
      <Route path="/signup" component={SignupPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/waitlist" component={WaitlistPage} />
      <Route path="/partner-onboarding" component={PartnerOnboarding} />
      <Route path="/commission-structure" component={CommissionStructure} />
      <Route path="/lead-tracking" component={LeadTracking} />
      <Route path="/partner-portal" component={PartnerPortal} />
      <Route path="/about" component={About} />
      <Route path="/help-center" component={HelpCenter} />
      <Route path="/partner-recruitment" component={PartnerRecruitment} />
      
      {/* Home route - Landing page */}
      <Route path="/" component={Landing} />
      
      {/* Dashboard route - Protected dashboard for authenticated users */}
      <Route path="/dashboard" component={() => <PrivateRoute><Dashboard /></PrivateRoute>} />
      
      {/* Protected routes - always register but guard with PrivateRoute */}
      <Route path="/opportunities" component={() => <PrivateRoute><Opportunities /></PrivateRoute>} />
      <Route path="/contacts" component={() => <PrivateRoute><Contacts /></PrivateRoute>} />
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
      {/* <TooltipProvider> - Temporarily disabled due to React hook violation */}
        <Suspense fallback={<LoadingFallback />}>
          <Router />
        </Suspense>
        {/* <Toaster /> - Temporarily disabled due to React hook violation */}
      {/* </TooltipProvider> */}
    </QueryClientProvider>
  );
}

export default App;
