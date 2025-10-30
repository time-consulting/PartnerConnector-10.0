import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  CreditCard,
  Upload,
  Download,
  Eye
} from "lucide-react";
import ContractPreview from "./contract-preview";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
    submittedAt: string | Date;
    selectedProducts: string[];
    estimatedCommission?: string;
  };
}

export default function ProgressTracker({ isOpen, onClose, referral }: ProgressTrackerProps) {
  const [showContractPreview, setShowContractPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Fetch documents for this business
  const { data: documents = [], refetch: refetchDocuments } = useQuery({
    queryKey: ['/api/bills', referral.businessName],
    queryFn: async () => {
      const response = await fetch(`/api/bills?businessName=${encodeURIComponent(referral.businessName)}`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    },
    enabled: !!referral.businessName,
  });

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    // Append all selected files
    Array.from(files).forEach(file => {
      formData.append('bills', file);
    });
    formData.append('businessName', referral.businessName);

    try {
      const response = await fetch('/api/bills/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Document Uploaded",
          description: "Your document has been uploaded successfully.",
        });
        refetchDocuments();
        queryClient.invalidateQueries({ queryKey: ['/api/bills'] });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const getProgressSteps = (): ProgressStep[] => {
    const baseSteps: ProgressStep[] = [
      {
        id: "submitted",
        title: "Referral Submitted",
        description: "Your referral has been successfully submitted",
        status: "completed",
        completedAt: typeof referral.submittedAt === 'string' 
          ? new Date(referral.submittedAt).toLocaleDateString() 
          : referral.submittedAt.toLocaleDateString()
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
        status: ["contract_review", "processing", "approved", "paid"].includes(referral.status) ? "completed" :
                referral.status === "quote_approved" ? "current" : "pending",
        completedAt: ["contract_review", "processing", "approved", "paid"].includes(referral.status) ? "Approved" : undefined
      },
      {
        id: "contract_generation",
        title: "Contract Generation",
        description: "Review and approve the generated service agreement",
        status: ["processing", "approved", "paid"].includes(referral.status) ? "completed" :
                referral.status === "contract_review" ? "current" : "pending",
        completedAt: ["processing", "approved", "paid"].includes(referral.status) ? "Generated" : undefined
      },
      {
        id: "processing",
        title: "Client Signature & Setup",
        description: "Client signs agreement and service setup begins",
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-900">
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
                  <span>
                    {typeof referral.submittedAt === 'string' 
                      ? new Date(referral.submittedAt).toLocaleDateString() 
                      : referral.submittedAt?.toLocaleDateString?.() || 'Unknown date'
                    }
                  </span>
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

          {/* Documents Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Documents
                </h3>
                <div>
                  <input
                    id="document-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <label
                    htmlFor="document-upload"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                    data-testid="button-upload-document"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? "Uploading..." : "Upload Document"}
                  </label>
                </div>
              </div>
              
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc: any, index: number) => (
                    <div
                      key={`${referral.id}-${doc.id}-${index}`}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-lg hover:shadow-md transition-all"
                      data-testid={`document-${doc.id}`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{doc.fileName || 'Unnamed document'}</p>
                          <p className="text-xs text-gray-600">
                            {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Date unknown'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/api/bills/${doc.id}/view`, '_blank')}
                          className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                          data-testid={`button-view-doc-${doc.id}`}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/bills/${doc.id}/download`);
                              if (!response.ok) throw new Error('Download failed');
                              
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = doc.fileName;
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                            } catch (error) {
                              console.error('Download error:', error);
                            }
                          }}
                          className="border-blue-300 text-blue-700 hover:bg-blue-100"
                          data-testid={`button-download-doc-${doc.id}`}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No documents uploaded yet</p>
                  <p className="text-xs mt-1">Upload payment processing bills or other relevant documents</p>
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
                  <p>Great! The quote has been approved. We'll now generate the service agreement for client signature.</p>
                )}
                {referral.status === "contract_review" && (
                  <div className="space-y-3">
                    <p>Review the generated service agreement and approve to send to client for signature.</p>
                    <Button
                      onClick={() => setShowContractPreview(true)}
                      className="bg-green-600 hover:bg-green-700"
                      data-testid="button-review-contract"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Review Contract
                    </Button>
                  </div>
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


      {/* Contract Preview Modal */}
      {showContractPreview && (
        <Dialog open={showContractPreview} onOpenChange={setShowContractPreview}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-6">
            <ContractPreview
              referral={{
                businessName: referral.businessName,
                businessEmail: referral.businessEmail,
                contactName: referral.businessName.split(' ')[0],
                estimatedCommission: referral.estimatedCommission,
                selectedProducts: referral.selectedProducts
              }}
              onApprove={() => {
                console.log('Contract approved');
                setShowContractPreview(false);
              }}
              onReject={() => {
                console.log('Contract needs changes');
                setShowContractPreview(false);
              }}
              onSendToClient={() => {
                console.log('Contract sent to client');
                setShowContractPreview(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}