import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import SideNavigation from "@/components/side-navigation";
import ReferralStepper from "@/components/referral-stepper";
import EarningsPreviewSidebar from "@/components/earnings-preview-sidebar";
import BillUpload from "@/components/bill-upload";
import { CheckCircleIcon, Sparkles } from "lucide-react";

export default function SubmitReferral() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [submittedReferralId, setSubmittedReferralId] = useState<string | null>(null);
  const [showBillUpload, setShowBillUpload] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [formData, setFormData] = useState<any>({});

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
      setShowConfetti(true);
      setTimeout(() => {
        setShowBillUpload(true);
        setShowConfetti(false);
      }, 2000);
      toast({
        title: "🎉 Referral Submitted Successfully!",
        description: "Your referral has been submitted and will be processed within 24 hours.",
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

  const handleDraftSave = (data: any) => {
    setFormData(data);
    // Could also save to localStorage or API here
    console.log("Draft saved:", data);
  };

  const handleReferralSubmit = (data: any) => {
    submitReferralMutation.mutate(data);
  };

  const handleBillUploadComplete = () => {
    setShowBillUpload(false);
    toast({
      title: "🎉 Process Complete!",
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

  // Success screen with confetti animation
  if (showBillUpload && submittedReferralId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <SideNavigation />
        <div className="lg:ml-16">
          <Navigation />
          
          {/* Confetti Animation Overlay */}
          {showConfetti && (
            <div className="fixed inset-0 z-50 pointer-events-none">
              <div className="absolute inset-0 bg-black/10">
                <div className="animate-fadeIn">
                  <Sparkles className="absolute top-1/4 left-1/4 w-8 h-8 text-yellow-500 animate-bounce" />
                  <Sparkles className="absolute top-1/3 right-1/3 w-6 h-6 text-blue-500 animate-pulse" />
                  <Sparkles className="absolute bottom-1/3 left-1/3 w-10 h-10 text-green-500 animate-spin" />
                  <Sparkles className="absolute top-2/3 right-1/4 w-7 h-7 text-purple-500 animate-bounce" />
                </div>
              </div>
            </div>
          )}
        
          {/* Success Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50 py-16">
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
                  🎉 Great! Your referral is now in our system. Upload current payment processing bills 
                  below to help us create the most competitive quote possible.
                </p>
              </div>
            </div>
          </section>

          {/* Bill Upload Section */}
          <section className="py-12 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <BillUpload
                referralId={submittedReferralId}
                onComplete={handleBillUploadComplete}
                onSkip={handleSkipBillUpload}
                isOptional={true}
              />
            </div>
          </section>
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

          {/* Main Content Layout - Stepper + Sidebar */}
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* Main Stepper Content - 8 columns on XL screens */}
              <div className="xl:col-span-8">
                <ReferralStepper 
                  businessTypes={businessTypes}
                  onSubmit={handleReferralSubmit}
                  onDraftSave={handleDraftSave}
                  isSubmitting={submitReferralMutation.isPending}
                />
              </div>

              {/* Earnings Preview Sidebar - 4 columns on XL screens, bottom sheet on mobile */}
              <div className="xl:col-span-4">
                {/* Desktop Sidebar */}
                <div className="hidden xl:block">
                  <div className="sticky top-8">
                    <EarningsPreviewSidebar 
                      selectedProducts={formData?.selectedProducts || []}
                      monthlyVolume={formData?.monthlyVolume || 0}
                      fundingAmount={formData?.fundingAmount || 0}
                    />
                  </div>
                </div>

                {/* Mobile Bottom Sheet */}
                <div className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-2xl">
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">Earnings Preview</h3>
                      <button 
                        className="text-gray-500 hover:text-gray-700"
                        data-testid="button-toggle-sidebar"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      £{((formData?.selectedProducts || []).includes('card-payments') ? 500 : 0) + 
                         ((formData?.selectedProducts || []).includes('business-funding') ? 1000 : 0)}
                    </div>
                    <div className="text-sm text-gray-600">Estimated Commission</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
