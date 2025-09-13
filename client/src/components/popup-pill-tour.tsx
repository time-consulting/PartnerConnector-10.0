import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, ArrowRight, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface TourStep {
  id: string;
  message: string;
  element?: string; // CSS selector for highlighting
}

interface PopupPillTourProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onDismiss?: () => void;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    message: "Welcome! 20-second tour of your new hub.",
  },
  {
    id: "pipeline",
    message: "Your pipeline at a glance. Update deals fast.",
    element: "[data-testid='dashboard-stats'], [data-testid='card-deals-submitted']"
  },
  {
    id: "submit-lead",
    message: "Submit a new lead in under a minute.",
    element: "[data-testid='link-submit-referral'], [data-testid='button-submit-referral']"
  },
  {
    id: "track-commissions",
    message: "Track commissions + tiers. Silver is 5 wins/month.",
    element: "[data-testid='card-commission-pending'], [data-testid='commission-summary']"
  },
  {
    id: "invite-teammates",
    message: "Invite teammates—earn up to 3 levels down.",
    element: "[data-testid='link-team-management'], [data-testid='button-invite-team']"
  }
];

export default function PopupPillTour({ isVisible, onComplete, onSkip, onDismiss }: PopupPillTourProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [startTime] = useState(Date.now());

  // Analytics tracking mutations
  const trackAnalyticsMutation = useMutation({
    mutationFn: async ({ event, data }: { event: string, data?: any }) => {
      return apiRequest(`/api/analytics/track`, {
        method: 'POST',
        body: JSON.stringify({ event, data })
      });
    },
    onError: (error) => {
      console.warn('Analytics tracking failed:', error);
    }
  });

  useEffect(() => {
    // Track tour start with backend
    if (isVisible && currentStep === 0) {
      trackAnalyticsMutation.mutate({ event: 'tour_started' });
      // Also keep localStorage for immediate state management
      localStorage.setItem('tour_started', Date.now().toString());
    }
  }, [isVisible, currentStep]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 150);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    const tourDuration = Date.now() - startTime;
    
    // Track completion with backend
    trackAnalyticsMutation.mutate({ 
      event: 'tour_completed', 
      data: { duration: tourDuration }
    });
    
    // Track completion locally
    localStorage.setItem('tour_completed', Date.now().toString());
    localStorage.setItem('tour_duration', tourDuration.toString());
    
    // Invalidate user query to refresh XP and analytics
    queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    
    toast({
      title: "Tour complete! 🎯",
      description: "You're ready to start earning commissions.",
    });
    
    onComplete();
  };

  const handleSkip = () => {
    // Track skip action with backend
    trackAnalyticsMutation.mutate({ event: 'tour_skipped' });
    
    // Track skip locally
    localStorage.setItem('tour_skipped', Date.now().toString());
    
    // Invalidate user query to refresh analytics
    queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    
    toast({
      title: "Tour skipped",
      description: "Find 'Quick tour' in the help menu anytime.",
    });
    
    onSkip();
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    } else {
      handleSkip();
    }
  };

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  return (
    <>
      {/* Subtle highlight overlay for current element */}
      {step.element && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <style>{`
            ${step.element} {
              position: relative;
              z-index: 41;
            }
            ${step.element}::after {
              content: '';
              position: absolute;
              inset: -2px;
              border: 2px solid #3b82f6;
              border-radius: 8px;
              background: rgba(59, 130, 246, 0.1);
              pointer-events: none;
              animation: pulse 2s infinite;
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}</style>
        </div>
      )}

      {/* Tour Pill - Bottom Left */}
      <div className="fixed bottom-6 left-6 z-50 max-w-sm" data-testid="popup-pill-tour">
        <Card className={`bg-white shadow-xl border-2 border-blue-200 transition-all duration-150 ${
          isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
        }`}>
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-blue-600">
                  {currentStep + 1} of {TOUR_STEPS.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                data-testid="button-dismiss-tour"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <Progress 
              value={progress} 
              className="h-1 mb-3"
              data-testid="tour-progress"
            />

            {/* Message */}
            <p className="text-sm text-gray-800 font-medium mb-4 leading-relaxed" data-testid="tour-message">
              {step.message}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-xs text-gray-500 hover:text-gray-700 px-2"
                data-testid="button-skip-tour"
              >
                Skip
              </Button>

              <Button
                onClick={handleNext}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 text-xs font-medium"
                data-testid="button-next-tour"
              >
                {isLastStep ? (
                  <>
                    Finish
                    <RotateCcw className="ml-1 h-3 w-3" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </>
                )}
              </Button>
            </div>

            {/* Timer indicator with 30s constraint */}
            <div className="mt-2 text-center">
              <span className="text-xs text-gray-400">
                ≈ {Math.max(1, (TOUR_STEPS.length - currentStep - 1) * 4)}s remaining (max 30s total)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Helper hook for tour management
export function useTourState() {
  const [isTourVisible, setIsTourVisible] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [tourSkipped, setTourSkipped] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('tour_completed');
    const skipped = localStorage.getItem('tour_skipped');
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    
    setTourCompleted(!!completed);
    setTourSkipped(!!skipped);
    
    // Show tour for new users who haven't completed it or skipped it
    const shouldShowTour = !completed && !skipped && hasCompletedOnboarding !== 'true';
    setIsTourVisible(shouldShowTour);
  }, []);

  const startTour = () => setIsTourVisible(true);
  const completeTour = () => {
    setIsTourVisible(false);
    setTourCompleted(true);
  };
  const skipTour = () => {
    setIsTourVisible(false);
    setTourSkipped(true);
  };

  return {
    isTourVisible,
    tourCompleted,
    tourSkipped,
    startTour,
    completeTour,
    skipTour,
  };
}