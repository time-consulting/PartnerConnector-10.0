import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ArrowRight,
  Zap,
  Target,
  Award,
  Gift,
  Rocket,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const [bonusProgress, setBonusProgress] = useState(0);
  const [dealsSubmitted, setDealsSubmitted] = useState(0);

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

    // Calculate bonus progress (first 10 submissions get bonus)
    const progress = Math.min((dealsSubmitted / 10) * 100, 100);
    setBonusProgress(progress);
  }, [isAuthenticated, isLoading, toast, setLocation, dealsSubmitted]);

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

  const remainingForBonus = Math.max(10 - dealsSubmitted, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-slate-950 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-slideDown">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-bounce-slow">
                <span className="text-3xl">👋</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Welcome back, {user?.firstName || 'Partner'}!
                </h1>
                <p className="text-muted-foreground text-sm md:text-base mt-1">Your success dashboard • Updated in real-time</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 text-sm font-semibold shadow-lg shadow-emerald-500/30 hidden md:flex">
              <Award className="w-4 h-4 mr-2" />
              Bronze Partner
            </Badge>
          </div>
        </div>

        {/* Bonus Progress Banner */}
        <Card className="mb-8 border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-card/95 backdrop-blur-sm shadow-xl shadow-indigo-500/20 animate-slideUp">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    First 10 Deals Bonus Challenge
                    <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {remainingForBonus > 0 
                      ? `Submit ${remainingForBonus} more ${remainingForBonus === 1 ? 'deal' : 'deals'} to unlock £500 bonus!`
                      : "Congratulations! Bonus unlocked! 🎉"
                    }
                  </p>
                </div>
              </div>
              <div className="text-right hidden md:block">
                <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  {dealsSubmitted}/10
                </div>
                <p className="text-xs text-muted-foreground">Deals Submitted</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold text-foreground">{Math.round(bonusProgress)}%</span>
              </div>
              <Progress value={bonusProgress} className="h-3 bg-muted/50" />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Rocket className="w-3 h-3" />
                Keep going! You're doing great!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-lg hover:shadow-indigo-500/20 transition-all hover:scale-105 animate-fadeIn" style={{animationDelay: '0.1s'}}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Deals</CardTitle>
              <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{dealsSubmitted}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">+0%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-card/95 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/20 transition-all hover:scale-105 animate-fadeIn" style={{animationDelay: '0.2s'}}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Est. Commission</CardTitle>
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                £0.00
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pending approval</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-lg hover:shadow-cyan-500/20 transition-all hover:scale-105 animate-fadeIn" style={{animationDelay: '0.3s'}}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle>
              <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground mt-1">Active in your network</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-emerald-500/10 to-card/95 backdrop-blur-sm hover:shadow-lg hover:shadow-emerald-500/20 transition-all hover:scale-105 animate-fadeIn" style={{animationDelay: '0.4s'}}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">--%</div>
              <p className="text-xs text-muted-foreground mt-1">Conversion rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Quick Actions - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-foreground">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-card/95 backdrop-blur-sm hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all group cursor-pointer">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/40 group-hover:shadow-indigo-500/60 group-hover:scale-110 transition-all">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-foreground">Submit Deal</CardTitle>
                  <CardDescription className="text-muted-foreground text-base">
                    Submit a new business and earn up to 60% commission
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/submit-deal">
                    <Button className="w-full h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/40 group-hover:shadow-indigo-500/60 transition-all font-semibold text-base">
                      Get Started
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </Link>
                  <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" />
                    Takes only 5 minutes
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-card/95 backdrop-blur-sm hover:shadow-2xl hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all group cursor-pointer">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/40 group-hover:shadow-cyan-500/60 group-hover:scale-110 transition-all">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-foreground">Invite Team</CardTitle>
                  <CardDescription className="text-muted-foreground text-base">
                    Build your network and earn from their success
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/team-management">
                    <Button variant="outline" className="w-full h-12 border-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500 transition-all font-semibold text-base group">
                      Invite Now
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </Link>
                  <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
                    <Gift className="w-3 h-3" />
                    Earn 20% from their deals
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Activity Chart */}
            <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-foreground flex items-center gap-2">
                      <Activity className="w-5 h-5 text-indigo-400" />
                      Deal Pipeline
                    </CardTitle>
                    <CardDescription>Your submissions over the last 30 days</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30">
                    Last 30 days
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Simple bar chart representation */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-24">Submitted</span>
                    <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-0 transition-all duration-1000" style={{width: `${(dealsSubmitted / 10) * 100}%`}}></div>
                    </div>
                    <span className="text-sm font-semibold text-foreground w-12 text-right">{dealsSubmitted}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-24">Approved</span>
                    <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 w-0"></div>
                    </div>
                    <span className="text-sm font-semibold text-foreground w-12 text-right">0</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-24">In Review</span>
                    <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 w-0"></div>
                    </div>
                    <span className="text-sm font-semibold text-foreground w-12 text-right">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Tips & Recent Activity */}
          <div className="space-y-6">
            {/* Tips Section */}
            <Card className="border-border/50 bg-gradient-to-br from-yellow-500/10 to-card/95 backdrop-blur-sm border-l-4 border-l-yellow-500">
              <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Quick wins</p>
                    <p className="text-xs text-muted-foreground mt-1">Focus on businesses processing £10k+/month for better conversions</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Team bonus</p>
                    <p className="text-xs text-muted-foreground mt-1">Invite 3 partners this month for an extra £200 bonus</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Level up</p>
                    <p className="text-xs text-muted-foreground mt-1">5 more deals to reach Silver Partner status</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dealsSubmitted === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No activity yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Submit your first deal to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors">
                      <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">Deal submitted</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Tech Solutions Ltd • 2 hours ago</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/track-deals">
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent">
                    <Target className="w-4 h-4 mr-2" />
                    Track Deals
                  </Button>
                </Link>
                <Link href="/commissions">
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent">
                    <DollarSign className="w-4 h-4 mr-2" />
                    View Commissions
                  </Button>
                </Link>
                <Link href="/training">
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent">
                    <Award className="w-4 h-4 mr-2" />
                    Training Hub
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.6s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
