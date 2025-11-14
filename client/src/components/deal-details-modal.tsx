import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, Phone, MapPin, Building2, Calendar, Banknote, 
  FileText, Package, CreditCard, DollarSign, TrendingUp,
  Download, Eye, Upload, ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import QuoteBuilder from "./quote-builder";
import { queryClient } from "@/lib/queryClient";

interface DealDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: any;
}

export default function DealDetailsModal({ isOpen, onClose, deal }: DealDetailsModalProps) {
  const { toast } = useToast();
  const [showQuoteBuilder, setShowQuoteBuilder] = useState(false);

  const handleQuoteCreated = (quoteId: string) => {
    queryClient.invalidateQueries({ queryKey: ['/api/admin/referrals'] });
    toast({
      title: "Quote Generated",
      description: `Quote sent successfully to ${deal.businessEmail}`,
    });
    setShowQuoteBuilder(false);
    onClose();
  };

  const handleDownloadFile = (fileId: string, fileName: string) => {
    const downloadUrl = `/api/bills/${fileId}/download`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewFile = (fileId: string) => {
    window.open(`/api/bills/${fileId}/view`, '_blank');
  };

  if (!deal) return null;

  // If showing quote builder, render it full screen in the modal
  if (showQuoteBuilder) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuoteBuilder(false)}
                data-testid="button-back-to-details"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Details
              </Button>
              <DialogTitle className="text-2xl font-bold">
                Generate Quote for {deal.businessName}
              </DialogTitle>
            </div>
          </DialogHeader>
          <QuoteBuilder
            referralId={deal.id}
            businessName={deal.businessName}
            onQuoteCreated={handleQuoteCreated}
            onCancel={() => setShowQuoteBuilder(false)}
            apiEndpoint={`/api/admin/referrals/${deal.id}/generate-quote`}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Deal Details: {deal.businessName}
          </DialogTitle>
          <DialogDescription>
            Complete information from the referral submission
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Business Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Business Name</label>
                <p className="font-medium text-lg">{deal.businessName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Business Type</label>
                <p className="font-medium">{deal.businessType?.name || "N/A"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-medium">{deal.businessEmail}</p>
                </div>
              </div>
              {deal.businessPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <label className="text-sm text-gray-600">Phone</label>
                    <p className="font-medium">{deal.businessPhone}</p>
                  </div>
                </div>
              )}
              {deal.businessAddress && (
                <div className="col-span-2 flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <label className="text-sm text-gray-600">Address</label>
                    <p className="font-medium">{deal.businessAddress}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <label className="text-sm text-gray-600">Submitted</label>
                  <p className="font-medium">
                    {format(new Date(deal.submittedAt), "MMMM dd, yyyy 'at' HH:mm")}
                  </p>
                </div>
              </div>
              {deal.dealId && (
                <div>
                  <label className="text-sm text-gray-600">Deal ID</label>
                  <Badge variant="outline" className="font-mono">
                    {deal.dealId}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Processing Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Processing Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {deal.monthlyVolume && (
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <label className="text-sm text-gray-600">Monthly Volume</label>
                    <p className="font-medium text-lg">£{deal.monthlyVolume}</p>
                  </div>
                </div>
              )}
              {deal.currentProcessor && (
                <div>
                  <label className="text-sm text-gray-600">Current Processor</label>
                  <p className="font-medium">{deal.currentProcessor}</p>
                </div>
              )}
              {deal.currentRate && (
                <div>
                  <label className="text-sm text-gray-600">Current Rate</label>
                  <p className="font-medium">{deal.currentRate}%</p>
                </div>
              )}
              {deal.cardMachineQuantity && (
                <div>
                  <label className="text-sm text-gray-600">Card Machines Needed</label>
                  <p className="font-medium">{deal.cardMachineQuantity}</p>
                </div>
              )}
              {deal.cardMachineProvider && (
                <div>
                  <label className="text-sm text-gray-600">Current Card Machine Provider</label>
                  <p className="font-medium">{deal.cardMachineProvider}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Uploaded Documents Card */}
          {deal.billUploads && deal.billUploads.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Uploaded Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deal.billUploads.map((file: any, index: number) => (
                    <div
                      key={file.id || index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{file.fileName}</p>
                          <p className="text-xs text-gray-500">
                            {(file.fileSize / 1024).toFixed(1)} KB • 
                            {file.uploadedAt && ` Uploaded ${format(new Date(file.uploadedAt), "MMM dd, yyyy")}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewFile(file.id)}
                          data-testid={`button-view-file-${index}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadFile(file.id, file.fileName)}
                          data-testid={`button-download-file-${index}`}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Products & Services Card */}
          {deal.selectedProducts && deal.selectedProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Requested Products & Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {deal.selectedProducts.map((product: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                      {product.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
                {deal.fundingAmount && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <label className="text-sm text-gray-700">Business Funding Amount Requested</label>
                    <p className="font-bold text-xl text-blue-700">£{deal.fundingAmount}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Partner & Commission Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Partner & Commission Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {deal.referrer && (
                <div>
                  <label className="text-sm text-gray-600">Referring Partner</label>
                  <p className="font-medium">
                    {deal.referrer.firstName} {deal.referrer.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{deal.referrer.email}</p>
                </div>
              )}
              {deal.estimatedCommission && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <label className="text-sm text-gray-700">Estimated Commission</label>
                  <p className="font-bold text-2xl text-green-700">£{deal.estimatedCommission}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes Card */}
          {deal.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{deal.notes}</p>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => setShowQuoteBuilder(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-lg py-6"
              data-testid="button-open-quote-form"
            >
              <DollarSign className="h-5 w-5 mr-2" />
              Generate Quote
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="text-lg py-6"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
