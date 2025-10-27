import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import SideNavigation from "@/components/side-navigation";
import ReferralStepper from "@/components/referral-stepper";
import BillUpload from "@/components/bill-upload";
import { CheckCircleIcon, Sparkles } from "lucide-react";

export default function SubmitReferral() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [submittedReferralId, setSubmittedReferralId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: businessTypes = [] } = useQuery<any[]>({
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
      setShowConfetti(true);
      toast({
        title: "🎉 Referral Submitted Successfully!",
        description: "Your referral has been submitted and will be processed within 24 hours.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/referrals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
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

  const handleReferralSubmit = (data: any) => {
    submitReferralMutation.mutate(data);
  };


  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SideNavigation />
      <div className="lg:ml-16">
        <Navigation />
        
        {/* Full Width Layout with Stepper and Earnings Sidebar */}
        <div className="w-full">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Submit New Referral
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Connect businesses with the right payment solutions and earn commissions
                </p>
              </div>
            </div>
          </div>

          {/* Main Content - Full Width Centered Layout */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ReferralStepper 
              businessTypes={businessTypes}
              onSubmit={handleReferralSubmit}
              isSubmitting={submitReferralMutation.isPending}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
