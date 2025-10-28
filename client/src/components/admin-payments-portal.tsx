import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign,
  Building,
  User,
  Mail,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Send,
  Calculator,
  Users
} from "lucide-react";

export function AdminPaymentsPortal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [calculatedBreakdown, setCalculatedBreakdown] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Fetch live accounts
  const { data: liveAccounts = [], isLoading } = useQuery({
    queryKey: ['/api/admin/payments/live-accounts'],
  });

  // Calculate breakdown mutation
  const calculateMutation = useMutation({
    mutationFn: async ({ quoteId, totalAmount }: { quoteId: string; totalAmount: string }) => {
      const response = await apiRequest('POST', '/api/admin/payments/calculate', {
        quoteId,
        totalAmount
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setCalculatedBreakdown(data);
      toast({
        title: "Calculation Complete",
        description: "Commission breakdown has been calculated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Calculation Failed",
        description: error.message || "Failed to calculate commission breakdown",
        variant: "destructive",
      });
    },
  });

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiRequest('POST', '/api/admin/payments/process', paymentData);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments/live-accounts'] });
      setSelectedQuote(null);
      setPaymentAmount("");
      setCalculatedBreakdown(null);
      setShowConfirmation(false);
      
      toast({
        title: data.success ? "Payments Processed" : "Partial Success",
        description: data.message,
        variant: data.totalFailed > 0 ? "destructive" : "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Processing Failed",
        description: error.message || "Failed to process payments",
        variant: "destructive",
      });
    },
  });

  const handleCalculate = () => {
    if (!selectedQuote || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }

    calculateMutation.mutate({
      quoteId: selectedQuote.id,
      totalAmount: paymentAmount
    });
  };

  const handleProcessPayment = () => {
    if (!calculatedBreakdown) {
      toast({
        title: "No Calculation",
        description: "Please calculate the breakdown first",
        variant: "destructive",
      });
      return;
    }

    setShowConfirmation(true);
  };

  const confirmPayment = () => {
    processPaymentMutation.mutate({
      quoteId: selectedQuote.id,
      totalAmount: paymentAmount,
      paymentReference: `PAY-${selectedQuote.quoteId || selectedQuote.id}`,
      breakdown: calculatedBreakdown.breakdown
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                Payment Portal
              </CardTitle>
              <CardDescription className="mt-2">
                Process commission payments for completed live accounts
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {liveAccounts.length}
              </div>
              <div className="text-sm text-gray-600">Pending Payments</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Live Accounts Grid */}
      {liveAccounts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">No pending commission payments at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {liveAccounts.map((account: any) => (
            <Card 
              key={account.id} 
              className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500"
              data-testid={`card-payment-${account.id}`}
            >
              <CardHeader className="bg-gradient-to-r from-green-50 to-transparent">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building className="h-5 w-5 text-green-600" />
                      {account.referral?.businessName || "Unknown Business"}
                    </CardTitle>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        {account.referral?.businessEmail || "No email"}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-xs">
                          {account.quoteId || account.id}
                        </Badge>
                        <Badge className="bg-green-500 text-white text-xs">
                          LIVE ACCOUNT
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Est. Commission</div>
                    <div className="text-2xl font-bold text-green-600">
                      £{parseFloat(account.estimatedCommission || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6">
                {/* Upline Structure */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-gray-600" />
                    <h4 className="text-sm font-semibold text-gray-700">MLM Structure</h4>
                  </div>
                  <div className="space-y-2">
                    {/* Level 1 - Direct */}
                    <div className="flex items-center gap-2 text-xs">
                      <Badge className="bg-blue-500 text-white">L1 - 60%</Badge>
                      <User className="h-3 w-3" />
                      <span className="font-medium">
                        {account.user ? `${account.user.firstName} ${account.user.lastName}` : "No user"}
                      </span>
                      <span className="text-gray-500">({account.user?.email})</span>
                    </div>
                    
                    {/* Level 2 - Parent */}
                    {account.uplineUsers && account.uplineUsers.length > 0 && (
                      <div className="flex items-center gap-2 text-xs pl-4">
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <Badge className="bg-purple-500 text-white">L2 - 20%</Badge>
                        <User className="h-3 w-3" />
                        <span className="font-medium">
                          {account.uplineUsers[0].firstName} {account.uplineUsers[0].lastName}
                        </span>
                        <span className="text-gray-500">({account.uplineUsers[0].email})</span>
                      </div>
                    )}
                    
                    {/* Level 3 - Grandparent */}
                    {account.uplineUsers && account.uplineUsers.length > 1 && (
                      <div className="flex items-center gap-2 text-xs pl-8">
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <Badge className="bg-indigo-500 text-white">L3 - 10%</Badge>
                        <User className="h-3 w-3" />
                        <span className="font-medium">
                          {account.uplineUsers[1].firstName} {account.uplineUsers[1].lastName}
                        </span>
                        <span className="text-gray-500">({account.uplineUsers[1].email})</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setSelectedQuote(account);
                    setPaymentAmount(account.estimatedCommission || "");
                    setCalculatedBreakdown(null);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700"
                  data-testid={`button-process-payment-${account.id}`}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Process Payment
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Payment Processing Dialog */}
      <Dialog open={!!selectedQuote} onOpenChange={(open) => {
        if (!open) {
          setSelectedQuote(null);
          setPaymentAmount("");
          setCalculatedBreakdown(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Process Commission Payment
            </DialogTitle>
            <DialogDescription>
              {selectedQuote?.referral?.businessName} - {selectedQuote?.quoteId}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Payment Amount Input */}
            <div>
              <Label htmlFor="payment-amount">Total Payment Amount (LTR)</Label>
              <div className="flex gap-2 mt-1">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                  <Input
                    id="payment-amount"
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="pl-7"
                    placeholder="0.00"
                    data-testid="input-payment-amount"
                  />
                </div>
                <Button
                  onClick={handleCalculate}
                  disabled={calculateMutation.isPending}
                  data-testid="button-calculate-breakdown"
                >
                  {calculateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Commission Breakdown */}
            {calculatedBreakdown && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900">Commission Breakdown</h4>
                
                {calculatedBreakdown.breakdown.map((item: any, index: number) => (
                  <Card key={index} className="bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={
                            item.level === 1 ? "bg-blue-500" :
                            item.level === 2 ? "bg-purple-500" :
                            "bg-indigo-500"
                          }>
                            Level {item.level}
                          </Badge>
                          <div>
                            <div className="font-medium text-sm">{item.userName}</div>
                            <div className="text-xs text-gray-500">{item.userEmail}</div>
                            <div className="text-xs text-gray-600 mt-1">{item.role}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            £{parseFloat(item.amount).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">{item.percentage}%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between font-bold">
                    <span>Total Distribution:</span>
                    <span className="text-green-600">
                      £{parseFloat(calculatedBreakdown.totalDistributed).toFixed(2)}
                    </span>
                  </div>
                  {calculatedBreakdown.remainingPercentage > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {calculatedBreakdown.remainingPercentage}% unallocated (no upline)
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedQuote(null);
                setPaymentAmount("");
                setCalculatedBreakdown(null);
              }}
              data-testid="button-cancel-payment"
            >
              Cancel
            </Button>
            <Button
              onClick={handleProcessPayment}
              disabled={!calculatedBreakdown || processPaymentMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-confirm-payment"
            >
              {processPaymentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Process Payment via Stripe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Confirm Stripe Payment
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to process <strong>£{paymentAmount}</strong> in commission payments
              through Stripe to <strong>{calculatedBreakdown?.breakdown.length}</strong> recipients.
              <br/><br/>
              This action cannot be undone. The funds will be transferred to the recipients'
              connected Stripe accounts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-confirmation">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPayment}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-confirm-stripe-payment"
            >
              Confirm & Send Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
