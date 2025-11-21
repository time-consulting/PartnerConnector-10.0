import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import SideNavigation from "@/components/side-navigation";
import DealStepper from "@/components/deal-stepper";
import BillUpload from "@/components/bill-upload";
import { CheckCircleIcon, Sparkles } from "lucide-react";

export default function SubmitDeal() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [submittedDealId, setSubmittedReferralId] = useState<string | null>(null);
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

  const submitDealMutation = useMutation({
    mutationFn: async ({ dealData, files }: { dealData: any; files: File[] }) => {
      // First, create the deal
      const response = await apiRequest("POST", "/api/deals", dealData);
      const deal = await response.json();
      
      // Then, upload files if any
      if (files && files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('bills', file);
        });
        
        await fetch(`/api/deals/${deal?.id}/upload-bill`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
      }
      
      return deal;
    },
    onSuccess: (data) => {
      setSubmittedReferralId(data.id);
      setShowConfetti(true);
      toast({
        title: "🎉 Referral Submitted Successfully!",
        description: "Your deal has been submitted and will be processed within 24 hours.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
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
        description: "Failed to submit deal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDealSubmit = (data: any, files: File[]) => {
    submitDealMutation.mutate({ dealData: data, files });
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
                  Submit New Deal
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Connect businesses with the right payment solutions and earn commissions
                </p>
              </div>
            </div>
          </div>

          {/* Main Content - Full Width Centered Layout */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <DealStepper 
              businessTypes={businessTypes}
              onSubmit={handleDealSubmit}
              isSubmitting={submitDealMutation.isPending}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
