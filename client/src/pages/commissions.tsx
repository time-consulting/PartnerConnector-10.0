import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, Clock, Download } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

export default function CommissionsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("commissions");
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [queryDialogOpen, setQueryDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [queryNotes, setQueryNotes] = useState("");
  
  // Bank details state
  const [bankDetails, setBankDetails] = useState({
    bankAccountName: "",
    bankSortCode: "",
    bankAccountNumber: ""
  });

  // Fetch user data
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"]
  });

  // Fetch commission payments
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["/api/commission-payments"]
  });

  // Fetch team payments
  const { data: teamPayments = [], isLoading: teamLoading } = useQuery({
    queryKey: ["/api/commission-payments/team"]
  });

  // Calculate totals
  const totalAvailable = payments
    .filter((p: any) => p.approvalStatus === 'approved' && p.paymentStatus === 'approved_pending')
    .reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0);

  const totalPending = payments
    .filter((p: any) => p.approvalStatus === 'pending')
    .reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0);

  // Bank details setup mutation
  const setupBankMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", "/api/user/bank-details", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bank details saved successfully"
      });
      setSetupDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save bank details",
        variant: "destructive"
      });
    }
  });

  // Approve payment mutation
  const approveMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      return await apiRequest("PATCH", `/api/commission-payments/${paymentId}/approve`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Commission approved successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/commission-payments"] });
    }
  });

  // Query payment mutation
  const queryMutation = useMutation({
    mutationFn: async ({ paymentId, queryNotes }: any) => {
      return await apiRequest("PATCH", `/api/commission-payments/${paymentId}/query`, { queryNotes });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Query submitted successfully"
      });
      setQueryDialogOpen(false);
      setSelectedPayment(null);
      setQueryNotes("");
      queryClient.invalidateQueries({ queryKey: ["/api/commission-payments"] });
    }
  });

  const handleSetupBank = () => {
    if (!bankDetails.bankAccountName || !bankDetails.bankSortCode || !bankDetails.bankAccountNumber) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    setupBankMutation.mutate(bankDetails);
  };

  const handleApprove = (paymentId: string) => {
    approveMutation.mutate(paymentId);
  };

  const handleQuerySubmit = () => {
    if (!selectedPayment || !queryNotes) {
      toast({
        title: "Error",
        description: "Please provide query details",
        variant: "destructive"
      });
      return;
    }
    queryMutation.mutate({ paymentId: selectedPayment.id, queryNotes });
  };

  const getStatusBadge = (payment: any) => {
    if (payment.approvalStatus === 'approved') {
      return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
    }
    if (payment.approvalStatus === 'queried') {
      return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Queried</Badge>;
    }
    return <Badge variant="default" className="bg-blue-100 text-blue-800">Pending Approval</Badge>;
  };

  const getLevelLabel = (level: number) => {
    if (level === 1) return "Direct Commission";
    if (level === 2) return "Level 1 Override";
    if (level === 3) return "Level 2 Override";
    return `Level ${level}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Commissions & withdrawals</h1>
        </div>

        {/* Top Section - Available Funds & Setup */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Available Funds Card */}
          <Card>
            <CardHeader>
              <CardDescription className="text-sm text-gray-600">Total available funds</CardDescription>
              <CardTitle className="text-3xl font-bold">£{totalAvailable.toFixed(2)} GBP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total commissions</span>
                <span className="font-medium">£{totalAvailable.toFixed(2)} GBP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Processing fee</span>
                <span className="font-medium">£0.00 GBP</span>
              </div>
              <div className="pt-3 border-t text-xs text-gray-500">
                *Exchange rates may fluctuate at time of withdrawal
              </div>
            </CardContent>
          </Card>

          {/* Setup Withdrawals Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Setup withdrawals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setSetupDialogOpen(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                data-testid="button-setup-withdrawals"
              >
                Setup withdrawals
              </Button>
              <p className="text-sm text-gray-600 text-center">
                Select from direct deposit, PayPal or Stripe
              </p>
              {user?.bankingComplete && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Bank details configured</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projected Earnings Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardDescription>Projected earnings for this month</CardDescription>
                <Select defaultValue="this-month">
                  <SelectTrigger className="w-[180px]" data-testid="select-month">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this-month">this month</SelectItem>
                    <SelectItem value="last-month">last month</SelectItem>
                    <SelectItem value="this-year">this year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CardTitle className="text-2xl font-bold">£{totalPending.toFixed(2)} GBP</CardTitle>
              <p className="text-sm text-gray-600">
                Total commissions that are <span className="font-semibold">pending approval</span> and{" "}
                <span className="font-semibold">approved & pending</span> for {format(new Date(), 'MMM yyyy')}.
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="commissions" data-testid="tab-commissions">Commissions</TabsTrigger>
              <TabsTrigger value="team" data-testid="tab-team">Team payments</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-indigo-600">
                Learn about commission statuses
              </Button>
              <Button variant="ghost" size="sm" className="text-indigo-600">
                <Download className="w-4 h-4 mr-2" />
                Export commissions
              </Button>
            </div>
          </div>

          {/* Commissions Tab */}
          <TabsContent value="commissions" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                {paymentsLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No commission payments yet
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Commission status</TableHead>
                        <TableHead>Payment status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment: any) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.businessName || "N/A"}</TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">{getLevelLabel(payment.level)}</span>
                          </TableCell>
                          <TableCell>{getStatusBadge(payment)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{payment.paymentStatus}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {payment.createdAt ? format(new Date(payment.createdAt), 'dd MMM yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            £{parseFloat(payment.amount).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {payment.approvalStatus === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(payment.id)}
                                  disabled={approveMutation.isPending}
                                  data-testid={`button-approve-${payment.id}`}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setQueryDialogOpen(true);
                                  }}
                                  data-testid={`button-query-${payment.id}`}
                                >
                                  <AlertCircle className="w-4 h-4 mr-1" />
                                  Query
                                </Button>
                              </div>
                            )}
                            {payment.approvalStatus === 'queried' && (
                              <Badge variant="outline" className="text-yellow-600">
                                Query submitted
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Payments Tab */}
          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Override Payments</CardTitle>
                <CardDescription>
                  Commission overrides from your downline team members (Level 1: 20%, Level 2: 10%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {teamLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : teamPayments.filter((p: any) => p.level >= 2).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No team override payments yet</p>
                    <p className="text-sm mt-2">Build your team to earn override commissions!</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Override Level</TableHead>
                        <TableHead>Commission status</TableHead>
                        <TableHead>Payment status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamPayments.filter((p: any) => p.level >= 2).map((payment: any) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.businessName || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {payment.level === 2 ? "Level 1 (20%)" : "Level 2 (10%)"}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(payment)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{payment.paymentStatus}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {payment.createdAt ? format(new Date(payment.createdAt), 'dd MMM yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            £{parseFloat(payment.amount).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bank Details Setup Dialog */}
      <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
        <DialogContent className="sm:max-width-[500px]" data-testid="dialog-setup-withdrawals">
          <DialogHeader>
            <DialogTitle>Setup withdrawal method</DialogTitle>
            <DialogDescription>
              Enter your bank details to receive commission payments
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="accountName">Account name</Label>
              <Input
                id="accountName"
                placeholder="John Smith"
                value={bankDetails.bankAccountName}
                onChange={(e) => setBankDetails({ ...bankDetails, bankAccountName: e.target.value })}
                data-testid="input-account-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortCode">Sort code</Label>
              <Input
                id="sortCode"
                placeholder="12-34-56"
                value={bankDetails.bankSortCode}
                onChange={(e) => setBankDetails({ ...bankDetails, bankSortCode: e.target.value })}
                data-testid="input-sort-code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account number</Label>
              <Input
                id="accountNumber"
                placeholder="12345678"
                value={bankDetails.bankAccountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, bankAccountNumber: e.target.value })}
                data-testid="input-account-number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSetupDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetupBank} disabled={setupBankMutation.isPending} data-testid="button-save-bank">
              {setupBankMutation.isPending ? "Saving..." : "Save details"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Query Payment Dialog */}
      <Dialog open={queryDialogOpen} onOpenChange={setQueryDialogOpen}>
        <DialogContent data-testid="dialog-query-payment">
          <DialogHeader>
            <DialogTitle>Query commission payment</DialogTitle>
            <DialogDescription>
              Please provide details about your query
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="queryNotes">Query details</Label>
              <Textarea
                id="queryNotes"
                placeholder="Please explain your query..."
                value={queryNotes}
                onChange={(e) => setQueryNotes(e.target.value)}
                rows={4}
                data-testid="textarea-query-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setQueryDialogOpen(false);
              setSelectedPayment(null);
              setQueryNotes("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleQuerySubmit} disabled={queryMutation.isPending} data-testid="button-submit-query">
              {queryMutation.isPending ? "Submitting..." : "Submit query"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
