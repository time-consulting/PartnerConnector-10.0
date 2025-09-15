import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/toast-disabled";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import SideNavigation from "@/components/side-navigation";
import StatsCard from "@/components/stats-card";
import ReferralProgress from "@/components/referral-progress";
import ProgressTracker from "@/components/progress-tracker";
import NotificationCenter from "@/components/notification-center";
import QuoteSystem from "@/components/quote-system";
import AdditionalDetailsForm from "@/components/additional-details-form";
import Recommendations from "@/components/recommendations";
import SmartInsights from "@/components/smart-insights";
import OnboardingQuestionnaire from "@/components/onboarding-questionnaire";
import InteractiveTour from "@/components/interactive-tour";
import PopupPillTour, { useTourState } from "@/components/popup-pill-tour";
import QuickSetup, { useQuickSetup } from "@/components/quick-setup";
import InviteNudge, { useInviteNudge } from "@/components/invite-nudge";
import { StatsHelpTooltip, FeatureHelpTooltip } from "@/components/contextual-help-tooltip";
import WeeklyTasks from "@/components/weekly-tasks";
import InviteProgressCard from "@/components/invite-progress-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  PlusIcon, 
  UploadIcon, 
  GraduationCapIcon, 
  ChartBarIcon,
  PoundSterlingIcon,
  HandshakeIcon,
  TrendingUpIcon,
  CalendarIcon,
  NetworkIcon,
  UserPlusIcon,
  DollarSignIcon,
  UsersIcon
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [showProgressTracker, setShowProgressTracker] = useState(false);
  const [showQuoteSystem, setShowQuoteSystem] = useState(false);
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // New onboarding hooks
  const { isTourVisible, tourCompleted, startTour, completeTour, skipTour } = useTourState();
  const { showSetup, setupCompleted, completeSetup } = useQuickSetup();
  const { showNudge, dismissNudge } = useInviteNudge();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
  });

  // New user detection for streamlined onboarding
  useEffect(() => {
    if (isAuthenticated && user && stats) {
      // Check if user is new (no referrals, no commission history)
      const hasNoActivity = (stats as any)?.totalCommissions === 0 && (stats as any)?.activeReferrals === 0;
      const isFirstLogin = !setupCompleted && !tourCompleted;
      
      if (hasNoActivity && isFirstLogin) {
        setIsNewUser(true);
      }
    }
  }, [isAuthenticated, user, stats, setupCompleted, tourCompleted]);

  const { data: referrals, isLoading: referralsLoading } = useQuery({
    queryKey: ["/api/referrals"],
    enabled: isAuthenticated,
  });

  const { data: commissionApprovals, isLoading: approvalsLoading } = useQuery({
    queryKey: ["/api/commission-approvals"],
    enabled: isAuthenticated,
  });

  // Updated handlers for new onboarding flow
  const handleQuickSetupComplete = (data: any) => {
    completeSetup();
    
    toast({
      title: "Profile setup complete! 🎉", 
      description: "Now let's show you around the platform.",
    });
    
    // Start tour after quick setup
    if (!tourCompleted) {
      startTour();
    }
  };

  const handleTourComplete = () => {
    completeTour();
    
    toast({
      title: "You're all set! 🚀",
      description: "Start submitting referrals to earn your first commissions!",
    });
  };

  const handleTourSkip = () => {
    skipTour();
  };

  const handleInviteSent = (inviteData: any) => {
    // Track successful invite
    toast({
      title: "Great start! 🎯",
      description: "Your teammate will get started soon.",
    });
  };

  // Legacy handlers for fallback compatibility
  const handleOnboardingComplete = handleQuickSetupComplete;
  const handleOnboardingSkip = handleTourSkip;

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending approval</Badge>;
      case "approved":
        return <Badge className="bg-green-600 text-white">Approved</Badge>;
      case "completed":
        return <Badge className="bg-blue-600 text-white">Completed</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleReferralClick = (referral: any) => {
    setSelectedReferral(referral);
    setShowProgressTracker(true);
  };

  const handleQuoteClick = (referralId: string) => {
    // Find the referral and show quote
    if (referrals && Array.isArray(referrals)) {
      const referral = referrals.find((r: any) => r.id === referralId);
      if (referral) {
        setSelectedReferral(referral);
        setShowQuoteSystem(true);
      }
    }
  };

  const handleQuoteApproval = () => {
    // After quote approval, show additional details form
    setShowQuoteSystem(false);
    setShowAdditionalDetails(true);
  };

  const handleAdditionalDetailsComplete = () => {
    // Update referral status or refresh data
    setShowAdditionalDetails(false);
    setSelectedReferral(null);
    toast({
      title: "Application Complete",
      description: "Your application has been submitted successfully. Our team will process it shortly.",
    });
  };

  const calculateProgressToNextBonus = () => {
    const activeReferrals = (stats as any)?.activeReferrals || 0;
    const bonusThreshold = 10; // Next bonus at 10 referrals
    const remaining = Math.max(0, bonusThreshold - activeReferrals);
    const progress = Math.min(100, (activeReferrals / bonusThreshold) * 100);
    return { remaining, progress };
  };

  const progressData = calculateProgressToNextBonus();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SideNavigation />
      <div className="lg:ml-16">
        <div className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm">
          {/* Logo Section - Left */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer" data-testid="link-logo">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <NetworkIcon className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  PartnerConnector
                </h1>
              </div>
            </Link>
          </div>
          
          {/* Navigation & Notifications - Right */}
          <div className="flex items-center">
            <Navigation />
            <NotificationCenter onQuoteClick={handleQuoteClick} />
          </div>
        </div>
      
        {/* === HERO OVERVIEW SECTION (TOP) === */}
        <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Hero Welcome */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg mb-4 animate-fadeIn" data-testid="text-welcome">
                Welcome back, {(user as any)?.firstName || 'Professional'} 👋
              </h1>
              <p className="text-white/90 text-xl md:text-2xl font-medium">
                Ready to grow your earnings today?
              </p>
            </div>

            {/* Snapshot Cards - Side by Side Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300" data-testid="card-deals-submitted">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Deals Submitted</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {statsLoading ? "..." : (stats as any)?.activeReferrals?.toString() || "0"}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <HandshakeIcon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-sm text-green-600 mt-3 flex items-center">
                    <TrendingUpIcon className="w-4 h-4 mr-1" />
                    +12% this week
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300" data-testid="card-commission-pending">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Commission Pending</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        £{statsLoading ? "..." : (stats as any)?.pendingCommissions?.toLocaleString() || "2,340"}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <CalendarIcon className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <p className="text-sm text-orange-600 mt-3">
                    Processing next week
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300" data-testid="card-referrals-made">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Referrals</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {statsLoading ? "..." : (stats as any)?.totalReferrals?.toString() || (stats as any)?.activeReferrals?.toString() || "0"}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <UsersIcon className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-sm text-purple-600 mt-3 flex items-center">
                    <TrendingUpIcon className="w-4 h-4 mr-1" />
                    {((stats as any)?.successRate || 0)}% success rate
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300" data-testid="card-monthly-earnings">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">This Month</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        £{statsLoading ? "..." : (stats as any)?.monthlyEarnings?.toLocaleString() || (stats as any)?.totalCommissions?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <PoundSterlingIcon className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-sm text-green-600 mt-3">
                    +23% vs last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gamification Progress Bar */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl" data-testid="card-bonus-progress">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {progressData.remaining === 0 ? '🎉 Bonus Tier Unlocked!' : `You're ${progressData.remaining} referrals away from your next bonus tier`}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {progressData.remaining === 0 ? 'Congratulations on reaching the milestone!' : 'Keep going to unlock higher commission rates!'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-600">{Math.round(progressData.progress)}%</span>
                    <p className="text-sm text-gray-500">Complete</p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressData.progress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between mt-3 text-sm text-gray-500">
                  <span>Current: {(stats as any)?.activeReferrals || 0}</span>
                  <span>Next Bonus: 10 referrals</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* === ACTION HUB SECTION (MIDDLE) === */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to Grow Your Business? 🚀
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Take the next steps to expand your network and maximize your earning potential
              </p>
            </div>

            {/* Highlighted Growth Action - Add Team Member */}
            <div className="mb-16">
              <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-2xl overflow-hidden" data-testid="card-add-team-member">
                <CardContent className="p-10">
                  <div className="flex flex-col lg:flex-row items-center justify-between">
                    <div className="lg:w-2/3 mb-8 lg:mb-0">
                      <div className="flex items-center mb-6">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-6">
                          <UserPlusIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold text-white">Multiply Your Earnings</h3>
                          <p className="text-white/90 text-lg">Add team members and unlock bonus commissions</p>
                        </div>
                      </div>
                      <p className="text-white/80 text-lg leading-relaxed mb-6">
                        Build your referral network by inviting team members. Every successful referral from your team 
                        earns you bonus commissions on top of your individual earnings.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center bg-white/20 rounded-lg px-4 py-2">
                          <TrendingUpIcon className="w-5 h-5 text-white mr-2" />
                          <span className="text-white font-medium">+15% Team Bonus</span>
                        </div>
                        <div className="flex items-center bg-white/20 rounded-lg px-4 py-2">
                          <NetworkIcon className="w-5 h-5 text-white mr-2" />
                          <span className="text-white font-medium">Unlimited Team Size</span>
                        </div>
                        <div className="flex items-center bg-white/20 rounded-lg px-4 py-2">
                          <DollarSignIcon className="w-5 h-5 text-white mr-2" />
                          <span className="text-white font-medium">Passive Income</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="lg:w-1/3 text-center">
                      <Link href="/team-management">
                        <Button 
                          size="lg" 
                          className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl text-xl px-12 py-6 rounded-2xl font-bold transform hover:scale-105 transition-all duration-300" 
                          data-testid="button-add-team-member"
                        >
                          <UserPlusIcon className="w-6 h-6 mr-3" />
                          Add Team Member
                        </Button>
                      </Link>
                      <p className="text-white/80 text-sm mt-4">
                        Start building your network today
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions Grid - 2 Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Submit a Deal */}
              <Link href="/submit-referral">
                <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 cursor-pointer" data-testid="card-submit-deal">
                  <CardContent className="p-10 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <PlusIcon className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Submit a Deal</h3>
                    <p className="text-gray-600 text-lg mb-6">
                      Add a new business referral and start earning commissions
                    </p>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-blue-700 font-semibold">Earn upfront commissions</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Track a Referral */}
              <Link href="/track-referrals">
                <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-green-200 cursor-pointer" data-testid="card-track-referral">
                  <CardContent className="p-10 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <ChartBarIcon className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Track a Referral</h3>
                    <p className="text-gray-600 text-lg mb-6">
                      Monitor your referral progress and commission status
                    </p>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-green-700 font-semibold">Real-time updates</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* View Payout History */}
              <Link href="/account/banking">
                <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-200 cursor-pointer" data-testid="card-payout-history">
                  <CardContent className="p-10 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <PoundSterlingIcon className="w-10 h-10 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">View Payout History</h3>
                    <p className="text-gray-600 text-lg mb-6">
                      Review your earnings and payment history
                    </p>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-purple-700 font-semibold">Detailed statements</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Upload Bills */}
              <Link href="/upload-bills">
                <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-orange-200 cursor-pointer" data-testid="card-upload-bills">
                  <CardContent className="p-10 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <UploadIcon className="w-10 h-10 text-orange-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Upload Bills</h3>
                    <p className="text-gray-600 text-lg mb-6">
                      Compare processing costs and identify opportunities
                    </p>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <p className="text-orange-700 font-semibold">Save clients money</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* === ENGAGEMENT FEED SECTION (LOWER) === */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Daily Engagement Hub
              </h2>
              <p className="text-xl text-gray-600">
                Stay on top of your tasks and recent activity
              </p>
            </div>

            {/* Weekly Tasks */}
            <div className="mb-12">
              <WeeklyTasks />
            </div>

            {/* Main Content and Right Sidebar Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Recent Referrals */}
              {/* Recent Referrals */}
              <Card className="shadow-lg border-0 bg-white" data-testid="card-recent-referrals">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    Recent Referrals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {referralsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                              <div className="space-y-2">
                                <div className="h-4 bg-gray-300 rounded w-32"></div>
                                <div className="h-3 bg-gray-300 rounded w-24"></div>
                              </div>
                            </div>
                            <div className="text-right space-y-2">
                              <div className="h-4 bg-gray-300 rounded w-16"></div>
                              <div className="h-3 bg-gray-300 rounded w-20"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : referrals && (referrals as any[]).length > 0 ? (
                    <div className="space-y-4">
                      {(referrals as any[]).slice(0, 5).map((referral: any) => (
                        <div 
                          key={referral.id} 
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-all duration-300" 
                          data-testid={`referral-${referral.id}`}
                          onClick={() => handleReferralClick(referral)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                              <HandshakeIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900" data-testid={`text-business-name-${referral.id}`}>
                                {referral.businessName}
                              </p>
                              <div data-testid={`status-${referral.id}`}>
                                {getStatusBadge(referral.status)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900" data-testid={`text-commission-${referral.id}`}>
                              £{referral.estimatedCommission || "0"}
                            </p>
                            <p className="text-sm text-gray-500" data-testid={`text-date-${referral.id}`}>
                              {new Date(referral.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500" data-testid="text-no-referrals">
                        No referrals yet. Start by submitting your first referral!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Suggestions & Tips */}
              <Card className="shadow-lg border-0 bg-white" data-testid="card-suggestions">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    Daily Tips & Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                          <TrendingUpIcon className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-800">Boost Your Earnings</h4>
                          <p className="text-sm text-green-700 mt-1">
                            Focus on larger businesses (£50k+ revenue) for higher commission opportunities
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                          <UserPlusIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-800">Team Building Tip</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Invite team members to multiply your earning potential by 15% per member
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                          <ChartBarIcon className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-purple-800">Track Performance</h4>
                          <p className="text-sm text-purple-700 mt-1">
                            Check your referral progress regularly to optimize your approach
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Progress Tracker Dialog */}
        {selectedReferral && (
          <ProgressTracker
            isOpen={showProgressTracker}
            onClose={() => setShowProgressTracker(false)}
            referral={selectedReferral}
          />
        )}
        
        {/* Quote System Dialog */}
        {selectedReferral && (
          <QuoteSystem
            isOpen={showQuoteSystem}
            onClose={() => setShowQuoteSystem(false)}
            onApprove={handleQuoteApproval}
            referral={selectedReferral}
          />
        )}
        
        {/* Additional Details Form Dialog */}
        {selectedReferral && (
          <AdditionalDetailsForm
            isOpen={showAdditionalDetails}
            onClose={() => setShowAdditionalDetails(false)}
            onComplete={handleAdditionalDetailsComplete}
            referral={selectedReferral}
          />
        )}

        {/* Quick Setup Form - First time users */}
        {showSetup && isNewUser && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
            <QuickSetup
              onComplete={handleQuickSetupComplete}
              initialData={{
                firstName: (user as any)?.firstName || "",
                lastName: (user as any)?.lastName || "",
                phone: (user as any)?.phone || "",
                companyName: (user as any)?.company || "",
                country: (user as any)?.country || "gb"
              }}
            />
          </div>
        )}

        {/* Invite Nudge Banner - After profile completion */}
        <InviteNudge
          isVisible={showNudge}
          onDismiss={dismissNudge}
          onInviteSent={handleInviteSent}
          userFirstName={(user as any)?.firstName}
        />

        {/* Pop-up Pill Tour - After setup */}
        <PopupPillTour
          isVisible={isTourVisible}
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />

        {/* Legacy onboarding fallback for edge cases */}
        {showOnboarding && !showSetup && (
          <OnboardingQuestionnaire
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        )}

        {/* Legacy tour fallback */}
        {showTour && !isTourVisible && (
          <InteractiveTour
            isVisible={showTour}
            onComplete={handleTourComplete}
            onSkip={handleTourSkip}
            startStep="welcome"
          />
        )}
      </div>
    </div>
  );
}

// Commission Approval Card Component
function CommissionApprovalCard({ approval, onApprove }: { approval: any; onApprove: () => void }) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [adjustedRates, setAdjustedRates] = useState(approval.ratesData ? JSON.parse(approval.ratesData) : null);

  const ratesData = adjustedRates || {
    debitRate: "1.5",
    creditRate: "2.1",
    corporateRate: "2.3",
    secureTransactionFee: "1.5",
    platformFee: "10",
    terminalFee: "15",
    estimatedMonthlySavings: 0
  };

  return (
    <div className="bg-white border-2 border-green-300 rounded-lg p-6">
      {/* Commission Amount and Business */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-green-800">
            Commission: £{Number(approval.commissionAmount).toLocaleString()}
          </h3>
          <p className="text-gray-600">{approval.clientBusinessName}</p>
          <Badge variant="secondary" className="mt-1">
            Status: {approval.approvalStatus}
          </Badge>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-green-600">
            Client Savings: £{ratesData.estimatedMonthlySavings?.toFixed(2) || 0}/month
          </p>
          <p className="text-sm text-green-500">
            Annual: £{((ratesData.estimatedMonthlySavings || 0) * 12).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Current Rates Display */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="font-medium mb-2">Current Rates Offered:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Debit:</span> <strong>{ratesData.debitRate}%</strong>
          </div>
          <div>
            <span className="text-gray-600">Credit:</span> <strong>{ratesData.creditRate}%</strong>
          </div>
          <div>
            <span className="text-gray-600">Corporate:</span> <strong>{ratesData.corporateRate}%</strong>
          </div>
          <div>
            <span className="text-gray-600">Platform:</span> <strong>£{ratesData.platformFee}</strong>
          </div>
        </div>
      </div>

      {/* Expandable Rate Adjustment */}
      <div className="mb-4">
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {showBreakdown ? "Hide" : "Adjust"} Rates to Increase Commission
        </button>
        
        {showBreakdown && (
          <div className="mt-3 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-500 italic mb-3">Adjust rates to optimize your commission (higher rates = higher commission)</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium">Debit Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={ratesData.debitRate}
                  onChange={(e) => setAdjustedRates({...ratesData, debitRate: e.target.value})}
                  className="w-full mt-1 px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Credit Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={ratesData.creditRate}
                  onChange={(e) => setAdjustedRates({...ratesData, creditRate: e.target.value})}
                  className="w-full mt-1 px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Platform Fee (£)</label>
                <select
                  value={ratesData.platformFee}
                  onChange={(e) => setAdjustedRates({...ratesData, platformFee: e.target.value})}
                  className="w-full mt-1 px-2 py-1 border rounded text-sm"
                >
                  <option value="0">£0</option>
                  <option value="10">£10</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Admin Notes */}
      {approval.adminNotes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-800">
            <strong>Admin Notes:</strong> {approval.adminNotes}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          onClick={onApprove}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          Approve Commission
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
        >
          Request Changes
        </Button>
      </div>
    </div>
  );
}
