import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, Phone, MapPin, Building2, Calendar, Banknote, 
  FileText, Package, CreditCard, DollarSign, TrendingUp,
  Send, CheckCircle2, X
} from "lucide-react";
import { format } from "date-fns";

interface DealDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: any;
}

export default function DealDetailsModal({ isOpen, onClose, deal }: DealDetailsModalProps) {
  const { toast } = useToast();
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteData, setQuoteData] = useState({
    proposedRate: "",
    monthlyFee: "",
    setupFee: "",
    estimatedCommission: "",
    notes: ""
  });

  const generateQuoteMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', `/api/admin/referrals/${deal.id}/generate-quote`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/referrals'] });
      toast({
        title: "Quote Generated",
        description: `Quote sent successfully to ${deal.businessEmail}`,
      });
      setShowQuoteForm(false);
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate quote",
        variant: "destructive",
      });
    },
  });

  const handleGenerateQuote = () => {
    generateQuoteMutation.mutate(quoteData);
  };

  if (!deal) return null;

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
                <Label className="text-gray-600">Business Name</Label>
                <p className="font-medium text-lg">{deal.businessName}</p>
              </div>
              <div>
                <Label className="text-gray-600">Business Type</Label>
                <p className="font-medium">{deal.businessType?.name || "N/A"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <Label className="text-gray-600">Email</Label>
                  <p className="font-medium">{deal.businessEmail}</p>
                </div>
              </div>
              {deal.businessPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <Label className="text-gray-600">Phone</Label>
                    <p className="font-medium">{deal.businessPhone}</p>
                  </div>
                </div>
              )}
              {deal.businessAddress && (
                <div className="col-span-2 flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <Label className="text-gray-600">Address</Label>
                    <p className="font-medium">{deal.businessAddress}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <Label className="text-gray-600">Submitted</Label>
                  <p className="font-medium">
                    {format(new Date(deal.submittedAt), "MMMM dd, yyyy 'at' HH:mm")}
                  </p>
                </div>
              </div>
              {deal.dealId && (
                <div>
                  <Label className="text-gray-600">Deal ID</Label>
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
                    <Label className="text-gray-600">Monthly Volume</Label>
                    <p className="font-medium text-lg">£{deal.monthlyVolume}</p>
                  </div>
                </div>
              )}
              {deal.currentProcessor && (
                <div>
                  <Label className="text-gray-600">Current Processor</Label>
                  <p className="font-medium">{deal.currentProcessor}</p>
                </div>
              )}
              {deal.currentRate && (
                <div>
                  <Label className="text-gray-600">Current Rate</Label>
                  <p className="font-medium">{deal.currentRate}%</p>
                </div>
              )}
              {deal.cardMachineQuantity && (
                <div>
                  <Label className="text-gray-600">Card Machines Needed</Label>
                  <p className="font-medium">{deal.cardMachineQuantity}</p>
                </div>
              )}
              {deal.cardMachineProvider && (
                <div>
                  <Label className="text-gray-600">Current Card Machine Provider</Label>
                  <p className="font-medium">{deal.cardMachineProvider}</p>
                </div>
              )}
            </CardContent>
          </Card>

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
                    <Label className="text-gray-700">Business Funding Amount Requested</Label>
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
                  <Label className="text-gray-600">Referring Partner</Label>
                  <p className="font-medium">
                    {deal.referrer.firstName} {deal.referrer.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{deal.referrer.email}</p>
                </div>
              )}
              {deal.estimatedCommission && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <Label className="text-gray-700">Estimated Commission</Label>
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

          {/* Quote Generation Section */}
          {!showQuoteForm ? (
            <div className="flex gap-3">
              <Button
                onClick={() => setShowQuoteForm(true)}
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
          ) : (
            <Card className="border-2 border-blue-300 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Quote Generation Form
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuoteForm(false)}
                    data-testid="button-close-quote-form"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="proposed-rate">Proposed Rate (%)</Label>
                    <Input
                      id="proposed-rate"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 1.25"
                      value={quoteData.proposedRate}
                      onChange={(e) => setQuoteData({ ...quoteData, proposedRate: e.target.value })}
                      data-testid="input-proposed-rate"
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthly-fee">Monthly Fee (£)</Label>
                    <Input
                      id="monthly-fee"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 25.00"
                      value={quoteData.monthlyFee}
                      onChange={(e) => setQuoteData({ ...quoteData, monthlyFee: e.target.value })}
                      data-testid="input-monthly-fee"
                    />
                  </div>
                  <div>
                    <Label htmlFor="setup-fee">Setup Fee (£)</Label>
                    <Input
                      id="setup-fee"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 0.00"
                      value={quoteData.setupFee}
                      onChange={(e) => setQuoteData({ ...quoteData, setupFee: e.target.value })}
                      data-testid="input-setup-fee"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimated-commission">Estimated Commission (£)</Label>
                    <Input
                      id="estimated-commission"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 150.00"
                      value={quoteData.estimatedCommission}
                      onChange={(e) => setQuoteData({ ...quoteData, estimatedCommission: e.target.value })}
                      data-testid="input-estimated-commission"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="quote-notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="quote-notes"
                    placeholder="Any additional information for the client..."
                    rows={4}
                    value={quoteData.notes}
                    onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
                    data-testid="input-quote-notes"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleGenerateQuote}
                    disabled={!quoteData.proposedRate || generateQuoteMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    data-testid="button-submit-quote"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {generateQuoteMutation.isPending ? "Sending..." : "Send Quote to Client"}
                  </Button>
                  <Button
                    onClick={() => setShowQuoteForm(false)}
                    variant="outline"
                    data-testid="button-cancel-quote"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
