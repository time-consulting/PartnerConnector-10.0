import Navigation from "@/components/navigation";
import CommissionTiers from "@/components/commission-tiers";
import HowItWorks from "@/components/how-it-works";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary to-accent py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fadeIn">
              <div className="mb-6">
                <span className="inline-block bg-accent/20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  Trusted by 500+ Professionals
                </span>
                <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-tight">
                  Turn Your Network Into
                  <span className="block text-accent bg-gradient-to-r from-accent to-yellow-300 bg-clip-text text-transparent">
                    Premium Income
                  </span>
                </h1>
              </div>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                The UK's leading referral platform for payment processing solutions. Earn £150-£20,000+ commission per successful referral.
              </p>
              
              {/* Key Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-accent mb-1">£850</div>
                  <div className="text-sm text-white/80">Average Commission</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-accent mb-1">87%</div>
                  <div className="text-sm text-white/80">Success Rate</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-accent mb-1">24-48h</div>
                  <div className="text-sm text-white/80">Quote Turnaround</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-accent text-black hover:bg-accent/90 text-lg px-8 py-4 font-semibold shadow-lg"
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-start-referring"
                >
                  Start Earning Today
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-4 font-semibold"
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
                  className="rounded-2xl shadow-2xl w-full h-auto border-4 border-white/20"
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

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">ReferPro</h3>
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
            <p className="text-blue-200">&copy; 2024 ReferPro. All rights reserved. Professional referral platform for payment processing solutions.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
