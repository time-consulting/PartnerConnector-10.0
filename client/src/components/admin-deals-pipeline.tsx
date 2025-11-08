import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  ChevronRight,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Calendar,
  Building2,
  Mail,
  Phone,
  Banknote,
  FileCheck,
  FileUp,
  CreditCard,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Define pipeline stages with metadata
const PIPELINE_STAGES = [
  {
    id: "quote_request",
    label: "Quote Requests",
    description: "New submissions requiring review",
    icon: FileText,
    color: "bg-blue-50 border-blue-200",
    badgeColor: "bg-blue-500",
  },
  {
    id: "quote_sent",
    label: "Sent Quotes",
    description: "Quotes sent to clients",
    icon: Mail,
    color: "bg-purple-50 border-purple-200",
    badgeColor: "bg-purple-500",
  },
  {
    id: "quote_approved",
    label: "Quote Approved - Sign Up",
    description: "Client ready to proceed",
    icon: CheckCircle,
    color: "bg-green-50 border-green-200",
    badgeColor: "bg-green-500",
  },
  {
    id: "agreement_sent",
    label: "Agreement Sent",
    description: "Contract sent to client",
    icon: FileCheck,
    color: "bg-yellow-50 border-yellow-200",
    badgeColor: "bg-yellow-500",
  },
  {
    id: "signed_awaiting_docs",
    label: "Signed - Awaiting Documents",
    description: "Contract signed, waiting for docs",
    icon: FileUp,
    color: "bg-orange-50 border-orange-200",
    badgeColor: "bg-orange-500",
  },
  {
    id: "approved",
    label: "Approved",
    description: "Everything approved, ready to go live",
    icon: CheckCircle,
    color: "bg-teal-50 border-teal-200",
    badgeColor: "bg-teal-500",
  },
  {
    id: "live_confirm_ltr",
    label: "Live - Confirm LTR",
    description: "Deal is live, confirm long-term relationship",
    icon: CreditCard,
    color: "bg-indigo-50 border-indigo-200",
    badgeColor: "bg-indigo-500",
  },
  {
    id: "invoice_received",
    label: "Invoice Received - Awaiting Payment",
    description: "Partner invoice submitted",
    icon: Banknote,
    color: "bg-pink-50 border-pink-200",
    badgeColor: "bg-pink-500",
  },
  {
    id: "completed",
    label: "Complete",
    description: "Fully closed deals",
    icon: CheckCircle,
    color: "bg-emerald-50 border-emerald-200",
    badgeColor: "bg-emerald-500",
  },
  {
    id: "declined",
    label: "Declined",
    description: "Deals that didn't proceed",
    icon: XCircle,
    color: "bg-gray-50 border-gray-200",
    badgeColor: "bg-gray-500",
  },
];

interface Deal {
  id: string;
  dealId: string | null;
  businessName: string;
  businessEmail: string;
  businessPhone: string | null;
  dealStage: string;
  submittedAt: string;
  actualCommission: string | null;
  estimatedCommission: string | null;
  monthlyVolume: string | null;
  currentProcessor: string | null;
  fundingAmount: string | null;
  selectedProducts: string[] | null;
  referrer: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function AdminDealsPipeline() {
  const { toast } = useToast();
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [queryDialogOpen, setQueryDialogOpen] = useState(false);
  const [queryMessage, setQueryMessage] = useState("");
  const [moveToStage, setMoveToStage] = useState("");
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);

