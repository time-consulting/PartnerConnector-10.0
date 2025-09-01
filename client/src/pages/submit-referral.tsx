import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import ReferralForm from "@/components/referral-form";
import BillUpload from "@/components/bill-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, ArrowRightIcon } from "lucide-react";

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
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success Message */}
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-800">
                    Referral Submitted Successfully!
                  </h3>
                  <p className="text-green-700 mt-1">
                    Your referral is now in our system. To help us create the most competitive quote, 
                    please upload the current payment processing bills below.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bill Upload Section */}
          <BillUpload
            referralId={submittedReferralId}
            onComplete={handleBillUploadComplete}
            isOptional={true}
          />

          {/* Navigation Options */}
          <div className="mt-6 flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              data-testid="button-dashboard"
            >
              Return to Dashboard
            </Button>
            <Button
              onClick={() => {
                setSubmittedReferralId(null);
                setShowBillUpload(false);
              }}
              data-testid="button-submit-another"
            >
              Submit Another Referral
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Submit New Referral</CardTitle>
            <p className="text-xl text-muted-foreground text-center">
              Refer a business and start earning commissions
            </p>
          </CardHeader>
          <CardContent>
            <ReferralForm
              businessTypes={(businessTypes as any[]) || []}
              onSubmit={(data) => submitReferralMutation.mutate(data)}
              isSubmitting={submitReferralMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
