import { Card, CardContent } from "@/components/ui/card";

export default function CommissionTiers() {
  return (
    <section id="commissions" className="py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="text-commission-title">
            Commission Tiers
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Earn substantial commissions based on business size and transaction volume. The bigger the referral, the bigger your reward.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Small Traders Tier */}
          <Card className="card-hover border border-border" data-testid="card-tier-small">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-store text-blue-600 text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Small Traders</h3>
                <p className="text-muted-foreground">Independent shops, cafes, small retailers</p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Commission Range</span>
                  <span className="text-2xl font-bold text-primary" data-testid="text-commission-small">£150-£500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Monthly Volume</span>
                  <span className="font-semibold text-foreground">£5K - £50K</span>
                </div>
              </div>
              
              <p className="text-sm text-foreground leading-relaxed">
                Perfect for independent businesses looking for competitive payment processing rates with flexible terms.
              </p>
            </CardContent>
          </Card>

          {/* Restaurants Tier */}
          <Card className="card-hover border-2 border-primary relative" data-testid="card-tier-restaurant">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-utensils text-primary text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Restaurants & Hospitality</h3>
                <p className="text-muted-foreground">Restaurants, bars, hotels, hospitality venues</p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Commission Range</span>
                  <span className="text-2xl font-bold text-primary" data-testid="text-commission-restaurant">£500-£5,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Monthly Volume</span>
                  <span className="font-semibold text-foreground">£50K - £500K</span>
                </div>
              </div>
              
              <p className="text-sm text-foreground leading-relaxed">
                Specialized solutions for hospitality businesses with high transaction volumes and specific industry needs.
              </p>
            </CardContent>
          </Card>

          {/* Large Groups Tier */}
          <Card className="card-hover border border-border" data-testid="card-tier-large">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-building text-yellow-600 text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Large Groups</h3>
                <p className="text-muted-foreground">Corporations, franchises, multi-location businesses</p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Commission Range</span>
                  <span className="text-2xl font-bold text-primary" data-testid="text-commission-large">£5,000-£25,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Monthly Volume</span>
                  <span className="font-semibold text-foreground">£500K+</span>
                </div>
              </div>
              
              <p className="text-sm text-foreground leading-relaxed">
                Enterprise-level payment solutions for large organizations with complex requirements and multiple locations.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Product Benefits */}
        <div className="mt-16 bg-white border border-border rounded-xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-center text-foreground mb-8">
            Why Your Clients Will Love Our Solutions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fas fa-handshake text-primary text-xl"></i>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-foreground mb-2">Seamless Transition</h4>
                <p className="text-foreground">
                  We buy out existing agreements so your clients can upgrade for free and start saving money immediately. No termination fees or penalties.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fas fa-calendar-check text-primary text-xl"></i>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-foreground mb-2">Flexible Contracts</h4>
                <p className="text-foreground">
                  Starting from monthly rolling contracts or fixed pricing to guarantee no price increases. Your clients choose what works best for them.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Products */}
        <div className="mt-8 bg-white border border-border rounded-xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-center text-foreground mb-8">
            Additional Revenue Opportunities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fas fa-credit-card text-green-600 text-xl"></i>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-foreground mb-2">Business Funding</h4>
                <p className="text-foreground">
                  Stack additional commissions by referring businesses for working capital loans and merchant cash advances.
                </p>
                <span className="inline-block mt-2 text-primary font-semibold" data-testid="text-funding-commission">
                  +£200-£2,000 bonus commission
                </span>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fas fa-chart-line text-purple-600 text-xl"></i>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-foreground mb-2">Premium Analytics</h4>
                <p className="text-foreground">
                  Refer businesses for advanced reporting and analytics solutions to optimize their payment processing.
                </p>
                <span className="inline-block mt-2 text-primary font-semibold" data-testid="text-analytics-commission">
                  +£100-£500 recurring commission
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
