import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ArrowRight,
  Target,
  Award
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out.",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/login");
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {user?.firstName || 'Partner'}!
              </h1>
              <p className="text-muted-foreground mt-1">Here's your performance overview</p>
            </div>
            <Badge className="bg-primary text-primary-foreground">
              Bronze Partner
            </Badge>
          </div>
        </div>

        {/* Stats Cards - Orange with white text */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-primary border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Deals</CardTitle>
              <FileText className="w-5 h-5 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">0</div>
              <p className="text-xs text-white/70 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Submissions this month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-primary border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Commissions</CardTitle>
              <DollarSign className="w-5 h-5 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">£0.00</div>
              <p className="text-xs text-white/70 mt-1">Lifetime earnings</p>
            </CardContent>
          </Card>

          <Card className="bg-primary border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">Team Members</CardTitle>
              <Users className="w-5 h-5 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">0</div>
              <p className="text-xs text-white/70 mt-1">Active partners in your network</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-primary border-0 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Submit a Deal</CardTitle>
                <CardDescription className="text-white/70">
                  Submit a new business deal and start earning commissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/submit-deal">
                  <Button className="w-full bg-white text-primary hover:bg-white/90">
                    Submit Deal
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-primary border-0 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Track Deals</CardTitle>
                <CardDescription className="text-white/70">
                  View and monitor the status of all your submitted deals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/track-deals">
                  <Button className="w-full bg-white text-primary hover:bg-white/90">
                    Track Deals
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-primary border-0 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">View Commissions</CardTitle>
                <CardDescription className="text-white/70">
                  Check your commission history and payment details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/commissions">
                  <Button className="w-full bg-white text-primary hover:bg-white/90">
                    View Commissions
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
