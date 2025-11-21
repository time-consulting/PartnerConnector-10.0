import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/sidebar";
import { 
  CreditCard, 
  DollarSign, 
  Bot, 
  Monitor,
  Globe,
  Calendar,
  FileText,
  Users,
  TrendingUp,
  ArrowRight,
  UserPlus,
  Target
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

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

  const products = [
    {
      id: 1,
      name: "Card Payments",
      icon: CreditCard,
      description: "Accept card payments with competitive rates",
      color: "from-primary to-amber-500"
    },
    {
      id: 2,
      name: "Business Funding",
      icon: DollarSign,
      description: "Fast business loans and funding solutions",
      color: "from-success to-emerald-500"
    },
    {
      id: 3,
      name: "AI Automation",
      icon: Bot,
      description: "Automate workflows with AI technology",
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 4,
      name: "EPOS",
      icon: Monitor,
      description: "Modern point of sale systems",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 5,
      name: "Websites",
      icon: Globe,
      description: "Professional website design and hosting",
      color: "from-indigo-500 to-purple-500"
    },
    {
      id: 6,
      name: "Restaurant Booking",
      icon: Calendar,
      description: "Table reservation management software",
      color: "from-rose-500 to-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar onExpandChange={setSidebarExpanded} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'ml-64' : 'ml-20'}`}>
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">Analytics Overview</p>
          </div>

          {/* Select Product Section */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">Select Product</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card 
                  key={product.id}
                  className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group"
                  data-testid={`card-product-${product.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${product.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                        <product.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Deals Overview Section */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">Deals Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card border-border" data-testid="card-deals-submitted">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Deals Submitted</CardTitle>
                  <FileText className="w-5 h-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground" data-testid="text-deals-count">0</div>
                  <p className="text-xs text-success flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    This month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border" data-testid="card-team-members">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle>
                  <Users className="w-5 h-5 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground" data-testid="text-team-count">0</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active partners
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border" data-testid="card-commission">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Commission This Month</CardTitle>
                  <DollarSign className="w-5 h-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground" data-testid="text-commission-amount">£0.00</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current month earnings
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-primary via-amber-500 to-orange-600 border-0 hover:shadow-lg hover:shadow-primary/30 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                    <UserPlus className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white text-lg">Add Team Member</CardTitle>
                  <p className="text-white/80 text-sm">
                    Invite partners to join your network
                  </p>
                </CardHeader>
                <CardContent>
                  <Link href="/team-management">
                    <Button className="w-full bg-white text-primary hover:bg-white/90" data-testid="button-add-team">
                      Add Team Member
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-success to-emerald-600 border-0 hover:shadow-lg hover:shadow-success/30 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white text-lg">Submit Deal</CardTitle>
                  <p className="text-white/80 text-sm">
                    Submit a new business deal
                  </p>
                </CardHeader>
                <CardContent>
                  <Link href="/submit-deal">
                    <Button className="w-full bg-white text-success hover:bg-white/90" data-testid="button-submit-deal">
                      Submit Deal
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-pink-600 border-0 hover:shadow-lg hover:shadow-purple-500/30 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white text-lg">Track Referral</CardTitle>
                  <p className="text-white/80 text-sm">
                    Monitor your deal progress
                  </p>
                </CardHeader>
                <CardContent>
                  <Link href="/track-deals">
                    <Button className="w-full bg-white text-purple-600 hover:bg-white/90" data-testid="button-track-referral">
                      Track Referral
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
