import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import ReferralForm from "@/components/referral-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubmitReferral() {
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

  const { data: businessTypes } = useQuery({
    queryKey: ["/api/business-types"],
    enabled: isAuthenticated,
  });

  const submitReferralMutation = useMutation({
    mutationFn: async (referralData: any) => {
      const response = await apiRequest("POST", "/api/referrals", referralData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Referral Submitted",
        description: "Your referral has been submitted successfully and is now under review.",
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
