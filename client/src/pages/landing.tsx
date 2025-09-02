import Navigation from "@/components/navigation";
import CommissionTiers from "@/components/commission-tiers";
import HowItWorks from "@/components/how-it-works";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-white py-24 lg:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fadeIn">
              <div className="mb-6">
                <span className="inline-block bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  Trusted by 500+ Professionals
                </span>
                <h1 className="text-5xl lg:text-7xl font-black text-foreground mb-6 leading-tight">
                  Turn Your Network Into
                  <span className="block text-primary">
                    Premium Income
                  </span>
                </h1>
              </div>
              <p className="text-xl text-foreground mb-6 leading-relaxed">
                Help your clients get funding and get paid for helping. Specializing in card machines, merchant cash advances, plus utilities and insurance.
              </p>
              
              <div className="mb-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h3 className="text-lg font-semibold text-foreground mb-3">Perfect for:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-foreground">
                  <div className="flex items-center"><i className="fas fa-check text-primary mr-2"></i>Accountants</div>
                  <div className="flex items-center"><i className="fas fa-check text-primary mr-2"></i>Sales Representatives</div>
                  <div className="flex items-center"><i className="fas fa-check text-primary mr-2"></i>Business Consultants</div>
                  <div className="flex items-center"><i className="fas fa-check text-primary mr-2"></i>Financial Advisors</div>
                  <div className="flex items-center"><i className="fas fa-check text-primary mr-2"></i>Insurance Brokers</div>
                  <div className="flex items-center"><i className="fas fa-check text-primary mr-2"></i>Anyone with Business Connections</div>
                </div>
              </div>
              
              {/* Key Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">£850</div>
                  <div className="text-sm text-foreground">Average Commission</div>
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">87%</div>
                  <div className="text-sm text-foreground">Success Rate</div>
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">24-48h</div>
                  <div className="text-sm text-foreground">Quote Turnaround</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-lg px-8 py-4 font-semibold shadow-lg text-[#000000]"
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-start-referring"
                >
                  Start Earning Today
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-white text-lg px-8 py-4 font-semibold"
                  onClick={() => document.getElementById('commissions')?.scrollIntoView({ behavior: 'smooth' })}
                  data-testid="button-view-tiers"
                >
                  View Commission Tiers
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                  alt="Professional business meeting" 
                  className="rounded-2xl shadow-2xl w-full h-auto border-4 border-primary/10"
                  data-testid="img-hero"
                />
                <div className="absolute -bottom-6 -right-6 bg-accent text-black p-6 rounded-xl shadow-lg">
                  <div className="text-2xl font-bold">£20K+</div>
                  <div className="text-sm font-medium">Max Commission</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-foreground font-semibold text-lg">Trusted by leading professionals across the UK</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm font-medium text-foreground">Active Partners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">£2.5M</div>
              <div className="text-sm font-medium text-foreground">Commissions Paid</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">1,200+</div>
              <div className="text-sm font-medium text-foreground">Businesses Referred</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">4.9/5</div>
              <div className="text-sm font-medium text-foreground">Partner Rating</div>
            </div>
          </div>
        </div>
      </section>

      <CommissionTiers />
      <HowItWorks />

      {/* Trust Center - Accountant Reviews */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="text-trust-title">
              Trusted by Professional Accountants
            </h2>
            <p className="text-xl text-foreground max-w-3xl mx-auto">
              See why accountants recommend our payment solutions to their clients with confidence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Review 1 */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm" data-testid="card-review-1">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                  <i className="fas fa-user-tie text-primary text-xl"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Sarah Mitchell</h4>
                  <p className="text-sm text-muted-foreground">Chartered Accountant, Birmingham</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="fas fa-star text-yellow-400 text-sm"></i>
                ))}
              </div>
              <p className="text-foreground italic mb-4">
                "I was initially worried about how my client would be treated during the switch, but the 1-to-1 account manager made everything seamless. My client actually called to thank me for the recommendation!"
              </p>
              <div className="text-sm text-primary font-medium">
                Client saved 35% on processing fees
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm" data-testid="card-review-2">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                  <i className="fas fa-user-tie text-primary text-xl"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">James Thompson</h4>
                  <p className="text-sm text-muted-foreground">Senior Partner, Manchester</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="fas fa-star text-yellow-400 text-sm"></i>
                ))}
              </div>
              <p className="text-foreground italic mb-4">
                "The transition was so smooth I barely had to get involved. The dedicated support team handled everything professionally and my restaurant client couldn't be happier with the service."
              </p>
              <div className="text-sm text-primary font-medium">
                Earned £1,200 commission
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm" data-testid="card-review-3">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                  <i className="fas fa-user-tie text-primary text-xl"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Emma Roberts</h4>
                  <p className="text-sm text-muted-foreground">Practice Manager, London</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="fas fa-star text-yellow-400 text-sm"></i>
                ))}
              </div>
              <p className="text-foreground italic mb-4">
                "I've referred multiple clients and each time the service has been exceptional. The account managers really understand business needs and provide genuine value, not just sales pitches."
              </p>
              <div className="text-sm text-primary font-medium">
                5 successful referrals this year
              </div>
            </div>
          </div>

          {/* Trust Stats */}
          <div className="mt-16 bg-primary/5 rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">98%</div>
                <div className="text-sm font-medium text-foreground">Client Satisfaction</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">24h</div>
                <div className="text-sm font-medium text-foreground">Average Setup Time</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">1:1</div>
                <div className="text-sm font-medium text-foreground">Dedicated Support</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">0</div>
                <div className="text-sm font-medium text-foreground">Service Complaints</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">PartnerConnector</h3>
              <p className="text-blue-200 mb-4">Professional referral platform for payment processing solutions.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-blue-200 hover:text-white transition-colors" data-testid="link-linkedin">
                  <i className="fab fa-linkedin text-xl"></i>
                </a>
                <a href="#" className="text-blue-200 hover:text-white transition-colors" data-testid="link-twitter">
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a href="#" className="text-blue-200 hover:text-white transition-colors" data-testid="link-facebook">
                  <i className="fab fa-facebook text-xl"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-dashboard">Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-submit-referral">Submit Referral</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-track-commissions">Track Commissions</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-learning-portal">Learning Portal</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-help">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-contact">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-commission-guide">Commission Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-api-docs">API Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-privacy">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-terms">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-gdpr">GDPR Compliance</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-cookies">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-blue-800 mt-8 pt-8 text-center">
            <p className="text-blue-200">&copy; 2025 PartnerConnector. All rights reserved. Professional referral platform for payment processing solutions.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
