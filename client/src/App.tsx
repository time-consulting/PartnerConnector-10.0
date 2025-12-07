import { Router, Switch, Route, useLocation } from "wouter";
import { useEffect, lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
// import { TooltipProvider } from "@/components/ui/tooltip"; // Temporarily disabled due to React hook violation
import { useAuth } from "@/hooks/useAuth";
import ConnectionStatusNotifier from "@/components/connection-status-notifier";
// import ImpersonationBanner from "@/components/impersonation-banner"; - Temporarily disabled due to React hook violation
// import PWAInstallPrompt from "@/components/pwa-install-prompt";

// Lazy load all pages for optimal bundle splitting - Updated 2025-11-12
const Landing = lazy(() => import("@/pages/landing"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const SubmitDeal = lazy(() => import("@/pages/submit-deal"));
const UploadBills = lazy(() => import("@/pages/upload-bills"));
const AdminPortal = lazy(() => import("@/pages/admin"));
const AdminDiagnostics = lazy(() => import("@/pages/admin-diagnostics"));
const AdminPayments = lazy(() => import("@/pages/admin-payments"));
const AdminInvoices = lazy(() => import("@/pages/admin-invoices"));
const AdminMessages = lazy(() => import("@/pages/admin-messages"));
const AdminBackend = lazy(() => import("@/pages/admin-backend"));
const TrackDeals = lazy(() => import("@/pages/track-deals"));
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
const OnboardingPage = lazy(() => import("@/pages/onboarding"));
const QuickAddDeal = lazy(() => import("@/pages/quick-add-deal"));
const OfflinePage = lazy(() => import("@/pages/offline"));
const QuotesPage = lazy(() => import("@/pages/quotes"));
const CommissionsPage = lazy(() => import("@/pages/commissions"));
const VerifyEmailPage = lazy(() => import("@/pages/verify-email"));
const ResendVerificationPage = lazy(() => import("@/pages/resend-verification"));
const ForgotPasswordPage = lazy(() => import("@/pages/forgot-password"));
const ResetPasswordPage = lazy(() => import("@/pages/reset-password"));
const ProgramManagement = lazy(() => import("@/pages/program-management"));
const AnalyticsReporting = lazy(() => import("@/pages/analytics-reporting"));
const ApiDocumentation = lazy(() => import("@/pages/api-documentation"));
const Webinars = lazy(() => import("@/pages/webinars"));
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

// Private route wrapper that redirects to login if not authenticated or to onboarding if not completed
function PrivateRoute({ children, bypassOnboarding = false }: { children: React.ReactNode; bypassOnboarding?: boolean }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    } else if (!isLoading && isAuthenticated && !bypassOnboarding && user && !user.hasCompletedOnboarding && location !== '/onboarding') {
      setLocation('/onboarding');
    }
  }, [isAuthenticated, isLoading, user, bypassOnboarding, setLocation]);

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

  // If user hasn't completed onboarding and we're not on the onboarding page, redirect
  if (!bypassOnboarding && user && !user.hasCompletedOnboarding && location !== '/onboarding') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Redirecting to onboarding...</div>
      </div>
    );
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Switch>
      {/* Public routes available to everyone */}
      <Route path="/signup" component={SignupPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/verify-email" component={VerifyEmailPage} />
      <Route path="/resend-verification" component={ResendVerificationPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/onboarding" component={() => <PrivateRoute bypassOnboarding={true}><OnboardingPage /></PrivateRoute>} />
      <Route path="/waitlist" component={WaitlistPage} />
      <Route path="/offline" component={OfflinePage} />
      <Route path="/partner-onboarding" component={PartnerOnboarding} />
      <Route path="/commission-structure" component={CommissionStructure} />
      <Route path="/lead-tracking" component={LeadTracking} />
      <Route path="/partner-portal" component={PartnerPortal} />
      <Route path="/about" component={About} />
      <Route path="/help-center" component={HelpCenter} />
      <Route path="/partner-recruitment" component={PartnerRecruitment} />
      <Route path="/resources/api-documentation" component={ApiDocumentation} />
      <Route path="/resources/webinars" component={Webinars} />

      {/* Home route - Landing page */}
      <Route path="/" component={Landing} />
      
      {/* Dashboard route - Protected dashboard for authenticated users */}
      <Route path="/dashboard" component={() => <PrivateRoute><Dashboard /></PrivateRoute>} />
      
      {/* Protected routes - always register but guard with PrivateRoute */}
      <Route path="/opportunities" component={() => <PrivateRoute><Opportunities /></PrivateRoute>} />
      <Route path="/contacts" component={() => <PrivateRoute><Contacts /></PrivateRoute>} />
      <Route path="/submit-deal" component={() => <PrivateRoute><SubmitDeal /></PrivateRoute>} />
      <Route path="/quick-add-deal" component={() => <PrivateRoute><QuickAddDeal /></PrivateRoute>} />
      <Route path="/training" component={() => <PrivateRoute><Training /></PrivateRoute>} />
      <Route path="/upload-bills" component={() => <PrivateRoute><UploadBills /></PrivateRoute>} />
      <Route path="/track-deals" component={() => <PrivateRoute><TrackDeals /></PrivateRoute>} />
      <Route path="/quotes" component={() => <PrivateRoute><QuotesPage /></PrivateRoute>} />
      <Route path="/commissions" component={() => <PrivateRoute><CommissionsPage /></PrivateRoute>} />
      <Route path="/team-management" component={() => <PrivateRoute><TeamManagement /></PrivateRoute>} />
      <Route path="/account/profile" component={() => <PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/account/banking" component={() => <PrivateRoute><BankingPage /></PrivateRoute>} />
      <Route path="/account/feedback" component={() => <PrivateRoute><FeedbackPage /></PrivateRoute>} />
      <Route path="/admin" component={() => <PrivateRoute><AdminPortal /></PrivateRoute>} />
      <Route path="/admin/diagnostics" component={() => <PrivateRoute><AdminDiagnostics /></PrivateRoute>} />
      <Route path="/admin/payments" component={() => <PrivateRoute><AdminPayments /></PrivateRoute>} />
      <Route path="/admin/invoices" component={() => <PrivateRoute><AdminInvoices /></PrivateRoute>} />
      <Route path="/admin/messages" component={() => <PrivateRoute><AdminMessages /></PrivateRoute>} />
      <Route path="/admin/backend" component={() => <PrivateRoute><AdminBackend /></PrivateRoute>} />
      <Route path="/vendor/program-management" component={() => <PrivateRoute><ProgramManagement /></PrivateRoute>} />
      <Route path="/vendor/analytics-reporting" component={() => <PrivateRoute><AnalyticsReporting /></PrivateRoute>} />

      {/* Catch-all for unknown routes */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* <TooltipProvider> - Temporarily disabled due to React hook violation */}
        <Router>
          {/* <ImpersonationBanner /> - Temporarily disabled due to React hook violation */}
          <ConnectionStatusNotifier />
          <Suspense fallback={<LoadingFallback />}>
            <AppRoutes />
            {/* <PWAInstallPrompt /> */}
          </Suspense>
        </Router>
        <Toaster />
      {/* </TooltipProvider> */}
    </QueryClientProvider>
  );
}

export default App;
