import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Building, 
  Calendar,
  FileText,
  CreditCard
} from "lucide-react";

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: "completed" | "current" | "pending";
  completedAt?: string;
}

interface ProgressTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  referral: {
    id: string;
    businessName: string;
    businessEmail: string;
    status: string;
    submittedAt: Date;
    selectedProducts: string[];
    estimatedCommission?: string;
  };
}

export default function ProgressTracker({ isOpen, onClose, referral }: ProgressTrackerProps) {
  const getProgressSteps = (): ProgressStep[] => {
    const baseSteps: ProgressStep[] = [
      {
        id: "submitted",
        title: "Referral Submitted",
        description: "Your referral has been successfully submitted",
        status: "completed",
        completedAt: referral.submittedAt.toLocaleDateString()
      },
      {
        id: "review",
        title: "Under Review",
        description: "Our team is reviewing the business details and requirements",
        status: referral.status === "submitted" ? "current" : "completed",
        completedAt: referral.status !== "submitted" ? "1-2 days" : undefined
      },
      {
        id: "quote",
        title: "Quote Preparation",
        description: "Creating a competitive quote tailored to the business needs",
        status: ["quote_sent", "quote_approved", "processing", "approved", "paid"].includes(referral.status) ? "completed" : 
                referral.status === "in_review" ? "current" : "pending",
        completedAt: ["quote_sent", "quote_approved", "processing", "approved", "paid"].includes(referral.status) ? "Ready" : undefined
      },
      {
        id: "quote_sent",
        title: "Quote Sent",
        description: "Custom quote has been sent to the business for review",
        status: ["quote_approved", "processing", "approved", "paid"].includes(referral.status) ? "completed" :
                referral.status === "quote_sent" ? "current" : "pending",
        completedAt: ["quote_approved", "processing", "approved", "paid"].includes(referral.status) ? "Sent" : undefined
      },
      {
        id: "approval",
        title: "Quote Approval",
        description: "Waiting for business to approve the payment processing quote",
        status: ["processing", "approved", "paid"].includes(referral.status) ? "completed" :
                referral.status === "quote_approved" ? "current" : "pending",
        completedAt: ["processing", "approved", "paid"].includes(referral.status) ? "Approved" : undefined
      },
      {
        id: "processing",
        title: "Application Processing",
        description: "Processing the payment solution setup and onboarding",
        status: ["approved", "paid"].includes(referral.status) ? "completed" :
                referral.status === "processing" ? "current" : "pending",
        completedAt: ["approved", "paid"].includes(referral.status) ? "Complete" : undefined
      },
      {
        id: "commission",
        title: "Commission Payment",
        description: "Your commission has been calculated and processed",
        status: referral.status === "paid" ? "completed" :
                referral.status === "approved" ? "current" : "pending",
        completedAt: referral.status === "paid" ? "Paid" : undefined
      }
    ];

    return baseSteps;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "current":
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "current":
        return "text-blue-600";
      default:
        return "text-gray-500";
    }
  };

  const steps = getProgressSteps();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            Progress Tracker: {referral.businessName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Referral Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Business:</span>
                  <span>{referral.businessName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Submitted:</span>
                  <span>{referral.submittedAt.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Services:</span>
                  <div className="flex flex-wrap gap-1">
                    {referral.selectedProducts.slice(0, 2).map((product, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {product}
                      </Badge>
                    ))}
                    {referral.selectedProducts.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{referral.selectedProducts.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Current Status:</span>
                  <Badge variant={referral.status === "paid" ? "default" : "secondary"}>
                    {referral.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </div>
              {referral.estimatedCommission && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Estimated Commission:</span>
                    <span className="text-lg font-bold text-green-600">
                      £{referral.estimatedCommission}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Steps */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Progress Timeline</h3>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    {getStatusIcon(step.status)}
                    {index < steps.length - 1 && (
                      <div className={`w-px h-8 mt-2 ${
                        step.status === "completed" ? "bg-green-200" : "bg-gray-200"
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${getStatusColor(step.status)}`}>
                        {step.title}
                      </h4>
                      {step.completedAt && (
                        <span className="text-xs text-muted-foreground">
                          {step.completedAt}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <Card className="bg-blue-50 dark:bg-blue-950">
            <CardContent className="pt-6">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                What happens next?
              </h4>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                {referral.status === "submitted" && (
                  <p>Our team will review the referral within 24 hours and prepare a competitive quote.</p>
                )}
                {referral.status === "in_review" && (
                  <p>We're creating a custom quote based on the business requirements. You'll be notified when it's ready.</p>
                )}
                {referral.status === "quote_sent" && (
                  <p>The business has received their quote. We'll notify you once they respond.</p>
                )}
                {referral.status === "quote_approved" && (
                  <p>Great! The quote has been approved. We're now processing the application and setting up their payment solution.</p>
                )}
                {referral.status === "processing" && (
                  <p>The application is being processed. Once approved, your commission will be calculated and paid.</p>
                )}
                {referral.status === "approved" && (
                  <p>The application has been approved! Your commission is being processed and will be paid shortly.</p>
                )}
                {referral.status === "paid" && (
                  <p>Congratulations! Your commission has been paid. Thank you for this successful referral.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={onClose} data-testid="button-close-progress-tracker">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}