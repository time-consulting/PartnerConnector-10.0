import { useState } from "react";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  PlayIcon, 
  CheckIcon, 
  TrendingUpIcon, 
  UsersIcon, 
  ShieldCheckIcon,
  ArrowRightIcon,
  StarIcon,
  DollarSignIcon,
  NetworkIcon,
  TargetIcon
} from "lucide-react";

export default function Landing() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 lg:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzMzMzMzMyIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fadeIn">
              <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200" data-testid="badge-trusted">
                Join 500+ partners earning revenue through referrals
              </Badge>
              
              <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                Drive growth with{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  B2B partnerships
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
                Scale partner revenue through high-performing co-sell, affiliate, influencer and customer referrals on the only PRM with a network of partners
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => window.location.href = "/api/login"}
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

              {/* Platform stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Partners</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">£2.5M</div>
                  <div className="text-sm text-gray-600">Revenue generated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">Success rate</div>
                </div>
              </div>
            </div>

            {/* Video Section */}
            <div className="relative animate-fadeIn">
              <Card className="overflow-hidden shadow-2xl bg-gradient-to-br from-blue-500 to-purple-600">
                <CardContent className="p-0 relative aspect-video">
                  {!isVideoPlaying ? (
                    <div 
                      className="relative w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center cursor-pointer group"
                      onClick={handleVideoPlay}
                      data-testid="video-placeholder"
                    >
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="relative z-10 text-center">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-white/30 transition-colors duration-300">
                          <PlayIcon className="w-8 h-8 text-white ml-1" />
                        </div>
                        <p className="text-white font-semibold text-lg mb-2">Watch 1-minute video</p>
                        <p className="text-white/80 text-sm">See how PartnerConnector works</p>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/50 to-transparent"></div>
                    </div>
                  ) : (
                    <iframe
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                      className="w-full h-full"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      data-testid="video-iframe"
                    />
                  )}
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

      {/* Platform Features Section */}
      <section id="platform-features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700">PLATFORM FEATURES</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Learn how PartnerConnector can scale your SaaS business:
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Recruit */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-b from-blue-50 to-white">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Recruit</h3>
                <p className="text-sm text-gray-600 mb-4">Attract high-quality, great-fit partners</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Partner discovery</li>
                  <li>• Application management</li>
                  <li>• Automated onboarding</li>
                </ul>
              </CardContent>
            </Card>

            {/* Activate */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-b from-green-50 to-white">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TargetIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Activate</h3>
                <p className="text-sm text-gray-600 mb-4">Enable partners with best-in-class resources</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Training portal</li>
                  <li>• Marketing assets</li>
                  <li>• Sales enablement</li>
                </ul>
              </CardContent>
            </Card>

            {/* Track */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-b from-purple-50 to-white">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUpIcon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Track</h3>
                <p className="text-sm text-gray-600 mb-4">Monitor every partner-sourced lead</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Lead tracking</li>
                  <li>• Attribution</li>
                  <li>• Performance analytics</li>
                </ul>
              </CardContent>
            </Card>

            {/* Commission */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-b from-yellow-50 to-white">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <DollarSignIcon className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Commission</h3>
                <p className="text-sm text-gray-600 mb-4">Incentivize partners with rewards and commissions</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Automated payouts</li>
                  <li>• Multi-tier commissions</li>
                  <li>• Performance bonuses</li>
                </ul>
              </CardContent>
            </Card>

            {/* Optimize */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-b from-red-50 to-white">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <NetworkIcon className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Optimize</h3>
                <p className="text-sm text-gray-600 mb-4">Improve performance with reports and insights</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Performance insights</li>
                  <li>• ROI tracking</li>
                  <li>• Optimization tools</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4"
              onClick={() => window.location.href = "/api/login"}
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
            JOIN 500+ COMPANIES THAT USE PARTNERSTACK TO GROW AND SUSTAIN REVENUE
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
                <p className="text-sm text-gray-600">Access to network of 10,000+ verified partners</p>
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
            Ready to scale your partner ecosystem?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of companies using PartnerConnector to drive growth through partnerships
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              onClick={() => window.location.href = "/api/login"}
            >
              Start your free trial
              <ArrowRightIcon className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold"
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