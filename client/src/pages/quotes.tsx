import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, MessageSquare, TrendingUp, Send, Eye, FileText, X } from "lucide-react";
import MainLayout from "@/components/layouts/main-layout";
import { useToast } from "@/hooks/use-toast";

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
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showRateRequestModal, setShowRateRequestModal] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [rateRequestText, setRateRequestText] = useState("");

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['/api/quotes'],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest(`/api/quotes/${id}/update-status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
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
      return apiRequest(`/api/quotes/${id}/question`, {
        method: 'POST',
        body: JSON.stringify({ question }),
      });
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
      return apiRequest(`/api/quotes/${id}/rate-request`, {
        method: 'POST',
        body: JSON.stringify({ request }),
      });
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
      return apiRequest(`/api/quotes/${id}/approve`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      setSelectedQuote(null);
      toast({
        title: "Quote approved",
        description: "Quote approved! You can now complete the signup form",
      });
    },
  });

  const sendToClientMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/quotes/${id}/send-to-client`, {
        method: 'POST',
      });
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

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading quotes...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
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
                  {/* Quote details */}
                  <div className="bg-gray-50 rounded-2xl p-6 border-2">
                    <h3 className="text-lg font-semibold mb-4">Quote Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="text-2xl font-bold text-gray-900" data-testid="text-modal-amount">
                          £{selectedQuote.totalAmount ? parseFloat(selectedQuote.totalAmount).toLocaleString() : '0'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <Badge
                          className={`${STATUS_CONFIG[selectedQuote.customerJourneyStatus as keyof typeof STATUS_CONFIG]?.color} border rounded-full px-3 py-1 text-xs font-medium mt-2`}
                          data-testid="badge-modal-status"
                        >
                          {STATUS_CONFIG[selectedQuote.customerJourneyStatus as keyof typeof STATUS_CONFIG]?.label}
                        </Badge>
                      </div>
                    </div>
                    {selectedQuote.adminNotes && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-1">Notes from Dojo</p>
                        <p className="text-gray-900" data-testid="text-admin-notes">{selectedQuote.adminNotes}</p>
                      </div>
                    )}
                  </div>

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

                  {/* Rate breakdown */}
                  {selectedQuote.ratesData && (
                    <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-100">
                      <h3 className="text-lg font-semibold mb-3">Rate Breakdown</h3>
                      <div className="space-y-2">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap" data-testid="text-rates-data">
                          {JSON.stringify(selectedQuote.ratesData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
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
      </div>
    </MainLayout>
  );
}
