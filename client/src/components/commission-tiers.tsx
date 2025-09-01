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
                  <span className="text-foreground">Commission</span>
                  <span className="text-2xl font-bold text-primary" data-testid="text-commission-small">£150+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Monthly Volume</span>
                  <span className="font-semibold">£5K - £50K</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Processing Time</span>
                  <span className="font-semibold">24-48 hours</span>
                </div>
              </div>
              
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <i className="fas fa-check text-green-500 mr-2"></i> Quick approval process
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-500 mr-2"></i> Same-day setup
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-500 mr-2"></i> Mobile payment solutions
                </li>
              </ul>
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
                <h3 className="text-2xl font-bold text-foreground mb-2">Restaurants</h3>
                <p className="text-muted-foreground">Restaurants, bars, hospitality venues</p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Commission</span>
                  <span className="text-2xl font-bold text-primary" data-testid="text-commission-restaurant">£500+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Monthly Volume</span>
                  <span className="font-semibold">£50K - £500K</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Processing Time</span>
                  <span className="font-semibold">48-72 hours</span>
                </div>
              </div>
              
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <i className="fas fa-check text-green-500 mr-2"></i> Integrated POS systems
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-500 mr-2"></i> Table service solutions
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-500 mr-2"></i> Analytics dashboard
                </li>
              </ul>
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
                <p className="text-muted-foreground">Multi-location businesses, franchises</p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Commission</span>
                  <span className="text-2xl font-bold text-primary" data-testid="text-commission-large">£1K - £20K</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Monthly Volume</span>
                  <span className="font-semibold">£500K+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Processing Time</span>
                  <span className="font-semibold">3-5 days</span>
                </div>
              </div>
              
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <i className="fas fa-check text-green-500 mr-2"></i> Enterprise integration
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-500 mr-2"></i> Multi-location management
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-green-500 mr-2"></i> Dedicated account manager
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Additional Products */}
        <div className="mt-16 bg-card rounded-xl p-8 shadow-lg">
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
                <p className="text-muted-foreground">
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
                <p className="text-muted-foreground">
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
