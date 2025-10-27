import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, MessageSquare, TrendingUp, Send, Eye, FileText, X, User, Upload, AlertCircle, Clock, DollarSign, Circle, Download } from "lucide-react";
import Navigation from "@/components/navigation";
import SideNavigation from "@/components/side-navigation";
import { useToast } from "@/hooks/use-toast";
import AdditionalDetailsForm from "@/components/additional-details-form";

// Q&A Section Component
function QuoteQASection({ quoteId, quote }: { quoteId: string; quote?: any }) {
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
        Conversation
      </h3>
      
      {/* Audit Trail */}
      {quote && (quote.docsOutDate || quote.requestDocumentsDate) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Activity History</p>
          <div className="space-y-1 text-xs text-gray-600">
            {quote.docsOutDate && (
              <p>✓ Docs sent on: {new Date(quote.docsOutDate).toLocaleString()}</p>
            )}
            {quote.requestDocumentsDate && (
              <p>✓ Documents requested on: {new Date(quote.requestDocumentsDate).toLocaleString()}</p>
            )}
          </div>
        </div>
      )}
      
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

// Document Upload Section Component - Improved "Almost Done" experience
function DocumentUploadSection({ quoteId, quote }: { quoteId: string; quote: any }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showNTCWarning, setShowNTCWarning] = useState(false);
  const [markingNTC, setMarkingNTC] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch uploaded documents for this quote
  const { data: uploadedDocs = [], refetch: refetchDocs } = useQuery({
    queryKey: ['/api/quotes', quoteId, 'documents'],
    queryFn: async () => {
      const response = await fetch(`/api/quotes/${quoteId}/documents`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    },
  });

  // Auto-upload when file is selected
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploading(true);

    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', 'switcher_statement'); // Default to switcher statement

    try {
      const response = await fetch(`/api/quotes/${quoteId}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Document uploaded successfully!",
          description: "Your statement has been submitted for review",
        });
        setSelectedFile(null);
        refetchDocs();
        queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleMarkAsNTC = async () => {
    setMarkingNTC(true);
    try {
      const response = await fetch(`/api/quotes/${quoteId}/mark-ntc`, {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: "Marked as New to Card",
          description: "Your quote will be processed with NTC pricing",
        });
        setShowNTCWarning(false);
        queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      } else {
        throw new Error('Failed to mark as NTC');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setMarkingNTC(false);
    }
  };

  const handleDownload = async (docId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}/documents/${docId}/download`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the document",
        variant: "destructive",
      });
    }
  };

  const hasUploadedStatement = uploadedDocs.some((doc: any) => doc.documentType === 'switcher_statement');

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border-2 border-blue-200">
      {/* Almost Done Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
          <CheckCircle2 className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Almost Done! 🎉</h2>
        <p className="text-lg text-gray-700">
          Upload a bill from your current payment processor
        </p>
        <p className="text-sm text-gray-600 mt-1">
          (Your highest monthly statement from the last 6 months)
        </p>
      </div>

      {/* Uploaded Documents Display */}
      {uploadedDocs.length > 0 && (
        <div className="mb-6 bg-white rounded-2xl p-6 border-2 border-green-200">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Uploaded Documents
          </h4>
          <div className="space-y-2">
            {uploadedDocs.map((doc: any) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{doc.fileName}</p>
                    <p className="text-xs text-green-700">Uploaded successfully</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(doc.id, doc.fileName)}
                  className="ml-2 border-green-300"
                  data-testid={`button-download-${doc.id}`}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Action Buttons */}
      {!hasUploadedStatement && (
        <div className="space-y-4 mb-6">
          {/* Upload Document Button */}
          <div className="bg-white rounded-2xl p-6 border-2 border-blue-300 hover:border-blue-500 transition-all">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Option 1: Upload Your Statement
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Get the best rates based on your processing history
            </p>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="document-upload"
              data-testid="input-document-file"
              disabled={uploading}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-lg font-semibold"
              data-testid="button-upload-statement"
            >
              {uploading ? (
                <>
                  <Clock className="mr-2 h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Statement
                </>
              )}
            </Button>
          </div>

          {/* Mark as No Statement Button */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-300 hover:border-orange-400 transition-all">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Option 2: I Don't Have a Statement
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              New business or prefer flat rate pricing
            </p>
            <Button
              onClick={() => setShowNTCWarning(true)}
              variant="outline"
              className="w-full h-14 rounded-xl border-2 border-orange-400 hover:bg-orange-50 text-lg font-semibold"
              data-testid="button-mark-no-statement"
            >
              <FileText className="mr-2 h-5 w-5" />
              Mark as No Statement Available
            </Button>
          </div>
        </div>
      )}

      {/* Skip Button */}
      {!hasUploadedStatement && quote?.businessType !== 'new_to_card' && (
        <div className="text-center">
          <p className="text-sm text-gray-500 bg-yellow-50 border border-yellow-300 rounded-xl p-4">
            <AlertCircle className="inline h-4 w-4 mr-1" />
            Your quote cannot be processed until you upload a statement or mark as NTC
          </p>
        </div>
      )}

      {/* Confirmation Message if already uploaded */}
      {hasUploadedStatement && (
        <div className="text-center bg-white rounded-2xl p-6 border-2 border-green-300">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-green-900 mb-2">
            Thank you! Your statement has been received
          </h3>
          <p className="text-gray-700">
            Our team will review your submission and prepare your custom quote
          </p>
        </div>
      )}

      {/* NTC Warning Dialog */}
      <Dialog open={showNTCWarning} onOpenChange={setShowNTCWarning}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-orange-600" />
              New to Card (NTC) Pricing
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
              <p className="font-semibold text-orange-900 mb-2">
                ⚠️ Without a processing statement, you'll receive our NTC package:
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-5 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Terminal Options</p>
                  <p className="text-sm text-gray-600">Pay once or monthly - £39</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Processing Rates</p>
                  <p className="text-sm text-gray-600">Covers up to £4,000 processing volume</p>
                  <p className="text-sm text-gray-600">1% flat rate surcharge over £4,000</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">What's Included</p>
                  <p className="text-sm text-gray-600">Secure transactions & Dojo plan included</p>
                </div>
              </div>

              <div className="border-t-2 border-gray-200 pt-3 mt-3">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Your Commission</p>
                    <p className="text-sm text-gray-600">£280 total (60% split = £168 for you)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900">
                <strong>Perfect for:</strong> New businesses or those who prefer simple, flat-rate pricing
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowNTCWarning(false)}
              className="flex-1"
              data-testid="button-cancel-ntc"
            >
              Cancel
            </Button>
            <Button
              onClick={handleMarkAsNTC}
              disabled={markingNTC}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              data-testid="button-confirm-ntc"
            >
              {markingNTC ? 'Processing...' : 'Confirm NTC Pricing'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Status mapping with colors and user-friendly labels
const STATUS_CONFIG = {
  review_quote: {
    label: "Quote Received",
    stage: "quote_received",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Eye
  },
  sent_to_client: {
    label: "Quote Received",
    stage: "quote_received",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Eye
  },
  awaiting_signup: {
    label: "Application Sent",
    stage: "application_sent",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Send
  },
  agreement_sent: {
    label: "Application Sent",
    stage: "application_sent",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Send
  },
  docs_out: {
    label: "Documents Required",
    stage: "documents_required",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: FileText
  },
  awaiting_docs: {
    label: "Documents Required",
    stage: "documents_required",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: FileText
  },
  approved: {
    label: "Approved for Delivery",
    stage: "approved",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle2
  },
  live: {
    label: "Live & Ready for Payment",
    stage: "live",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: DollarSign
  },
};

// Stage categories for tabs
const QUOTE_STAGES = [
  { value: 'all', label: 'All Quotes', icon: FileText },
  { value: 'quote_received', label: 'Quote Received', icon: Eye },
  { value: 'application_sent', label: 'Application Sent', icon: Send },
  { value: 'documents_required', label: 'Documents Required', icon: Clock },
  { value: 'approved', label: 'Approved for Delivery', icon: CheckCircle2 },
  { value: 'live', label: 'Live & Ready for Payment', icon: DollarSign },
];

export default function Quotes() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showRateRequestModal, setShowRateRequestModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [rateRequestText, setRateRequestText] = useState("");
  const [activeTab, setActiveTab] = useState("all");

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
        {quotes.length === 0 ? (
          <Card className="border-2 border-dashed" data-testid="card-empty-state">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No quotes yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                When Dojo sends you a quote for your client referrals, they'll appear here for you to review and approve.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-6 h-auto">
              {QUOTE_STAGES.map((stage) => {
                const StageIcon = stage.icon;
                const stageQuotes = stage.value === 'all' 
                  ? quotes 
                  : quotes.filter((q: any) => {
                      const config = STATUS_CONFIG[q.customerJourneyStatus as keyof typeof STATUS_CONFIG];
                      return config?.stage === stage.value;
                    });
                
                return (
                  <TabsTrigger 
                    key={stage.value} 
                    value={stage.value}
                    className="flex-col h-auto py-3 px-2 data-[state=active]:bg-white data-[state=active]:shadow-md"
                    data-testid={`tab-${stage.value}`}
                  >
                    <StageIcon className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium">{stage.label}</span>
                    {stageQuotes.length > 0 && (
                      <Badge className="mt-1 h-5 min-w-5 px-1 text-xs" variant="secondary">
                        {stageQuotes.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {QUOTE_STAGES.map((stage) => {
              const filteredQuotes = stage.value === 'all' 
                ? quotes 
                : quotes.filter((q: any) => {
                    const config = STATUS_CONFIG[q.customerJourneyStatus as keyof typeof STATUS_CONFIG];
                    return config?.stage === stage.value;
                  });

              return (
                <TabsContent key={stage.value} value={stage.value}>
                  {filteredQuotes.length === 0 ? (
                    <Card className="border-2 border-dashed">
                      <CardContent className="py-12 text-center">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No {stage.label.toLowerCase()}</h3>
                        <p className="text-gray-600">Quotes at this stage will appear here</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredQuotes.map((quote: any) => {
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
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}

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

                  {/* Document Upload Section */}
                  <DocumentUploadSection quoteId={selectedQuote.id} quote={selectedQuote} />

                  {/* Q&A Thread Section */}
                  <QuoteQASection quoteId={selectedQuote.id} quote={selectedQuote} />

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

        {/* Request Update Modal */}
        <Dialog open={showQuestionModal} onOpenChange={setShowQuestionModal}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle data-testid="text-question-modal-title">Request Update</DialogTitle>
              <DialogDescription data-testid="text-question-modal-description">
                Send a message or request an update from Dojo and they'll respond through the quote messaging system.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="question">Your Message</Label>
                <Textarea
                  id="question"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Type your message or update request here..."
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
                  Send Message
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
