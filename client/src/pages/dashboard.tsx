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
  Target,
  Plus,
  Copy,
  CheckCircle
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
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-lime-400/30 border-t-lime-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
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
      gradient: "from-rose-500 via-pink-500 to-purple-500"
    },
    {
      id: 2,
      name: "Business Funding",
      icon: DollarSign,
      description: "Fast business loans and funding solutions",
      gradient: "from-lime-400 via-green-500 to-emerald-600"
    },
    {
      id: 3,
      name: "AI Automation",
      icon: Bot,
      description: "Automate workflows with AI technology",
      gradient: "from-violet-500 via-purple-500 to-fuchsia-500"
    },
    {
      id: 4,
      name: "EPOS",
      icon: Monitor,
      description: "Modern point of sale systems",
      gradient: "from-cyan-400 via-blue-500 to-indigo-600"
    },
    {
      id: 5,
      name: "Websites",
      icon: Globe,
      description: "Professional website design and hosting",
      gradient: "from-amber-400 via-orange-500 to-red-500"
    },
    {
      id: 6,
      name: "Restaurant Booking",
      icon: Calendar,
      description: "Table reservation management software",
      gradient: "from-teal-400 via-cyan-500 to-blue-500"
    }
  ];

  const teamMembers = [
    { name: "John Smith", email: "john@example.com", deals: 12, status: "active" },
    { name: "Sarah Connor", email: "sarah@example.com", deals: 8, status: "active" },
    { name: "Mike Johnson", email: "mike@example.com", deals: 5, status: "pending" },
  ];

  return (
    <div className="min-h-screen bg-[#0f1419]">
      <Sidebar onExpandChange={setSidebarExpanded} />
      
      <div className={`transition-all duration-300 ${sidebarExpanded ? 'ml-64' : 'ml-20'}`}>
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-1">
              Dashboard
            </h1>
            <p className="text-gray-500">Welcome back, {user?.firstName || 'Partner'}</p>
          </div>

          {/* Stats Overview Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-[#1a1f26] border-[#2a3441] rounded-2xl" data-testid="card-deals-submitted">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-green-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-lime-400 bg-lime-400/10 px-2 py-1 rounded-full">+12%</span>
                </div>
                <p className="text-gray-500 text-sm mb-1">Deals Submitted</p>
                <div className="text-3xl font-bold text-white" data-testid="text-deals-count">27</div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1f26] border-[#2a3441] rounded-2xl" data-testid="card-team-members">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full">+8%</span>
                </div>
                <p className="text-gray-500 text-sm mb-1">Team Members</p>
                <div className="text-3xl font-bold text-white" data-testid="text-team-count">45</div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1f26] border-[#2a3441] rounded-2xl" data-testid="card-commission">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-full">+4%</span>
                </div>
                <p className="text-gray-500 text-sm mb-1">Commission</p>
                <div className="text-3xl font-bold text-white" data-testid="text-commission-amount">£2,450</div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1f26] border-[#2a3441] rounded-2xl" data-testid="card-conversion">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">+15%</span>
                </div>
                <p className="text-gray-500 text-sm mb-1">Conversion Rate</p>
                <div className="text-3xl font-bold text-white">61%</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Products Section - Takes 2 columns */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Products</h2>
                <Link href="/submit-deal">
                  <Button variant="ghost" className="text-lime-400 hover:text-lime-300 hover:bg-lime-400/10" data-testid="button-view-all-products">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card 
                    key={product.id}
                    className={`bg-gradient-to-br ${product.gradient} border-0 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform group overflow-hidden`}
                    data-testid={`card-product-${product.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <CardContent className="p-5 h-full flex flex-col">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <product.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-white text-lg mb-1">{product.name}</h3>
                      <p className="text-white/70 text-xs line-clamp-2">{product.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Add Team Member Section */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Add Team Member</h2>
              <Card className="bg-gradient-to-br from-lime-400 via-green-500 to-emerald-600 border-0 rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                    <UserPlus className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Grow Your Team</h3>
                  <p className="text-white/80 text-sm mb-6">
                    Invite partners to join your network and earn more commissions together.
                  </p>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
                    <p className="text-white/70 text-xs mb-2">Your Referral Code</p>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-mono font-bold text-lg">PARTNER{user?.id || '123'}</span>
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" data-testid="button-copy-code">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <Link href="/team-management">
                    <Button className="w-full bg-white text-green-600 hover:bg-white/90 font-semibold rounded-xl h-12" data-testid="button-add-team">
                      <Plus className="w-5 h-5 mr-2" />
                      Add New Member
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Team Overview & Quick Actions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Overview */}
            <Card className="bg-[#1a1f26] border-[#2a3441] rounded-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">Team Overview</CardTitle>
                  <Link href="/team-management">
                    <Button variant="ghost" size="sm" className="text-lime-400 hover:text-lime-300 hover:bg-lime-400/10" data-testid="button-view-team">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#0f1419] rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{member.name}</p>
                          <p className="text-gray-500 text-xs">{member.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">{member.deals}</p>
                        <p className="text-gray-500 text-xs">Deals</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/submit-deal">
                  <Card className="bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 border-0 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform h-full">
                    <CardContent className="p-5 flex flex-col h-full">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-1">Submit Deal</h3>
                      <p className="text-white/70 text-xs">Submit a new business deal</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/track-deals">
                  <Card className="bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 border-0 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform h-full">
                    <CardContent className="p-5 flex flex-col h-full">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-1">Track Deals</h3>
                      <p className="text-white/70 text-xs">Monitor your deal progress</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/commissions">
                  <Card className="bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 border-0 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform h-full">
                    <CardContent className="p-5 flex flex-col h-full">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-1">Commissions</h3>
                      <p className="text-white/70 text-xs">View your earnings</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/quotes">
                  <Card className="bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 border-0 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform h-full">
                    <CardContent className="p-5 flex flex-col h-full">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-1">Quotes</h3>
                      <p className="text-white/70 text-xs">Manage client quotes</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
