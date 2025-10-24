import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle2, MessageSquare, TrendingUp, Send, Eye, FileText, X, User } from "lucide-react";
import Navigation from "@/components/navigation";
import SideNavigation from "@/components/side-navigation";
import { useToast } from "@/hooks/use-toast";
import AdditionalDetailsForm from "@/components/additional-details-form";

// Q&A Section Component
function QuoteQASection({ quoteId }: { quoteId: string }) {
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();

  const { data: qaMessages = [], isLoading } = useQuery({
    queryKey: ['/api/quotes', quoteId, 'qa'],
    queryFn: () => fetch(`/api/quotes/${quoteId}/qa`).then(r => r.json()),
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest('POST', `/api/quotes/${quoteId}/qa`, { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes', quoteId, 'qa'] });
      setNewMessage("");
      toast({
        title: "Message sent",
        description: "Your message has been added to the conversation",
      });
    },
  });

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <p className="text-gray-500">Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Questions & Answers
      </h3>
      
      {qaMessages.length > 0 ? (
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          {qaMessages.map((msg: any) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg ${
                msg.authorType === 'admin' 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-0.5 text-gray-600" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    {msg.authorType === 'admin' ? 'Dojo Admin' : msg.authorName}
                  </p>
                  <p className="text-sm text-gray-900">{msg.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm mb-4">No messages yet. Ask a question to start the conversation.</p>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Ask a question about this quote..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          data-testid="input-qa-message"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || sendMessageMutation.isPending}
          data-testid="button-send-qa"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Status mapping with colors
const STATUS_CONFIG = {
  review_quote: {
    label: "Review Quote",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Eye
  },
  sent_to_client: {
    label: "Sent to Client for Approval",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Send
  },
  awaiting_signup: {
    label: "Awaiting Sign Up Info",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: FileText
  },
  agreement_sent: {
    label: "Agreement Sent",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: FileText
  },
  docs_required: {
    label: "Docs Required",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: FileText
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle2
  },
};

export default function Quotes() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showRateRequestModal, setShowRateRequestModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [rateRequestText, setRateRequestText] = useState("");

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['/api/quotes'],
    enabled: isAuthenticated,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('POST', `/api/quotes/${id}/update-status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      toast({
        title: "Status updated",
        description: "Quote status has been updated successfully",
      });
    },
  });

  const askQuestionMutation = useMutation({
    mutationFn: async ({ id, question }: { id: string; question: string }) => {
      return apiRequest('POST', `/api/quotes/${id}/question`, { question });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      setShowQuestionModal(false);
      setQuestionText("");
      toast({
        title: "Question submitted",
        description: "Your question has been sent to Dojo",
      });
    },
  });

  const requestRateMutation = useMutation({
    mutationFn: async ({ id, request }: { id: string; request: string }) => {
      return apiRequest('POST', `/api/quotes/${id}/rate-request`, { request });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      setShowRateRequestModal(false);
      setRateRequestText("");
      toast({
        title: "Rate request submitted",
        description: "Your rate request has been sent to Dojo",
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('POST', `/api/quotes/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      toast({
        title: "Quote approved",
        description: "Please complete the signup form",
      });
      // Open the signup form modal
      setShowSignupModal(true);
    },
  });

  const sendToClientMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('POST', `/api/quotes/${id}/send-to-client`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      toast({
        title: "Quote sent",
        description: "Quote has been sent to your client for approval",
      });
    },
  });

  const handleApprove = () => {
    if (selectedQuote) {
      approveMutation.mutate(selectedQuote.id);
    }
  };

  const handleAskQuestion = () => {
    if (selectedQuote && questionText.trim()) {
      askQuestionMutation.mutate({
        id: selectedQuote.id,
        question: questionText.trim(),
      });
    }
  };

  const handleRequestRate = () => {
    if (selectedQuote && rateRequestText.trim()) {
      requestRateMutation.mutate({
        id: selectedQuote.id,
        request: rateRequestText.trim(),
      });
    }
  };

  const handleSendToClient = (quoteId: string) => {
    sendToClientMutation.mutate(quoteId);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <SideNavigation />
        <div className="lg:ml-16">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-lg text-gray-600">Loading quotes...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SideNavigation />
      <div className="lg:ml-16">
        <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="page-title-quotes">
            Your Quotes
          </h1>
          <p className="text-gray-600" data-testid="text-quotes-description">
            Review and manage quotes from Dojo for your client referrals
          </p>
        </div>

        {/* Empty state */}
        {quotes.length === 0 && (
          <Card className="border-2 border-dashed" data-testid="card-empty-state">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No quotes yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                When Dojo sends you a quote for your client referrals, they'll appear here for you to review and approve.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quotes grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotes.map((quote: any) => {
            const statusConfig = STATUS_CONFIG[quote.customerJourneyStatus as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.review_quote;
            const Icon = statusConfig.icon;

            return (
              <Card
                key={quote.id}
                className="hover:shadow-lg transition-shadow cursor-pointer border-2 rounded-2xl"
                onClick={() => setSelectedQuote(quote)}
                data-testid={`card-quote-${quote.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-gray-900 mb-1" data-testid={`text-business-name-${quote.id}`}>
                        {quote.businessName}
                      </CardTitle>
                      {quote.contactName && (
                        <CardDescription className="text-sm" data-testid={`text-contact-name-${quote.id}`}>
                          {quote.contactName}
                        </CardDescription>
                      )}
                    </div>
                    <Icon className="h-5 w-5 text-gray-400" />
                  </div>
                  <Badge className={`${statusConfig.color} border rounded-full px-3 py-1 text-xs font-medium`} data-testid={`badge-status-${quote.id}`}>
                    {statusConfig.label}
                  </Badge>
                </CardHeader>
                <CardContent>
                  {quote.totalAmount && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">Quote Amount</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid={`text-amount-${quote.id}`}>
                        £{parseFloat(quote.totalAmount).toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    <p data-testid={`text-version-${quote.id}`}>Version {quote.version}</p>
                    {quote.validUntil && (
                      <p data-testid={`text-valid-until-${quote.id}`}>
                        Valid until: {new Date(quote.validUntil).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Full-screen quote detail modal */}
        <Dialog open={!!selectedQuote} onOpenChange={(open) => !open && setSelectedQuote(null)}>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0">
            {selectedQuote && (
              <>
                <DialogHeader className="p-6 pb-4 border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <DialogTitle className="text-2xl font-bold mb-2" data-testid="text-modal-title">
                        {selectedQuote.businessName}
                      </DialogTitle>
                      <DialogDescription data-testid="text-modal-description">
                        Quote for {selectedQuote.contactName || "your client"}
                      </DialogDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedQuote(null)}
                      data-testid="button-close-modal"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </DialogHeader>

                <div className="p-6 space-y-6">
                  {/* Hero Savings Section */}
                  {selectedQuote.estimatedMonthlySaving && (
                    <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-8 text-white shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-100 text-sm font-medium mb-2">Estimated Annual Savings</p>
                          <p className="text-5xl font-bold mb-3">
                            £{(parseFloat(selectedQuote.estimatedMonthlySaving) * 12).toLocaleString()}
                          </p>
                          <p className="text-emerald-100 text-lg">
                            Save £{parseFloat(selectedQuote.estimatedMonthlySaving).toFixed(2)} per month with Dojo
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
                            <p className="text-emerald-100 text-sm mb-1">12-Month Rate Guarantee</p>
                            <CheckCircle2 className="h-12 w-12 mx-auto" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contract Buyout */}
                  {selectedQuote.buyoutAmount && (
                    <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-600 rounded-full p-3">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Contract Buyout Included</h3>
                          <p className="text-gray-600">We'll cover up to £{parseFloat(selectedQuote.buyoutAmount).toFixed(2)} to switch to Dojo</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card Processing Rates */}
                  <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <div className="bg-indigo-600 rounded-lg p-2">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      Card Processing Rates
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">UK Debit Cards</p>
                        <p className="text-2xl font-bold text-indigo-600">{selectedQuote.debitCardRate}%</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Credit Cards</p>
                        <p className="text-2xl font-bold text-indigo-600">{selectedQuote.creditCardRate}%</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Corporate Cards</p>
                        <p className="text-2xl font-bold text-indigo-600">{selectedQuote.corporateCardRate}%</p>
                      </div>
                      {selectedQuote.visaBusinessDebitRate && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-600 mb-1">Visa Business Debit</p>
                          <p className="text-2xl font-bold text-indigo-600">{selectedQuote.visaBusinessDebitRate}%</p>
                        </div>
                      )}
                      {selectedQuote.otherBusinessDebitRate && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-600 mb-1">Other Business Debit</p>
                          <p className="text-2xl font-bold text-indigo-600">{selectedQuote.otherBusinessDebitRate}%</p>
                        </div>
                      )}
                      {selectedQuote.amexRate && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-600 mb-1">American Express</p>
                          <p className="text-2xl font-bold text-indigo-600">{selectedQuote.amexRate}%</p>
                        </div>
                      )}
                    </div>
                    {selectedQuote.secureTransactionFee && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <p className="text-gray-700 font-medium">Secure Transaction Fee (Authorisation)</p>
                          <p className="text-lg font-semibold text-gray-900">{selectedQuote.secureTransactionFee}p per transaction</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Machines & Equipment */}
                  {selectedQuote.devices && selectedQuote.devices.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <div className="bg-purple-600 rounded-lg p-2">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        Card Machines & Equipment
                      </h3>
                      <div className="space-y-4">
                        {selectedQuote.devices.map((device: any, index: number) => (
                          <div key={index} className="flex justify-between items-center bg-purple-50 rounded-xl p-4">
                            <div>
                              <p className="font-semibold text-gray-900">{device.name}</p>
                              <p className="text-sm text-gray-600">Quantity: {device.quantity}</p>
                            </div>
                            <div className="text-right">
                              {selectedQuote.devicePaymentType === 'pay_once' ? (
                                <p className="text-lg font-bold text-purple-600">£{device.price.toFixed(2)} one-time</p>
                              ) : (
                                <p className="text-lg font-bold text-purple-600">£{device.monthlyPrice.toFixed(2)}/month</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Optional Services */}
                  {(selectedQuote.hardwareCare || selectedQuote.settlementType || selectedQuote.dojoPlan) && (
                    <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <div className="bg-amber-600 rounded-lg p-2">
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </div>
                        Optional Services
                      </h3>
                      <div className="space-y-3">
                        {selectedQuote.hardwareCare && (
                          <div className="flex justify-between items-center bg-amber-50 rounded-xl p-4">
                            <p className="font-medium text-gray-900">Hardware Care</p>
                            <p className="text-lg font-semibold text-amber-600">£5.00/device/month</p>
                          </div>
                        )}
                        {selectedQuote.settlementType === '7_day' && (
                          <div className="flex justify-between items-center bg-amber-50 rounded-xl p-4">
                            <p className="font-medium text-gray-900">7-Day Settlement</p>
                            <p className="text-lg font-semibold text-amber-600">£10.00/month</p>
                          </div>
                        )}
                        {selectedQuote.dojoPlan && (
                          <div className="flex justify-between items-center bg-amber-50 rounded-xl p-4">
                            <p className="font-medium text-gray-900">Dojo Plan</p>
                            <p className="text-lg font-semibold text-amber-600">£11.99/month</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Monthly Summary */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
                    <h3 className="text-xl font-bold mb-4">Monthly Summary</h3>
                    <div className="space-y-2">
                      {selectedQuote.monthlyDeviceCost > 0 && (
                        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                          <p className="text-gray-300">Device Rental</p>
                          <p className="text-lg font-semibold">£{parseFloat(selectedQuote.monthlyDeviceCost).toFixed(2)}</p>
                        </div>
                      )}
                      {selectedQuote.hardwareCare && selectedQuote.devices && (
                        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                          <p className="text-gray-300">Hardware Care</p>
                          <p className="text-lg font-semibold">£{(selectedQuote.devices.reduce((sum: number, d: any) => sum + d.quantity, 0) * 5).toFixed(2)}</p>
                        </div>
                      )}
                      {selectedQuote.settlementType === '7_day' && (
                        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                          <p className="text-gray-300">Settlement Fee</p>
                          <p className="text-lg font-semibold">£10.00</p>
                        </div>
                      )}
                      {selectedQuote.dojoPlan && (
                        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                          <p className="text-gray-300">Dojo Plan</p>
                          <p className="text-lg font-semibold">£11.99</p>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-4">
                        <p className="text-xl font-bold">Total Monthly Cost</p>
                        <p className="text-3xl font-bold text-emerald-400">
                          £{selectedQuote.totalAmount ? parseFloat(selectedQuote.totalAmount).toFixed(2) : '0.00'}
                        </p>
                      </div>
                    </div>
                    {selectedQuote.oneTimeDeviceCost > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="flex justify-between items-center">
                          <p className="text-gray-300">One-Time Equipment Cost</p>
                          <p className="text-xl font-bold">£{parseFloat(selectedQuote.oneTimeDeviceCost).toFixed(2)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4">
                    <p className="text-sm font-medium text-gray-600">Current Status</p>
                    <Badge
                      className={`${STATUS_CONFIG[selectedQuote.customerJourneyStatus as keyof typeof STATUS_CONFIG]?.color} border rounded-full px-4 py-2 text-sm font-medium`}
                      data-testid="badge-modal-status"
                    >
                      {STATUS_CONFIG[selectedQuote.customerJourneyStatus as keyof typeof STATUS_CONFIG]?.label}
                    </Badge>
                  </div>

                  {/* Bill Upload Requirement Indicator */}
                  {selectedQuote.businessType === 'switcher' && (
                    <div className={`rounded-2xl p-6 border-2 ${selectedQuote.billUploaded ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`rounded-full p-3 ${selectedQuote.billUploaded ? 'bg-green-600' : 'bg-amber-600'}`}>
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {selectedQuote.billUploaded ? 'Bill Upload Complete' : 'Bill Upload Required'}
                          </h3>
                          <p className="text-gray-600">
                            {selectedQuote.billUploaded 
                              ? 'The current processor bill has been uploaded and submitted.' 
                              : 'As a switcher business, a copy of the current processor bill is required to proceed.'}
                          </p>
                        </div>
                        {selectedQuote.billUploaded && <CheckCircle2 className="h-6 w-6 text-green-600" />}
                      </div>
                    </div>
                  )}

                  {selectedQuote.adminNotes && (
                    <div className="bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Notes from Dojo</h4>
                      <p className="text-gray-700" data-testid="text-admin-notes">{selectedQuote.adminNotes}</p>
                    </div>
                  )}

                  {/* Q&A Thread Section */}
                  <QuoteQASection quoteId={selectedQuote.id} />

                  {/* Action buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={handleApprove}
                      disabled={approveMutation.isPending}
                      className="h-14 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold"
                      data-testid="button-approve"
                    >
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Approve Quote & Continue
                    </Button>
                    <Button
                      onClick={() => setShowQuestionModal(true)}
                      variant="outline"
                      className="h-14 border-2 rounded-xl font-semibold"
                      data-testid="button-ask-question"
                    >
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Ask a Question
                    </Button>
                    <Button
                      onClick={() => setShowRateRequestModal(true)}
                      variant="outline"
                      className="h-14 border-2 rounded-xl font-semibold"
                      data-testid="button-request-rate"
                    >
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Request Different Rates
                    </Button>
                    <Button
                      onClick={() => handleSendToClient(selectedQuote.id)}
                      disabled={sendToClientMutation.isPending}
                      variant="outline"
                      className="h-14 border-2 rounded-xl font-semibold"
                      data-testid="button-send-to-client"
                    >
                      <Send className="mr-2 h-5 w-5" />
                      Send to Client
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Ask Question Modal */}
        <Dialog open={showQuestionModal} onOpenChange={setShowQuestionModal}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle data-testid="text-question-modal-title">Ask a Question</DialogTitle>
              <DialogDescription data-testid="text-question-modal-description">
                Send your question to Dojo and they'll get back to you shortly.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="question">Your Question</Label>
                <Textarea
                  id="question"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Type your question here..."
                  rows={5}
                  className="mt-2 rounded-xl"
                  data-testid="input-question"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleAskQuestion}
                  disabled={!questionText.trim() || askQuestionMutation.isPending}
                  className="flex-1 h-12 rounded-xl"
                  data-testid="button-submit-question"
                >
                  Submit Question
                </Button>
                <Button
                  onClick={() => {
                    setShowQuestionModal(false);
                    setQuestionText("");
                  }}
                  variant="outline"
                  className="h-12 rounded-xl"
                  data-testid="button-cancel-question"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Rate Request Modal */}
        <Dialog open={showRateRequestModal} onOpenChange={setShowRateRequestModal}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle data-testid="text-rate-modal-title">Request Different Rates</DialogTitle>
              <DialogDescription data-testid="text-rate-modal-description">
                Explain what rates you'd like and why they would be better for your client.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="rateRequest">Your Request</Label>
                <Textarea
                  id="rateRequest"
                  value={rateRequestText}
                  onChange={(e) => setRateRequestText(e.target.value)}
                  placeholder="Describe the rates you're requesting..."
                  rows={5}
                  className="mt-2 rounded-xl"
                  data-testid="input-rate-request"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleRequestRate}
                  disabled={!rateRequestText.trim() || requestRateMutation.isPending}
                  className="flex-1 h-12 rounded-xl"
                  data-testid="button-submit-rate-request"
                >
                  Submit Request
                </Button>
                <Button
                  onClick={() => {
                    setShowRateRequestModal(false);
                    setRateRequestText("");
                  }}
                  variant="outline"
                  className="h-12 rounded-xl"
                  data-testid="button-cancel-rate-request"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Signup Form Modal */}
        {selectedQuote && (
          <AdditionalDetailsForm
            isOpen={showSignupModal}
            onClose={() => {
              setShowSignupModal(false);
              setSelectedQuote(null);
            }}
            onComplete={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
            }}
            quoteId={selectedQuote.id}
            referral={{
              id: selectedQuote.referralId,
              businessName: selectedQuote.businessName || "your business",
              businessEmail: selectedQuote.businessEmail,
            }}
          />
        )}
        </div>
      </div>
    </div>
  );
}
