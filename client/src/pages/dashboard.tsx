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
  Zap,
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👋</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Welcome back, {user?.firstName || 'Partner'}
              </h1>
              <p className="text-muted-foreground text-lg mt-1">Ready to grow your earnings today?</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-lg hover:shadow-indigo-500/10 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Deals</CardTitle>
              <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <span className="text-emerald-400">+0%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-card/95 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/10 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Commissions</CardTitle>
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                £0.00
              </div>
              <p className="text-xs text-muted-foreground mt-2">Lifetime earnings</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-lg hover:shadow-cyan-500/10 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle>
              <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground mt-2">Active partners in your network</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-indigo-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/50 bg-gradient-to-br from-indigo-500/5 to-card/95 backdrop-blur-sm hover:shadow-xl hover:shadow-indigo-500/20 transition-all group">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl text-foreground">Submit a Deal</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Submit a new business deal and start earning commissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/submit-deal">
                  <Button className="w-full h-11 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all font-semibold">
                    Submit Deal
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-xl hover:shadow-cyan-500/20 transition-all group">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 transition-shadow">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl text-foreground">Track Deals</CardTitle>
                <CardDescription className="text-muted-foreground">
                  View and monitor the status of all your submitted deals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/track-deals">
                  <Button variant="outline" className="w-full h-11 border-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500 transition-all font-semibold group">
                    Track Deals
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-xl hover:shadow-emerald-500/20 transition-all group">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-shadow">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl text-foreground">View Commissions</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Check your commission history and payment details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/commissions">
                  <Button variant="outline" className="w-full h-11 border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500 transition-all font-semibold group">
                    View Commissions
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Getting Started */}
        <Card className="border-border/50 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-card/95 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-foreground">Get Started</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Complete these steps to maximize your earnings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-accent/30 border border-border/50">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-400 font-bold">1</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">Submit Your First Deal</h4>
                  <p className="text-sm text-muted-foreground">Start earning by submitting your first business opportunity</p>
                </div>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                  Pending
                </Badge>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg bg-accent/30 border border-border/50">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 font-bold">2</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">Invite Team Members</h4>
                  <p className="text-sm text-muted-foreground">Build your network and earn from their deals too</p>
                </div>
                <Link href="/team-management">
                  <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10">
                    Invite Now
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg bg-accent/30 border border-border/50">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-cyan-400 font-bold">3</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">Complete Your Profile</h4>
                  <p className="text-sm text-muted-foreground">Add your payment details to receive commissions</p>
                </div>
                <Link href="/account/banking">
                  <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10">
                    Complete
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
