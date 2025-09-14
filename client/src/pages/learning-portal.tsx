import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/toast-disabled";
import Navigation from "@/components/navigation";
import CommissionCalculator from "@/components/commission-calculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircleIcon, ClockIcon, TrendingUpIcon, CalculatorIcon } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="text-portal-title">
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
        <div className="mt-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
              <CalculatorIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Interactive Commission Calculator
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Practice calculating commissions with our interactive tools
            </p>
          </div>

          <Tabs defaultValue="payment" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="payment" className="text-lg py-3">
                Payment Processing
              </TabsTrigger>
              <TabsTrigger value="funding" className="text-lg py-3">
                Business Funding
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="payment">
              <CommissionCalculator type="payment" />
            </TabsContent>
            
            <TabsContent value="funding">
              <CommissionCalculator type="funding" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
