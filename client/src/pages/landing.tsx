import Navigation from "@/components/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckIcon, 
  TrendingUpIcon, 
  UsersIcon, 
  ShieldCheckIcon,
  ArrowRightIcon,
  StarIcon,
  DollarSignIcon,
  NetworkIcon,
  TargetIcon,
  CreditCardIcon,
  HandshakeIcon,
  Home,
  BarChart3
} from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  const { isAuthenticated, user, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />
      
      {/* Authenticated User Hero Section */}
      {isAuthenticated && !isLoading && (
        <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-16 lg:py-24">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzMzMzMzMyIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPC9zdmc=')] opacity-30"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="animate-fadeIn text-center lg:text-left">
                <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-200" data-testid="badge-welcome-back">
                  Welcome back, {(user as any)?.firstName || 'Partner'}
                </Badge>
                
                <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                  Ready to{" "}
                  <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    manage your success?
                  </span>
                </h1>
                
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Access your dashboard to track referrals, monitor commissions, and manage your growing partner network.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link href="/dashboard">
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      data-testid="button-go-dashboard"
                    >
                      <Home className="mr-2 w-5 h-5" />
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link href="/submit-referral">
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg font-semibold transition-all duration-300"
                      data-testid="button-submit-referral"
                    >
                      Submit New Referral
                      <ArrowRightIcon className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>

                {/* Quick access shortcuts */}
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/opportunities">
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
                      <div className="flex items-center gap-3">
                        <UsersIcon className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900">Opportunities</div>
                          <div className="text-sm text-gray-600">Manage contacts</div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                  <Link href="/track-referrals">
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-green-500">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium text-gray-900">Track Progress</div>
                          <div className="text-sm text-gray-600">View analytics</div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </div>
              </div>
              
              {/* Dashboard Preview */}
              <div className="relative animate-fadeIn">
                <Card className="overflow-hidden shadow-2xl bg-gradient-to-br from-green-500 to-blue-600">
                  <CardContent className="p-8 relative aspect-video flex items-center justify-center">
                    <div className="relative w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center rounded-lg">
                      <div className="absolute inset-0 bg-black/10 rounded-lg"></div>
                      
                      <div className="relative z-10 text-center text-white">
                        <Home className="w-16 h-16 mx-auto mb-4 animate-pulse" />
                        <h3 className="text-2xl font-bold mb-2">Your Dashboard Awaits</h3>
                        <p className="text-white/90">Manage your partnership success</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Standard Hero Section for Non-Authenticated Users */}
      {!isAuthenticated && !isLoading && (
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 lg:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzMzMzMzMyIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fadeIn">
              <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200" data-testid="badge-trusted">
                Trusted by professionals nationwide
              </Badge>
              
              <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                Empower Your Clients With the{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Right partner
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
                Connect your clients with the services they need. Stay in control, strengthen relationships, and earn from every partnership.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => window.open('https://api.leadconnectorhq.com/widget/booking/81iXxx9KCxtnaSgEEiim', '_blank')}
                  data-testid="button-book-demo"
                >
                  Book a demo
                  <ArrowRightIcon className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg font-semibold transition-all duration-300"
                  onClick={() => document.getElementById('platform-features')?.scrollIntoView({ behavior: 'smooth' })}
                  data-testid="button-platform-features"
                >
                  Platform features
                  <ArrowRightIcon className="ml-2 w-5 h-5" />
                </Button>
              </div>

              {/* Partnership stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">verified</div>
                  <div className="text-sm text-gray-600">Solutions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">£1.2M</div>
                  <div className="text-sm text-gray-600">Commissions paid</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">60%</div>
                  <div className="text-sm text-gray-600">Commission rate</div>
                </div>
              </div>
            </div>

            {/* Partnership Connection Animation */}
            <div className="relative animate-fadeIn">
              <Card className="overflow-hidden shadow-2xl bg-gradient-to-br from-blue-500 to-purple-600">
                <CardContent className="p-8 relative aspect-video flex items-center justify-center">
                  <div className="relative w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center rounded-lg">
                    <div className="absolute inset-0 bg-black/10 rounded-lg"></div>
                    
                    {/* Animated Partnership Connection */}
                    <div className="relative z-10 w-full max-w-md">
                      <div className="flex items-center justify-between">
                        {/* You */}
                        <div className="text-center animate-pulse">
                          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center mb-3 shadow-lg">
                            <UsersIcon className="w-8 h-8 text-blue-600" />
                          </div>
                          <p className="text-white font-semibold text-sm">You</p>
                          <p className="text-white/80 text-xs">Professional</p>
                        </div>
                        
                        {/* Connection Lines */}
                        <div className="flex-1 px-4">
                          <div className="relative">
                            <div className="h-0.5 bg-white/60 animate-pulse"></div>
                            <HandshakeIcon className="w-6 h-6 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 rounded-full p-1 animate-bounce" />
                          </div>
                        </div>
                        
                        {/* Client */}
                        <div className="text-center animate-pulse" style={{animationDelay: '0.5s'}}>
                          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center mb-3 shadow-lg">
                            <TargetIcon className="w-8 h-8 text-purple-600" />
                          </div>
                          <p className="text-white font-semibold text-sm">Client</p>
                          <p className="text-white/80 text-xs">Business</p>
                        </div>
                      </div>
                      
                      {/* Services */}
                      <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center animate-pulse" style={{animationDelay: '1s'}}>
                          <CreditCardIcon className="w-6 h-6 text-white mx-auto mb-2" />
                          <p className="text-white text-xs font-medium">Card Payments</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center animate-pulse" style={{animationDelay: '1.5s'}}>
                          <DollarSignIcon className="w-6 h-6 text-white mx-auto mb-2" />
                          <p className="text-white text-xs font-medium">Business Funding</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center gap-2">
                  <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-semibold text-gray-900">4.9/5</span>
                  <span className="text-gray-600 text-sm">partner rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}
      
      {/* Partnership Features Section - Visible to all users */}
      <section id="platform-features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700">PARTNERSHIP SOLUTIONS</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Build your business through strategic partnerships
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Focus on card payment solutions and business funding - connecting your clients with the right financial services they need while earning substantial commissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Connect Clients */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-b from-blue-50 to-white">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <HandshakeIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Connect Clients</h3>
                <p className="text-sm text-gray-600 mb-4">Match clients with payment and funding solutions</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Card payment systems</li>
                  <li>• Business funding options</li>
                  <li>• Tailored recommendations</li>
                </ul>
              </CardContent>
            </Card>

            {/* Earn Commission */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-b from-green-50 to-white">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <DollarSignIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Earn Commission</h3>
                <p className="text-sm text-gray-600 mb-4">Receive up to 60% commission on every successful connection</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Upfront commissions</li>
                  <li>• Fast payouts</li>
                  <li>• Transparent tracking</li>
                </ul>
              </CardContent>
            </Card>

            {/* Build Team */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-b from-purple-50 to-white">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Build Team</h3>
                <p className="text-sm text-gray-600 mb-4">Grow your network and earn from team connections</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Team recruitment</li>
                  <li>• Training support</li>
                  <li>• Ongoing income</li>
                </ul>
              </CardContent>
            </Card>

            {/* Track Success */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-b from-yellow-50 to-white">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUpIcon className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Track Success</h3>
                <p className="text-sm text-gray-600 mb-4">Monitor your connections and commission earnings</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Real-time dashboard</li>
                  <li>• Commission tracking</li>
                  <li>• Performance insights</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4"
              onClick={() => window.open('https://api.leadconnectorhq.com/widget/booking/81iXxx9KCxtnaSgEEiim', '_blank')}
            >
              Book a demo
              <ArrowRightIcon className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="ml-4 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4"
            >
              Platform features
              <ArrowRightIcon className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>
      {/* Social Proof */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 font-medium mb-8">
            JOIN PROFESSIONALS NATIONWIDE EARNING COMMISSION THROUGH PARTNERSHIP CONNECTIONS
          </p>
          <div className="flex justify-center">
            <Button 
              variant="link" 
              className="text-blue-600 hover:text-blue-700"
              data-testid="button-customer-stories"
            >
              View our customer stories →
            </Button>
          </div>
        </div>
      </section>
      {/* Trust Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-green-100 text-green-700">TRUSTED BY PROFESSIONALS</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Built for scale, trusted by industry leaders
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our platform powers partnership programs for companies of all sizes, from startups to enterprise organizations.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckIcon className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Enterprise-grade security and compliance</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckIcon className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">24/7 dedicated support team</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckIcon className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">99.9% uptime SLA guarantee</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckIcon className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Multi-level commission tracking</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6 text-center border-0 bg-gradient-to-b from-blue-50 to-white">
                <ShieldCheckIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Security</h3>
                <p className="text-sm text-gray-600">SOC 2 Type II certified with bank-level security</p>
              </Card>
              
              <Card className="p-6 text-center border-0 bg-gradient-to-b from-green-50 to-white">
                <TrendingUpIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Growth</h3>
                <p className="text-sm text-gray-600">Average 3x increase in partner-driven revenue</p>
              </Card>
              
              <Card className="p-6 text-center border-0 bg-gradient-to-b from-purple-50 to-white">
                <UsersIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Partners</h3>
                <p className="text-sm text-gray-600">Access to network of verified partners</p>
              </Card>
              
              <Card className="p-6 text-center border-0 bg-gradient-to-b from-yellow-50 to-white">
                <DollarSignIcon className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">ROI</h3>
                <p className="text-sm text-gray-600">250% average return on partnership investment</p>
              </Card>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Empower Your Clients With the Right partner
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Connect your clients with partners your clients want and need while earning substantial commissions. Build a thriving business and grow your team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              onClick={() => window.location.href = "/api/login"}
            >
              Join free today
              <ArrowRightIcon className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold"
              onClick={() => window.open('https://api.leadconnectorhq.com/widget/booking/81iXxx9KCxtnaSgEEiim', '_blank')}
            >
              Schedule a demo
              <ArrowRightIcon className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">PartnerConnector</h3>
              <p className="text-gray-400 mb-4">
                The leading partner relationship management platform for scaling B2B partnerships.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Partner Recruitment</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Lead Tracking</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Commission Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analytics & Reports</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Partner Portal</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Customer Stories</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2025 PartnerConnector. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}