import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import ReferralForm from "@/components/referral-form";
import BillUpload from "@/components/bill-upload";
import CommissionCalculator from "@/components/commission-calculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircleIcon, ArrowRightIcon, CalculatorIcon } from "lucide-react";

export default function SubmitReferral() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [submittedReferralId, setSubmittedReferralId] = useState<string | null>(null);
  const [showBillUpload, setShowBillUpload] = useState(false);

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

  const { data: businessTypes } = useQuery({
    queryKey: ["/api/business-types"],
    enabled: isAuthenticated,
  });

  const submitReferralMutation = useMutation({
    mutationFn: async (referralData: any) => {
      const response = await apiRequest("POST", "/api/referrals", referralData);
      return response.json();
    },
    onSuccess: (data) => {
      setSubmittedReferralId(data.id);
      setShowBillUpload(true);
      toast({
        title: "Referral Submitted Successfully!",
        description: "Now you can upload current payment processing bills to help create a better quote.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/referrals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to submit referral. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  const handleBillUploadComplete = () => {
    setShowBillUpload(false);
    toast({
      title: "Process Complete!",
      description: "Your referral and bills have been submitted. We'll be in touch with a competitive quote soon.",
    });
  };

  const handleSkipBillUpload = () => {
    setShowBillUpload(false);
    toast({
      title: "Referral Submitted",
      description: "Your referral has been submitted successfully. You can upload bills later from the dashboard.",
    });
  };

  if (showBillUpload && submittedReferralId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Navigation />
        
        {/* Success Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50 py-16">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzMzMzMzMyIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+')] opacity-30"></div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-fadeIn">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-2xl mb-4">
                  <CheckCircleIcon className="w-10 h-10 text-green-600" />
                </div>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                Referral{" "}
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Submitted!
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Great! Your referral is now in our system. Upload current payment processing bills 
                below to help us create the most competitive quote possible.
              </p>
            </div>
          </div>
        </section>

        {/* Bill Upload Section */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="shadow-2xl border-0 bg-gradient-to-b from-white to-gray-50">
              <CardHeader className="pb-8">
                <div className="text-center">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Upload Bills (Optional)</CardTitle>
                  <p className="text-gray-600">
                    Help us create a better quote by sharing current processing bills
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <BillUpload
                  referralId={submittedReferralId}
                  onComplete={handleBillUploadComplete}
                  isOptional={true}
                />
              </CardContent>
            </Card>

            {/* Navigation Options */}
            <div className="mt-8 flex gap-4 justify-center">
              <Button
                variant="outline"
                size="lg"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4"
                onClick={() => window.location.href = '/'}
                data-testid="button-dashboard"
              >
                Return to Dashboard
              </Button>
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4"
                onClick={() => {
                  setSubmittedReferralId(null);
                  setShowBillUpload(false);
                }}
                data-testid="button-submit-another"
              >
                Submit Another Referral
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzMzMzMzMyIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+')] opacity-30"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fadeIn">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-4">
                <ArrowRightIcon className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
              Submit New{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Referral
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect businesses with better payment solutions and earn competitive commissions. 
              Complete the form below to get started.
            </p>

            {/* Commission Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="text-center p-4 border-0 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold text-blue-600">60%</div>
                  <div className="text-sm text-gray-600">Level 1 Commission</div>
                </CardContent>
              </Card>
              <Card className="text-center p-4 border-0 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold text-green-600">25%</div>
                  <div className="text-sm text-gray-600">Level 2 Network</div>
                </CardContent>
              </Card>
              <Card className="text-center p-4 border-0 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold text-purple-600">15%</div>
                  <div className="text-sm text-gray-600">Level 3 Extended</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Commission Calculator Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
              <CalculatorIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Commission Calculator
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See your earning potential with our interactive calculators
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
      </section>

      {/* Form Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-2xl border-0 bg-gradient-to-b from-white to-gray-50">
            <CardHeader className="pb-8">
              <div className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Business Information</CardTitle>
                <p className="text-gray-600">
                  Fill out the details below to submit your referral
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ReferralForm
                businessTypes={(businessTypes as any[]) || []}
                onSubmit={(data) => submitReferralMutation.mutate(data)}
                isSubmitting={submitReferralMutation.isPending}
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
