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
  Download, Eye, Upload, ArrowLeft, ArrowRight, ClipboardCheck
} from "lucide-react";
import { format } from "date-fns";
import QuoteBuilder from "./quote-builder";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface DealDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: any;
}

export default function DealDetailsModal({ isOpen, onClose, deal }: DealDetailsModalProps) {
  const { toast } = useToast();
  const [showQuoteBuilder, setShowQuoteBuilder] = useState(false);
  const [showSignUpForm, setShowSignUpForm] = useState(false);
  const [isMovingForward, setIsMovingForward] = useState(false);

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

  const handleMoveForward = async () => {
    try {
      setIsMovingForward(true);
      const response = await fetch(`/api/admin/referrals/${deal.id}/move-to-agreement-sent`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to move deal forward');
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/referrals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/referrals'] });
      
      toast({
        title: "Deal Moved Forward",
        description: `${deal.businessName} has been moved to "Agreement Sent" stage`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move deal forward. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMovingForward(false);
    }
  };

  if (!deal) return null;

  // If showing sign up form viewer, render it
  if (showSignUpForm) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSignUpForm(false)}
                data-testid="button-back-to-details"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Details
              </Button>
              <DialogTitle className="text-2xl font-bold">
                Sign Up Form for {deal.businessName}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Quote Details Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Quote Details Sent to Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deal.quote ? (
                  <>
                    {/* Transaction Rates */}
                    <div>
                      <h4 className="font-semibold mb-2">Transaction Rates</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-gray-50 rounded">
                          <label className="text-xs text-gray-600">Credit Card</label>
                          <p className="font-medium">{deal.quote.creditCardRate}%</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                          <label className="text-xs text-gray-600">Debit Card</label>
                          <p className="font-medium">{deal.quote.debitCardRate}%</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                          <label className="text-xs text-gray-600">Corporate Card</label>
                          <p className="font-medium">{deal.quote.corporateCardRate}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Devices */}
                    {deal.quote.devices && deal.quote.devices.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Card Machines</h4>
                        <div className="space-y-2">
                          {deal.quote.devices.map((device: any, idx: number) => (
                            <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded flex justify-between">
                              <span>{device.type === 'dojo_go' ? 'Dojo Go' : 'Dojo Pocket'} x {device.quantity}</span>
                              <span className="font-medium">£{device.price}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Payment Type: {deal.quote.devicePaymentType === 'pay_once' ? 'Pay Once' : 'Monthly Payment'}
                        </p>
                      </div>
                    )}

                    {/* Optional Extras */}
                    <div>
                      <h4 className="font-semibold mb-2">Optional Extras</h4>
                      <div className="space-y-2">
                        {deal.quote.hardwareCare && (
                          <div className="flex items-center gap-2">
                            <Badge>Hardware Care</Badge>
                            <span className="text-sm">£5 per device/month</span>
                          </div>
                        )}
                        {deal.quote.dojoPlan && (
                          <div className="flex items-center gap-2">
                            <Badge>Dojo Plan</Badge>
                            <span className="text-sm">£11.99/month (3 months free trial)</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Settlement</Badge>
                          <span className="text-sm">{deal.quote.settlementType === '5_day' ? '5-Day' : '7-Day'} Settlement</span>
                        </div>
                      </div>
                    </div>

                    {/* Total Costs */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      {deal.quote.oneTimeDeviceCost && (
                        <div className="p-4 bg-green-50 rounded-lg">
                          <label className="text-sm text-gray-700">One-Time Device Cost</label>
                          <p className="font-bold text-2xl text-green-700">£{deal.quote.oneTimeDeviceCost}</p>
                        </div>
                      )}
                      {deal.quote.monthlyDeviceCost && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <label className="text-sm text-gray-700">Monthly Device Cost</label>
                          <p className="font-bold text-2xl text-blue-700">£{deal.quote.monthlyDeviceCost}/mo</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 italic">No quote details available</p>
                )}
              </CardContent>
            </Card>

            {/* Customer Sign-Up Form Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Customer Sign-Up Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deal.signUpFormData ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Customer signed up on: {deal.signUpFormData.submittedAt ? format(new Date(deal.signUpFormData.submittedAt), 'PPP') : 'N/A'}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(deal.signUpFormData).map(([key, value]: [string, any]) => (
                        <div key={key}>
                          <label className="text-xs text-gray-600 capitalize">{key.replace(/_/g, ' ')}</label>
                          <p className="font-medium">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Customer has not yet completed the sign-up form</p>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowSignUpForm(false)}
                variant="outline"
                className="flex-1"
              >
                Back to Details
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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

          {/* Action Buttons - Different per Stage */}
          <div className="flex gap-3">
            {deal.dealStage === 'quote_request_received' && (
              <Button
                onClick={() => setShowQuoteBuilder(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-lg py-6"
                data-testid="button-open-quote-form"
              >
                <DollarSign className="h-5 w-5 mr-2" />
                Generate Quote
              </Button>
            )}
            
            {deal.dealStage === 'quote_approved' && (
              <>
                <Button
                  onClick={() => setShowSignUpForm(true)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-lg py-6"
                  data-testid="button-view-signup-form"
                >
                  <ClipboardCheck className="h-5 w-5 mr-2" />
                  View Sign Up Form
                </Button>
                <Button
                  onClick={handleMoveForward}
                  disabled={isMovingForward}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-lg py-6"
                  data-testid="button-move-forward"
                >
                  <ArrowRight className="h-5 w-5 mr-2" />
                  {isMovingForward ? 'Moving...' : 'Move Forward'}
                </Button>
              </>
            )}
            
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
