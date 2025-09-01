import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircleIcon, ClockIcon, TrendingUpIcon } from "lucide-react";

export default function LearningPortal() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  const learningModules = [
    {
      id: "commission-basics",
      title: "Commission Calculation Basics",
      description: "Learn how to calculate potential commissions for different business types",
      duration: "15 min",
      level: "Beginner",
      completed: false,
    },
    {
      id: "business-assessment",
      title: "Business Assessment Techniques",
      description: "Master the art of evaluating client payment processing needs",
      duration: "25 min",
      level: "Intermediate",
      completed: false,
    },
    {
      id: "negotiation-strategies",
      title: "Referral Negotiation Strategies",
      description: "Advanced techniques for presenting payment solutions to clients",
      duration: "30 min",
      level: "Advanced",
      completed: false,
    },
    {
      id: "industry-insights",
      title: "Industry-Specific Insights",
      description: "Tailored approaches for restaurants, retail, and hospitality sectors",
      duration: "20 min",
      level: "Intermediate",
      completed: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="text-portal-title">
            Learning Portal
          </h1>
          <p className="text-xl text-muted-foreground">
            Master the art of referral sales and maximize your commission potential
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUpIcon className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground" data-testid="text-avg-commission">£850</h3>
              <p className="text-muted-foreground">Average Commission</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <ClockIcon className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground" data-testid="text-completion-time">2-3 Days</h3>
              <p className="text-muted-foreground">Average Completion Time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <PlayCircleIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground" data-testid="text-success-rate">87%</h3>
              <p className="text-muted-foreground">Platform Success Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Learning Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningModules.map((module) => (
            <Card key={module.id} className="card-hover cursor-pointer" data-testid={`module-${module.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{module.title}</CardTitle>
                    <p className="text-muted-foreground text-sm">{module.description}</p>
                  </div>
                  <PlayCircleIcon className="w-8 h-8 text-primary ml-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge variant={module.level === "Beginner" ? "secondary" : module.level === "Intermediate" ? "default" : "destructive"}>
                      {module.level}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {module.duration}
                    </span>
                  </div>
                  {module.completed && (
                    <Badge className="bg-green-600 text-white">
                      Completed
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Commission Calculator */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Commission Calculator</CardTitle>
            <p className="text-muted-foreground text-center">
              Estimate your potential earnings based on business volume
            </p>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Interactive Calculator Coming Soon</h3>
              <p className="text-blue-100 mb-6">
                Calculate exact commission amounts based on business type, monthly volume, and processing rates
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold">£150+</p>
                  <p className="text-blue-200">Small Traders</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">£500+</p>
                  <p className="text-blue-200">Restaurants</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">£1K-£20K</p>
                  <p className="text-blue-200">Large Groups</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
