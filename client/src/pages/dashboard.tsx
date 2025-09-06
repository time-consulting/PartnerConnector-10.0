import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
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

  // Check if user needs onboarding (new user detection)
  useEffect(() => {
    if (isAuthenticated && user && stats) {
      // Check if user is new (no referrals, no commission history)
      const hasNoActivity = (stats as any)?.totalCommissions === 0 && (stats as any)?.activeReferrals === 0;
      const isFirstLogin = localStorage.getItem('hasCompletedOnboarding') !== 'true';
      
      if (hasNoActivity && isFirstLogin) {
        setIsNewUser(true);
        setShowOnboarding(true);
      }
    }
  }, [isAuthenticated, user, stats]);

  const { data: referrals, isLoading: referralsLoading } = useQuery({
    queryKey: ["/api/referrals"],
    enabled: isAuthenticated,
  });

  const handleOnboardingComplete = (data: any) => {
    console.log('Onboarding completed with data:', data);
    localStorage.setItem('hasCompletedOnboarding', 'true');
    localStorage.setItem('onboardingData', JSON.stringify(data));
    setShowOnboarding(false);
    setShowTour(true);
    
    toast({
      title: "Welcome to PartnerConnector! 🎉",
      description: `Hi ${data.firstName}! Let's show you around the platform.`,
    });
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setShowOnboarding(false);
    setShowTour(true);
  };

  const handleTourComplete = () => {
    setShowTour(false);
    toast({
      title: "You're all set! 🚀",
      description: "Start submitting referrals to earn your first commissions!",
    });
  };

  const handleTourSkip = () => {
    setShowTour(false);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm">
        <Navigation />
        <NotificationCenter onQuoteClick={handleQuoteClick} />
      </div>
      
      {/* Dashboard Header */}
      <div className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="animate-fadeIn">
              <h1 className="text-4xl font-bold text-white drop-shadow-lg" data-testid="text-welcome">
                Welcome back, {(user as any)?.firstName || 'Professional'}
              </h1>
              <p className="text-white/90 mt-2 text-lg">Ready to earn more commissions today?</p>
            </div>
            <div className="flex items-center space-x-6 animate-fadeIn">
              <div className="text-right">
                <span className="text-white/80 text-sm block" data-testid="text-last-login">
                  Last login: Today
                </span>
                <span className="text-white font-medium">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
                  {(user as any)?.profileImageUrl ? (
                    <img 
                      src={(user as any).profileImageUrl} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                      data-testid="img-profile"
                    />
                  ) : (
                    <i className="fas fa-user text-white text-lg" data-testid="icon-default-profile"></i>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="py-12 stats-gradient relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <StatsCard
              title="Total Commissions"
              value={statsLoading ? "..." : `£${(stats as any)?.totalCommissions?.toLocaleString() || "0"}`}
              icon={PoundSterlingIcon}
              trend="+23% this month"
              iconBg="bg-green-100"
              iconColor="text-green-600"
              trendColor="text-green-600"
              testId="card-total-commissions"
            />
            
            <StatsCard
              title="Active Referrals"
              value={statsLoading ? "..." : (stats as any)?.activeReferrals?.toString() || "0"}
              icon={HandshakeIcon}
              trend="8 pending approval"
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              trendColor="text-blue-600"
              testId="card-active-referrals"
            />
            
            <StatsCard
              title="Success Rate"
              value={statsLoading ? "..." : `${(stats as any)?.successRate || 0}%`}
              icon={TrendingUpIcon}
              trend="Above average"
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
              trendColor="text-purple-600"
              testId="card-success-rate"
            />
            
            <StatsCard
              title="This Month"
              value={statsLoading ? "..." : `£${(stats as any)?.monthlyEarnings?.toLocaleString() || "0"}`}
              icon={CalendarIcon}
              trend="5 referrals completed"
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
              trendColor="text-orange-600"
              testId="card-monthly-earnings"
            />
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-b from-white to-slate-50">
        {/* Personalized Recommendations and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Recommendations 
            userStats={stats} 
            userReferrals={referrals as any[]} 
            isLoading={statsLoading || referralsLoading} 
          />
          <SmartInsights 
            userStats={stats} 
            userReferrals={referrals as any[]} 
            isLoading={statsLoading || referralsLoading} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Referrals */}
          <Card className="card-hover shadow-lg border-0 bg-white/80 backdrop-blur-sm" data-testid="card-recent-referrals">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Recent Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {referralsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
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
                      className="flex items-center justify-between p-4 bg-white/60 rounded-xl hover:bg-white/80 cursor-pointer transition-all duration-300 border border-gray-100 hover:border-primary/20 hover:shadow-md" 
                      data-testid={`referral-${referral.id}`}
                      onClick={() => handleReferralClick(referral)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                          <i className="fas fa-store text-primary-foreground text-sm"></i>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground" data-testid={`text-business-name-${referral.id}`}>
                            {referral.businessName}
                          </p>
                          <div data-testid={`status-${referral.id}`}>
                            {getStatusBadge(referral.status)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground" data-testid={`text-commission-${referral.id}`}>
                          £{referral.estimatedCommission || "0"}
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`text-date-${referral.id}`}>
                          {new Date(referral.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground" data-testid="text-no-referrals">
                    No referrals yet. Start by submitting your first referral!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Referral Progress Tracker */}
          <ReferralProgress />

          {/* Network Building Section */}
          <Card className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-100 border-0">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <div className="lg:w-2/3 mb-6 lg:mb-0">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                      <NetworkIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Expand Your Referral Network</h3>
                      <p className="text-blue-700 font-medium">Multiply your earning potential</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-lg mb-4">
                    Build a powerful referral network by inviting team members and enabling your customers to refer business. 
                    Each additional referrer increases your total commission potential.
                  </p>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center bg-white/70 rounded-lg px-4 py-2">
                      <UserPlusIcon className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Team Invitations</span>
                    </div>
                    <div className="flex items-center bg-white/70 rounded-lg px-4 py-2">
                      <TrendingUpIcon className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Customer Referrals</span>
                    </div>
                    <div className="flex items-center bg-white/70 rounded-lg px-4 py-2">
                      <DollarSignIcon className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Bonus Commissions</span>
                    </div>
                  </div>
                </div>
                
                <div className="lg:w-1/3 text-center">
                  <Link href="/team-management">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg" data-testid="button-build-network">
                      <UsersIcon className="w-5 h-5 mr-2" />
                      Start Building Network
                    </Button>
                  </Link>
                  <p className="text-sm text-gray-600 mt-3">
                    Enable customer referrals and invite team members to maximize your earning potential
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="card-hover shadow-lg border-0 bg-white/80 backdrop-blur-sm" data-testid="card-quick-actions">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-transparent">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Link href="/submit-referral">
                  <Button className="w-full justify-start text-left h-auto p-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300" data-testid="button-submit-referral">
                    <div className="flex items-center space-x-3">
                      <PlusIcon className="w-5 h-5" />
                      <div>
                        <p className="font-semibold">Submit New Referral</p>
                        <p className="text-sm text-muted-foreground">Add a new business referral</p>
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/upload-bills">
                  <Button variant="outline" className="w-full justify-start text-left h-auto p-4 border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300" data-testid="button-upload-bills">
                    <div className="flex items-center space-x-3">
                      <UploadIcon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">Upload Bills</p>
                        <p className="text-sm text-muted-foreground">Compare current processing costs</p>
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/learning-portal">
                  <Button variant="outline" className="w-full justify-start text-left h-auto p-4 border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300" data-testid="button-learning-portal">
                    <div className="flex items-center space-x-3">
                      <GraduationCapIcon className="w-5 h-5 text-accent" />
                      <div>
                        <p className="font-semibold">Learning Portal</p>
                        <p className="text-sm text-muted-foreground">Commission calculation guides</p>
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/track-referrals">
                  <Button variant="outline" className="w-full justify-start text-left h-auto p-4 border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300" data-testid="button-track-commissions">
                    <div className="flex items-center space-x-3">
                      <ChartBarIcon className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-semibold">Track Referrals</p>
                        <p className="text-sm text-muted-foreground">Monitor progress and commissions</p>
                      </div>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
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

      {/* Onboarding Questionnaire */}
      {showOnboarding && (
        <OnboardingQuestionnaire
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      {/* Interactive Tour */}
      <InteractiveTour
        isVisible={showTour}
        onComplete={handleTourComplete}
        onSkip={handleTourSkip}
        startStep="welcome"
      />
    </div>
  );
}