  // Fetch all deals
  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: ["/api/admin/referrals"],
  });

  // Move deal to next stage mutation
  const moveToStageMutation = useMutation({
    mutationFn: async ({ dealId, stage }: { dealId: string; stage: string }) => {
      return await apiRequest("PATCH", `/api/admin/referrals/${dealId}/stage`, {
        dealStage: stage,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/referrals"] });
      toast({
        title: "Success",
        description: "Deal moved to new stage",
      });
      setMoveDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to move deal",
        variant: "destructive",
      });
    },
  });

  // Send query mutation
  const sendQueryMutation = useMutation({
    mutationFn: async ({ quoteId, message }: { quoteId: string; message: string }) => {
      return await apiRequest("POST", `/api/quotes/${quoteId}/messages`, {
        message,
        isAdminMessage: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/referrals"] });
      toast({
        title: "Success",
        description: "Query sent to partner",
      });
      setQueryDialogOpen(false);
      setQueryMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send query",
        variant: "destructive",
      });
    },
  });

  // Group deals by stage
  const dealsByStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.id] = deals.filter((deal) => deal.dealStage === stage.id);
    return acc;
  }, {} as Record<string, Deal[]>);

  const handleMoveToStage = (deal: Deal, targetStage: string) => {
    setSelectedDeal(deal);
    setMoveToStage(targetStage);
    setMoveDialogOpen(true);
  };

  const confirmMoveToStage = () => {
    if (selectedDeal) {
      moveToStageMutation.mutate({
        dealId: selectedDeal.id,
        stage: moveToStage,
      });
    }
  };

  const handleSendQuery = () => {
    if (selectedDeal && queryMessage.trim()) {
      sendQueryMutation.mutate({
        quoteId: selectedDeal.id,
        message: queryMessage,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pipeline Accordion */}
      <Accordion type="multiple" className="w-full space-y-3">
        {PIPELINE_STAGES.map((stage) => {
          const stageDeals = dealsByStage[stage.id] || [];
          const Icon = stage.icon;

          return (
            <AccordionItem
              key={stage.id}
              value={stage.id}
              className={`border-2 rounded-lg ${stage.color} transition-all hover:shadow-md`}
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline" data-testid={`accordion-${stage.id}`}>
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-4">
                    <Icon className="h-6 w-6 text-gray-700" />
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-gray-900">{stage.label}</h3>
                      <p className="text-sm text-gray-600">{stage.description}</p>
                    </div>
                  </div>
                  <Badge className={`${stage.badgeColor} text-white text-sm px-3 py-1`}>
                    {stageDeals.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                {stageDeals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No deals in this stage</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {stageDeals.map((deal) => (
                      <Card key={deal.id} className="border-2 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-xl font-bold text-gray-900">{deal.businessName}</h4>
                                <p className="text-sm text-gray-600">
                                  Partner: {deal.referrer.firstName} {deal.referrer.lastName}
                                </p>
                              </div>
                              {deal.dealId && (
                                <Badge variant="outline" className="font-mono">
                                  {deal.dealId}
                                </Badge>
                              )}
                            </div>

                            {/* Deal Details */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">{deal.businessEmail}</span>
                              </div>
                              {deal.businessPhone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-600">{deal.businessPhone}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">
                                  {format(new Date(deal.submittedAt), "MMM dd, yyyy")}
                                </span>
                              </div>
                              {deal.monthlyVolume && (
                                <div className="flex items-center gap-2">
                                  <Banknote className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-600">Vol: {deal.monthlyVolume}</span>
                                </div>
                              )}
                            </div>

                            {/* Commission Display */}
                            {(deal.actualCommission || deal.estimatedCommission) && (
                              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700">Commission</span>
                                  <span className="text-2xl font-bold text-green-700">
                                    £{deal.actualCommission || deal.estimatedCommission}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`/quotes#${deal.id}`, "_blank")}
                                data-testid={`button-view-deal-${deal.id}`}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedDeal(deal);
                                  setQueryDialogOpen(true);
                                }}
                                data-testid={`button-query-deal-${deal.id}`}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Send Query
                              </Button>
                              {stage.id !== "completed" && stage.id !== "declined" && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const currentIndex = PIPELINE_STAGES.findIndex((s) => s.id === stage.id);
                                    const nextStage = PIPELINE_STAGES[currentIndex + 1];
                                    if (nextStage) {
                                      handleMoveToStage(deal, nextStage.id);
                                    }
                                  }}
                                  data-testid={`button-move-deal-${deal.id}`}
                                >
                                  <ArrowRight className="h-4 w-4 mr-2" />
                                  Move Forward
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Query Dialog */}
      <Dialog open={queryDialogOpen} onOpenChange={setQueryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Query to Partner</DialogTitle>
            <DialogDescription>
              Send a message to the partner regarding {selectedDeal?.businessName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="query-message">Message</Label>
              <Textarea
                id="query-message"
                value={queryMessage}
                onChange={(e) => setQueryMessage(e.target.value)}
                placeholder="Enter your query..."
                rows={5}
                data-testid="input-query-message"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setQueryDialogOpen(false);
                setQueryMessage("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendQuery}
              disabled={!queryMessage.trim() || sendQueryMutation.isPending}
              data-testid="button-send-query"
            >
              {sendQueryMutation.isPending ? "Sending..." : "Send Query"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move to Stage Confirmation Dialog */}
      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Deal Forward</DialogTitle>
            <DialogDescription>
              Move {selectedDeal?.businessName} to {PIPELINE_STAGES.find((s) => s.id === moveToStage)?.label}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmMoveToStage}
              disabled={moveToStageMutation.isPending}
              data-testid="button-confirm-move"
            >
              {moveToStageMutation.isPending ? "Moving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
