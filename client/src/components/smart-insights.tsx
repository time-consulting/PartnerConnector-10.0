import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUpIcon, 
  TrendingDownIcon,
  CalendarIcon,
  UsersIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon
} from "lucide-react";

interface SmartInsightsProps {
  userStats: any;
  userReferrals: any[];
  isLoading: boolean;
}

interface Insight {
  id: string;
  type: 'trend' | 'performance' | 'opportunity' | 'alert';
  title: string;
  description: string;
  value?: string;
  change?: string;
  isPositive?: boolean;
  icon: any;
  color: string;
}

export default function SmartInsights({ userStats, userReferrals, isLoading }: SmartInsightsProps) {
  const generateInsights = (): Insight[] => {
    if (!userStats || isLoading) return [];
    
    const insights: Insight[] = [];
    
    // Performance trend analysis
    const thisMonthEarnings = userStats.monthlyEarnings || 0;
    const lastMonthEarnings = calculateLastMonthEarnings();
    const earningsChange = lastMonthEarnings > 0 ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings * 100) : 0;
    
    if (Math.abs(earningsChange) > 10) {
      insights.push({
        id: 'earnings-trend',
        type: 'trend',
        title: 'Monthly Earnings Trend',
        description: earningsChange > 0 ? 'Your earnings are growing strong!' : 'Consider increasing activity to boost earnings',
        value: `${earningsChange > 0 ? '+' : ''}${earningsChange.toFixed(1)}%`,
        change: 'vs last month',
        isPositive: earningsChange > 0,
        icon: earningsChange > 0 ? TrendingUpIcon : TrendingDownIcon,
        color: earningsChange > 0 ? 'text-green-600' : 'text-orange-600'
      });
    }

    // Success rate analysis
    if (userStats.successRate >= 80) {
      insights.push({
        id: 'high-performance',
        type: 'performance',
        title: 'Excellent Success Rate',
        description: 'You\'re converting at an exceptional rate. You\'re in the top 10% of partners!',
        value: `${userStats.successRate}%`,
        isPositive: true,
        icon: StarIcon,
        color: 'text-green-600'
      });
    } else if (userStats.successRate < 40) {
      insights.push({
        id: 'low-success-rate',
        type: 'alert',
        title: 'Success Rate Needs Attention',
        description: 'Focus on lead qualification and providing complete business information',
        value: `${userStats.successRate}%`,
        isPositive: false,
        icon: AlertCircleIcon,
        color: 'text-red-600'
      });
    }

    // Activity pattern analysis
    const recentActivity = analyzeRecentActivity();
    if (recentActivity.streak > 0) {
      insights.push({
        id: 'activity-streak',
        type: 'performance',
        title: 'Great Activity Streak',
        description: `You've been consistently active for ${recentActivity.streak} days`,
        value: `${recentActivity.streak} days`,
        isPositive: true,
        icon: CheckCircleIcon,
        color: 'text-green-600'
      });
    }

    // Opportunity identification
    const bestPerformingType = identifyBestPerformingBusinessType();
    if (bestPerformingType) {
      insights.push({
        id: 'best-sector',
        type: 'opportunity',
        title: 'Your Best Performing Sector',
        description: `Focus on ${bestPerformingType.name} - they convert ${bestPerformingType.rate}% better`,
        value: `${bestPerformingType.rate}%`,
        isPositive: true,
        icon: UsersIcon,
        color: 'text-blue-600'
      });
    }

    // Seasonal insights
    const seasonalInsight = getSeasonalInsight();
    if (seasonalInsight) {
      insights.push(seasonalInsight);
    }

    return insights;
  };

  const calculateLastMonthEarnings = (): number => {
    // In a real implementation, this would calculate based on historical data
    // For now, we'll simulate based on current data
    const currentEarnings = userStats?.monthlyEarnings || 0;
    return currentEarnings * (0.8 + Math.random() * 0.4); // Simulate variance
  };

  const analyzeRecentActivity = (): { streak: number; avgPerWeek: number } => {
    if (!userReferrals.length) return { streak: 0, avgPerWeek: 0 };
    
    const sortedReferrals = userReferrals.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
    
    let streak = 0;
    let currentDate = new Date();
    
    for (const referral of sortedReferrals) {
      const referralDate = new Date(referral.submittedAt);
      const diffDays = Math.floor((currentDate.getTime() - referralDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= streak + 1) {
        streak = Math.max(streak, diffDays + 1);
      } else {
        break;
      }
    }
    
    return { streak, avgPerWeek: userReferrals.length / Math.max(1, streak / 7) };
  };

  const identifyBestPerformingBusinessType = () => {
    if (!userReferrals.length) return null;
    
    const typePerformance: { [key: string]: { total: number; successful: number } } = {};
    
    userReferrals.forEach(referral => {
      const type = referral.businessType || 'Unknown';
      if (!typePerformance[type]) {
        typePerformance[type] = { total: 0, successful: 0 };
      }
      typePerformance[type].total++;
      if (['approved', 'completed'].includes(referral.status)) {
        typePerformance[type].successful++;
      }
    });
    
    let bestType = null;
    let bestRate = 0;
    
    Object.entries(typePerformance).forEach(([type, stats]) => {
      if (stats.total >= 2) { // Only consider types with at least 2 referrals
        const rate = (stats.successful / stats.total) * 100;
        if (rate > bestRate) {
          bestRate = rate;
          bestType = { name: type, rate: Math.round(rate) };
        }
      }
    });
    
    return bestType;
  };

  const getSeasonalInsight = (): Insight | null => {
    const month = new Date().getMonth();
    
    // Holiday seasons (November-December)
    if (month >= 10) {
      return {
        id: 'holiday-season',
        type: 'opportunity',
        title: 'Holiday Season Opportunity',
        description: 'Retail businesses often need payment processing updates before peak season',
        icon: CalendarIcon,
        color: 'text-purple-600'
      };
    }
    
    // New Year (January-February)
    if (month <= 1) {
      return {
        id: 'new-year-opportunity',
        type: 'opportunity',
        title: 'New Year Business Planning',
        description: 'Many businesses review their costs and suppliers in Q1',
        icon: CalendarIcon,
        color: 'text-blue-600'
      };
    }
    
    return null;
  };

  const insights = generateInsights();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="w-5 h-5" />
            Smart Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5" />
            Building Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Keep submitting referrals to unlock personalized performance insights and trends.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUpIcon className="w-5 h-5" />
          Smart Insights
          <Badge variant="outline">{insights.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => {
          const Icon = insight.icon;
          
          return (
            <div
              key={insight.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card"
              data-testid={`insight-${insight.id}`}
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Icon className={`w-4 h-4 ${insight.color}`} />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <Badge 
                        variant={insight.type === 'alert' ? 'destructive' : 'secondary'} 
                        className="text-xs"
                      >
                        {insight.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                  
                  {insight.value && (
                    <div className="text-right">
                      <div className={`font-bold text-lg ${insight.color}`}>
                        {insight.value}
                      </div>
                      {insight.change && (
                        <div className="text-xs text-muted-foreground">
                          {insight.change}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}