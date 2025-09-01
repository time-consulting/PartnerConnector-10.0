import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import StatsCard from "@/components/stats-card";
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
  CalendarIcon
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

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

  const { data: referrals, isLoading: referralsLoading } = useQuery({
    queryKey: ["/api/referrals"],
    enabled: isAuthenticated,
  });

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Dashboard Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-welcome">
                Welcome back, {(user as any)?.firstName || 'Professional'}
              </h1>
              <p className="text-blue-200 mt-1">Ready to earn more commissions today?</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-blue-200 text-sm" data-testid="text-last-login">
                Last login: Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
                {(user as any)?.profileImageUrl ? (
                  <img 
                    src={(user as any).profileImageUrl} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                    data-testid="img-profile"
                  />
                ) : (
                  <i className="fas fa-user text-white" data-testid="icon-default-profile"></i>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Referrals */}
          <Card data-testid="card-recent-referrals">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Recent Referrals</CardTitle>
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
                    <div key={referral.id} className="flex items-center justify-between p-4 bg-muted rounded-lg" data-testid={`referral-${referral.id}`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
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

          {/* Quick Actions */}
          <Card data-testid="card-quick-actions">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Link href="/submit-referral">
                  <Button className="w-full justify-start text-left h-auto p-4" data-testid="button-submit-referral">
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
                  <Button variant="outline" className="w-full justify-start text-left h-auto p-4" data-testid="button-upload-bills">
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
                  <Button variant="outline" className="w-full justify-start text-left h-auto p-4" data-testid="button-learning-portal">
                    <div className="flex items-center space-x-3">
                      <GraduationCapIcon className="w-5 h-5 text-accent" />
                      <div>
                        <p className="font-semibold">Learning Portal</p>
                        <p className="text-sm text-muted-foreground">Commission calculation guides</p>
                      </div>
                    </div>
                  </Button>
                </Link>

                <Button variant="outline" className="w-full justify-start text-left h-auto p-4" data-testid="button-track-commissions">
                  <div className="flex items-center space-x-3">
                    <ChartBarIcon className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold">Track Commissions</p>
                      <p className="text-sm text-muted-foreground">View detailed earnings breakdown</p>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
