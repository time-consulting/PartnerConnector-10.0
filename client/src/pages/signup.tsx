import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckIcon, 
  ArrowRightIcon,
  DollarSignIcon,
  TrendingUpIcon,
  UsersIcon,
  NetworkIcon,
  SparklesIcon,
  HandshakeIcon,
  TrophyIcon
} from "lucide-react";

export default function SignupPage() {
  const [location] = useLocation();
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [location]);

  const handleGetStarted = () => {
    if (referralCode) {
      sessionStorage.setItem('referralCode', referralCode);
      window.location.href = `/login?ref=${encodeURIComponent(referralCode)}`;
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-green-50 to-emerald-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzMzMzMzMyIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left animate-fadeIn">
              {referralCode ? (
                <Badge className="mb-6 bg-gradient-to-r from-teal-600 to-green-600 text-white hover:from-teal-700 hover:to-green-700 px-4 py-2 text-sm" data-testid="badge-invited">
                  <SparklesIcon className="w-4 h-4 mr-2 inline" />
                  You've Been Invited!
                </Badge>
              ) : (
                <Badge className="mb-6 bg-teal-100 text-teal-700 hover:bg-teal-200 px-4 py-2 text-sm" data-testid="badge-join">
                  Join the Network
                </Badge>
              )}
              
              <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight" data-testid="heading-main">
                {referralCode ? (
                  <>You've been invited to join{" "}
                    <span className="bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
                      PartnerConnector
                    </span>
                  </>
                ) : (
                  <>Join{" "}
                    <span className="bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
                      PartnerConnector
                    </span>
                  </>
                )}
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed" data-testid="text-description">
                {referralCode ? (
                  <>
                    A partner has referred you to join our exclusive network. Start building your partnership business and earn substantial commissions by connecting clients with the financial services they need.
                  </>
                ) : (
                  <>
                    Join our exclusive partnership network and start earning commissions by connecting clients with the financial services they need.
                  </>
                )}
              </p>

              {referralCode && (
                <div className="mb-8 p-4 bg-white/60 backdrop-blur-sm rounded-xl border-2 border-teal-200" data-testid="referral-code-display">
                  <p className="text-sm text-gray-600 mb-1">Your Referral Code</p>
                  <p className="text-2xl font-bold text-teal-600 font-mono tracking-wider" data-testid="text-referral-code">{referralCode}</p>
                </div>
              )}

              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white px-10 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                onClick={handleGetStarted}
                data-testid="button-get-started"
              >
                Get Started
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </Button>

              <p className="text-sm text-gray-500 mt-4" data-testid="text-signup-info">
                Sign up now and start earning today
              </p>
            </div>

            {/* Right Column - Visual */}
            <div className="relative animate-fadeIn" style={{animationDelay: '0.2s'}}>
              <Card className="overflow-hidden shadow-2xl bg-gradient-to-br from-teal-500 to-green-600 border-0">
                <CardContent className="p-8 relative">
                  <div className="relative w-full bg-gradient-to-br from-teal-400 to-green-500 flex flex-col items-center justify-center rounded-2xl p-8 min-h-[400px]">
                    <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
                    
                    {/* Partnership Visual */}
                    <div className="relative z-10 w-full">
                      <div className="flex items-center justify-center mb-8">
                        <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                          <HandshakeIcon className="w-10 h-10 text-teal-600" />
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white text-center mb-6">
                        Partnership Opportunity
                      </h3>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl p-4">
                          <div className="w-10 h-10 bg-white/90 rounded-lg flex items-center justify-center">
                            <TrophyIcon className="w-5 h-5 text-teal-600" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">Connect Clients</p>
                            <p className="text-white/80 text-sm">Match with financial services</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl p-4">
                          <div className="w-10 h-10 bg-white/90 rounded-lg flex items-center justify-center">
                            <DollarSignIcon className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">Earn Commissions</p>
                            <p className="text-white/80 text-sm">Up to 60% on every deal</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl p-4">
                          <div className="w-10 h-10 bg-white/90 rounded-lg flex items-center justify-center">
                            <NetworkIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">Build Network</p>
                            <p className="text-white/80 text-sm">Grow your team earnings</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Commission Structure Section - Dojo Style */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-100 text-green-700" data-testid="badge-commission">
              COMMISSION STRUCTURE
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4" data-testid="heading-commission">
              Multi-Level Earnings System
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Earn not just from your direct referrals, but also from your network's growth through our multi-level commission structure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Level 1 - Direct Referrals */}
            <Card className="border-4 border-teal-500 bg-gradient-to-b from-teal-50 to-white hover:shadow-xl transition-shadow duration-300" data-testid="card-level-1">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <DollarSignIcon className="w-10 h-10 text-white" />
                </div>
                <div className="mb-4">
                  <div className="text-5xl font-extrabold text-teal-600 mb-2" data-testid="text-level-1-percentage">60%</div>
                  <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Level 1 - Direct</div>
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Your Direct Referrals</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Earn 60% commission on every successful deal from clients you directly refer to the platform.
                </p>
              </CardContent>
            </Card>

            {/* Level 2 - Team Referrals */}
            <Card className="border-4 border-green-500 bg-gradient-to-b from-green-50 to-white hover:shadow-xl transition-shadow duration-300" data-testid="card-level-2">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <UsersIcon className="w-10 h-10 text-white" />
                </div>
                <div className="mb-4">
                  <div className="text-5xl font-extrabold text-green-600 mb-2" data-testid="text-level-2-percentage">20%</div>
                  <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Level 2 - Team</div>
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Your Team's Referrals</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Receive 20% commission on deals closed by partners you recruit into your network.
                </p>
              </CardContent>
            </Card>

            {/* Level 3 - Extended Network */}
            <Card className="border-4 border-emerald-500 bg-gradient-to-b from-emerald-50 to-white hover:shadow-xl transition-shadow duration-300" data-testid="card-level-3">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <NetworkIcon className="w-10 h-10 text-white" />
                </div>
                <div className="mb-4">
                  <div className="text-5xl font-extrabold text-emerald-600 mb-2" data-testid="text-level-3-percentage">10%</div>
                  <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Level 3 - Network</div>
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Extended Network</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Earn 10% commission on deals from your team's recruited partners, building passive income.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Example Calculation */}
          <Card className="mt-12 max-w-3xl mx-auto bg-gradient-to-r from-teal-500 to-green-600 border-0" data-testid="card-example">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Example: Monthly Earnings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white mb-2" data-testid="text-example-level-1">£3,000</div>
                  <div className="text-white/90 text-sm mb-1">5 direct deals</div>
                  <div className="text-white/80 text-xs">@ 60% commission</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white mb-2" data-testid="text-example-level-2">£1,000</div>
                  <div className="text-white/90 text-sm mb-1">5 team deals</div>
                  <div className="text-white/80 text-xs">@ 20% commission</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white mb-2" data-testid="text-example-level-3">£500</div>
                  <div className="text-white/90 text-sm mb-1">5 network deals</div>
                  <div className="text-white/80 text-xs">@ 10% commission</div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/30 text-center">
                <div className="text-sm text-white/90 mb-2">Total Monthly Earnings</div>
                <div className="text-5xl font-extrabold text-white" data-testid="text-total-earnings">£4,500</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Getting started is simple - follow these three steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 border-gray-200 bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-teal-600">1</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-3">Sign Up</h3>
                <p className="text-sm text-gray-600">
                  Create your account and complete the quick verification process.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-3">Connect Clients</h3>
                <p className="text-sm text-gray-600">
                  Submit referrals for clients who need payment or funding solutions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-emerald-600">3</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-3">Earn Commissions</h3>
                <p className="text-sm text-gray-600">
                  Get paid when your referrals convert to successful partnerships.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Join PartnerConnector?</h2>
            <p className="text-lg text-gray-600">Everything you need to succeed as a partner</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 bg-gradient-to-b from-teal-50 to-white p-6 text-center">
              <DollarSignIcon className="w-12 h-12 text-teal-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">High Commissions</h3>
              <p className="text-sm text-gray-600">Up to 60% on direct referrals</p>
            </Card>

            <Card className="border-0 bg-gradient-to-b from-green-50 to-white p-6 text-center">
              <TrendingUpIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Passive Income</h3>
              <p className="text-sm text-gray-600">Earn from your network's growth</p>
            </Card>

            <Card className="border-0 bg-gradient-to-b from-blue-50 to-white p-6 text-center">
              <CheckIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Full Support</h3>
              <p className="text-sm text-gray-600">24/7 partner assistance</p>
            </Card>

            <Card className="border-0 bg-gradient-to-b from-purple-50 to-white p-6 text-center">
              <TrophyIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Proven System</h3>
              <p className="text-sm text-gray-600">Trusted by 500+ partners</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            {referralCode ? "Your Referral is Waiting" : "Ready to Start Earning?"}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {referralCode 
              ? "Join now and start building your partnership business today" 
              : "Sign up now and start connecting clients with the services they need"
            }
          </p>
          <Button 
            size="lg"
            className="bg-white text-teal-600 hover:bg-gray-100 px-10 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
            onClick={handleGetStarted}
            data-testid="button-cta-get-started"
          >
            Get Started Now
            <ArrowRightIcon className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
