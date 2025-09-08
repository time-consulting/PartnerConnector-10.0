import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Mail,
  Edit,
  Eye,
  Check,
  X,
  CreditCard,
  Plus,
  CheckCircle,
  XCircle
} from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function AdminPortal() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");

  // Redirect to home if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
    
    if (!isLoading && isAuthenticated && !(user as any)?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges to access this area.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: adminStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!(user as any)?.isAdmin,
    retry: false,
  });

  const { data: allUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!(user as any)?.isAdmin && selectedTab === "users",
    retry: false,
  });

  const { data: allReferrals } = useQuery({
    queryKey: ["/api/admin/referrals"],
    enabled: !!(user as any)?.isAdmin && selectedTab === "referrals",
    retry: false,
  });

  const sendPasswordResetMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest(`/api/admin/users/${userId}/reset-password`, "POST");
    },
    onSuccess: () => {
      toast({
        title: "Password Reset Sent",
        description: "Password reset email has been sent to the user.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send password reset email.",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      return await apiRequest(`/api/admin/users/${userId}`, "PATCH", data);
    },
    onSuccess: () => {
      toast({
        title: "User Updated",
        description: "User account has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update user account.",
        variant: "destructive",
      });
    },
  });

  const updateReferralMutation = useMutation({
    mutationFn: async ({ referralId, data }: { referralId: string; data: any }) => {
      return await apiRequest(`/api/admin/referrals/${referralId}`, "PATCH", data);
    },
    onSuccess: () => {
      toast({
        title: "Referral Updated",
        description: "Referral has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/referrals"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update referral.",
        variant: "destructive",
      });
    },
  });

  const sendQuoteMutation = useMutation({
    mutationFn: async ({ referralId, quoteData }: { referralId: string; quoteData: any }) => {
      return await apiRequest(`/api/admin/referrals/${referralId}/send-quote`, "POST", quoteData);
    },
    onSuccess: () => {
      toast({
        title: "Quote Sent Successfully",
        description: "The quote has been sent to the customer's portal and they've been notified.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/referrals"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send quote.",
        variant: "destructive",
      });
    },
  });

  const sendQuoteToCustomer = (referralId: string, quoteData: any) => {
    sendQuoteMutation.mutate({ referralId, quoteData });
  };

  // ============ RATES MANAGEMENT ============
  const { data: rates = [], refetch: refetchRates } = useQuery({
    queryKey: ["/api/admin/rates"],
    enabled: selectedTab === "rates"
  });

  const createRateMutation = useMutation({
    mutationFn: async (rateData: any) => {
      return await apiRequest("/api/admin/rates", "POST", rateData);
    },
    onSuccess: () => {
      toast({
        title: "Rate Created",
        description: "Rate has been created successfully.",
      });
      refetchRates();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create rate.",
        variant: "destructive",
      });
    },
  });

  const updateRateMutation = useMutation({
    mutationFn: async ({ rateId, data }: { rateId: string; data: any }) => {
      return await apiRequest(`/api/admin/rates/${rateId}`, "PATCH", data);
    },
    onSuccess: () => {
      toast({
        title: "Rate Updated",
        description: "Rate has been updated successfully.",
      });
      refetchRates();
    },
  });

  // ============ COMMISSION APPROVAL MANAGEMENT ============
  const { data: commissionApprovals = [], refetch: refetchCommissions } = useQuery({
    queryKey: ["/api/admin/commission-approvals"],
    enabled: selectedTab === "commissions"
  });

  const createCommissionApprovalMutation = useMutation({
    mutationFn: async ({ referralId, actualCommission, adminNotes }: { referralId: string; actualCommission: number; adminNotes?: string }) => {
      return await apiRequest(`/api/admin/referrals/${referralId}/create-commission-approval`, "POST", {
        actualCommission,
        adminNotes
      });
    },
    onSuccess: () => {
      toast({
        title: "Commission Approval Created",
        description: "Commission approval has been sent to the user for approval.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/referrals"] });
      refetchCommissions();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized", 
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create commission approval.",
        variant: "destructive",
      });
    },
  });

  const processPaymentMutation = useMutation({
    mutationFn: async ({ approvalId, paymentReference }: { approvalId: string; paymentReference?: string }) => {
      return await apiRequest(`/api/admin/commission-approvals/${approvalId}/process-payment`, "POST", {
        paymentReference
      });
    },
    onSuccess: () => {
      toast({
        title: "Payment Processed",
        description: "Commission payment has been processed successfully.",
      });
      refetchCommissions();
    },
  });

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  if (!(user as any)?.isAdmin) {
    return <div>Access denied...</div>;
  }

  const tabs = [
    { id: "overview", name: "Overview", icon: TrendingUp },
    { id: "users", name: "Users", icon: Users },
    { id: "referrals", name: "Referrals", icon: FileText },
    { id: "commissions", name: "Commissions", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Portal</h1>
          <p className="text-muted-foreground mt-2">Manage users, referrals, and system settings</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-border mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {selectedTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-total-users">
                    {(adminStats as any)?.totalUsers || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-total-referrals">
                    {(adminStats as any)?.totalReferrals || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600" data-testid="stat-pending-reviews">
                    {(adminStats as any)?.pendingReferrals || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600" data-testid="stat-total-commissions">
                    £{(adminStats as any)?.totalCommissions || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {selectedTab === "users" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">User Management</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {(allUsers as any[])?.map((user: any) => (
                <Card key={user.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                            {user.isAdmin && (
                              <Badge variant="destructive" className="text-xs">Admin</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">{user.profession} at {user.company}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" data-testid={`button-edit-user-${user.id}`}>
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit User: {user.firstName} {user.lastName}</DialogTitle>
                            </DialogHeader>
                            <UserEditForm user={user} onSave={(data) => updateUserMutation.mutate({ userId: user.id, data })} />
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendPasswordResetMutation.mutate(user.id)}
                          disabled={sendPasswordResetMutation.isPending}
                          data-testid={`button-reset-password-${user.id}`}
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Reset Password
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {selectedTab === "referrals" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Referral Management</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {(allReferrals as any[])?.map((referral: any) => (
                <Card key={referral.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{referral.businessName}</h3>
                          <Badge 
                            variant={referral.status === "pending" ? "outline" : 
                                   referral.status === "approved" ? "default" : "destructive"}
                          >
                            {referral.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{referral.businessEmail}</p>
                        <p className="text-sm">Monthly Volume: £{referral.monthlyVolume || "Not specified"}</p>
                        <p className="text-xs text-muted-foreground">
                          Submitted: {new Date(referral.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" data-testid={`button-view-referral-${referral.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-white dark:bg-gray-900">
                            <DialogHeader>
                              <DialogTitle>Referral Details: {referral.businessName}</DialogTitle>
                            </DialogHeader>
                            <ReferralDetailsView 
                              referral={referral} 
                              onUpdate={(data) => updateReferralMutation.mutate({ referralId: referral.id, data })} 
                            />
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              disabled={referral.status === "quote_sent" || referral.status === "quote_approved"}
                              data-testid={`button-send-quote-${referral.id}`}
                            >
                              <Mail className="w-4 h-4 mr-1" />
                              Send Quote
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-white dark:bg-gray-900">
                            <DialogHeader>
                              <DialogTitle>Send Quote - {referral.businessName}</DialogTitle>
                            </DialogHeader>
                            <QuoteForm 
                              referral={referral} 
                              onSend={(quoteData) => sendQuoteToCustomer(referral.id, quoteData)} 
                            />
                          </DialogContent>
                        </Dialog>

                        {!referral.actualCommission && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="secondary" data-testid={`button-set-commission-${referral.id}`}>
                                <DollarSign className="w-4 h-4 mr-1" />
                                Set Commission
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg bg-white dark:bg-gray-900">
                              <DialogHeader>
                                <DialogTitle>Set Actual Commission - {referral.businessName}</DialogTitle>
                              </DialogHeader>
                              <CommissionApprovalForm 
                                referral={referral}
                                onSubmit={(commissionData) => createCommissionApprovalMutation.mutate({
                                  referralId: referral.id,
                                  actualCommission: commissionData.actualCommission,
                                  adminNotes: commissionData.adminNotes
                                })}
                                isSubmitting={createCommissionApprovalMutation.isPending}
                              />
                            </DialogContent>
                          </Dialog>
                        )}

                        {referral.actualCommission && (
                          <div className="text-sm text-green-600 font-medium">
                            Commission Set: £{Number(referral.actualCommission).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Rates Management Tab */}
        {selectedTab === "rates" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Rates Management</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add New Rate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Rate</DialogTitle>
                  </DialogHeader>
                  <NewRateForm onSave={(data) => createRateMutation.mutate(data)} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rates.map((rate: any) => (
                <Card key={rate.id} className="relative">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{rate.name}</CardTitle>
                        <Badge variant={rate.category === 'payment_processing' ? 'default' : 'secondary'}>
                          {rate.category.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Rate</DialogTitle>
                          </DialogHeader>
                          <EditRateForm 
                            rate={rate} 
                            onSave={(data) => updateRateMutation.mutate({ rateId: rate.id, data })} 
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-primary">
                        {rate.value}%
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rate.description}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Type: {rate.rateType}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Commission Approvals Tab */}
        {selectedTab === "commissions" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Commission Approvals</h2>
              <div className="text-sm text-muted-foreground">
                Total Pending: {commissionApprovals.filter((c: any) => c.approvalStatus === 'pending').length}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {commissionApprovals.map((approval: any) => (
                <Card key={approval.id} className="relative">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <div className="font-medium">{approval.clientBusinessName}</div>
                        <div className="text-sm text-muted-foreground">
                          Referral ID: {approval.referralId.slice(0, 8)}...
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          £{Number(approval.commissionAmount).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Commission</div>
                      </div>

                      <div className="text-center">
                        <Badge 
                          variant={
                            approval.approvalStatus === 'approved' ? 'default' :
                            approval.approvalStatus === 'rejected' ? 'destructive' : 'secondary'
                          }
                          className="mb-2"
                        >
                          {approval.approvalStatus.toUpperCase()}
                        </Badge>
                        {approval.paymentStatus && (
                          <div className="text-xs">
                            Payment: {approval.paymentStatus}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        {approval.approvalStatus === 'approved' && approval.paymentStatus === 'pending' && (
                          <Button
                            onClick={() => processPaymentMutation.mutate({ approvalId: approval.id })}
                            disabled={processPaymentMutation.isPending}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Process Payment
                          </Button>
                        )}
                        {approval.paymentStatus === 'completed' && (
                          <div className="text-sm text-green-600">
                            ✓ Paid: {approval.paymentReference}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {approval.adminNotes && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-xs text-muted-foreground">Admin Notes:</div>
                        <div className="text-sm">{approval.adminNotes}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {commissionApprovals.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <div className="text-muted-foreground">No commission approvals found</div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ NEW FORM COMPONENTS ============

function NewRateForm({ onSave }: { onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "payment_processing",
    rateType: "percentage",
    value: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Rate Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Headline Debit Rate"
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="payment_processing">Payment Processing</SelectItem>
            <SelectItem value="business_funding">Business Funding</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="rateType">Rate Type</Label>
        <Select value={formData.rateType} onValueChange={(value) => setFormData({ ...formData, rateType: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="fixed">Fixed Amount</SelectItem>
            <SelectItem value="tiered">Tiered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="value">Rate Value</Label>
        <Input
          id="value"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          placeholder="e.g., 1.5 (for percentage rates)"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of this rate..."
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full">Create Rate</Button>
    </form>
  );
}

function EditRateForm({ rate, onSave }: { rate: any; onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: rate.name || "",
    category: rate.category || "payment_processing",
    rateType: rate.rateType || "percentage",
    value: rate.value || "",
    description: rate.description || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Rate Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="payment_processing">Payment Processing</SelectItem>
            <SelectItem value="business_funding">Business Funding</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="rateType">Rate Type</Label>
        <Select value={formData.rateType} onValueChange={(value) => setFormData({ ...formData, rateType: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="fixed">Fixed Amount</SelectItem>
            <SelectItem value="tiered">Tiered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="value">Rate Value</Label>
        <Input
          id="value"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full">Update Rate</Button>
    </form>
  );
}

// ============ COMMISSION APPROVAL FORM ============

function CommissionApprovalForm({ referral, onSubmit, isSubmitting }: { referral: any; onSubmit: (data: any) => void; isSubmitting: boolean }) {
  const [formData, setFormData] = useState({
    actualCommission: "",
    adminNotes: "",
    // Payment processing rates
    debitRate: "1.5",
    creditRate: "2.1", 
    corporateRate: "2.3",
    internationalRate: "2.8",
    amexRate: "3.2",
    secureTransactionFee: "1.5", // in pence
    platformFee: "10",
    fasterSettlement: false,
    terminalFee: "15"
  });
  
  const [activeTab, setActiveTab] = useState("savings");
  const [showBreakdown, setShowBreakdown] = useState(false);

  const monthlyVolume = parseFloat(referral.monthlyVolume?.replace(/[£,]/g, '') || "0");
  const commission = parseFloat(formData.actualCommission || "0");

  // Calculate estimated monthly savings for client
  const calculateSavings = () => {
    if (monthlyVolume <= 0) return { totalSavings: 0, breakdown: {} };

    // Assume typical competitor rates are higher
    const currentRates = {
      debit: 1.8, // vs our 1.5%
      credit: 2.5, // vs our 2.1%  
      corporate: 2.8, // vs our 2.3%
      platformFee: 25, // vs our £10
      terminalFee: 25 // vs our £15
    };

    const ourRates = {
      debit: parseFloat(formData.debitRate),
      credit: parseFloat(formData.creditRate),
      corporate: parseFloat(formData.corporateRate),
      platformFee: parseFloat(formData.platformFee),
      terminalFee: parseFloat(formData.terminalFee)
    };

    // Estimate transaction breakdown (60% debit, 30% credit, 10% corporate)
    const debitVolume = monthlyVolume * 0.6;
    const creditVolume = monthlyVolume * 0.3;
    const corporateVolume = monthlyVolume * 0.1;

    const debitSavings = (debitVolume * (currentRates.debit - ourRates.debit)) / 100;
    const creditSavings = (creditVolume * (currentRates.credit - ourRates.credit)) / 100;
    const corporateSavings = (corporateVolume * (currentRates.corporate - ourRates.corporate)) / 100;
    const platformSavings = currentRates.platformFee - ourRates.platformFee;
    const terminalSavings = currentRates.terminalFee - ourRates.terminalFee;

    const totalSavings = debitSavings + creditSavings + corporateSavings + platformSavings + terminalSavings;

    return {
      totalSavings,
      breakdown: {
        debitSavings,
        creditSavings, 
        corporateSavings,
        platformSavings,
        terminalSavings,
        debitVolume,
        creditVolume,
        corporateVolume
      }
    };
  };

  const savingsData = calculateSavings();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      actualCommission: parseFloat(formData.actualCommission),
      adminNotes: formData.adminNotes,
      ratesData: {
        debitRate: formData.debitRate,
        creditRate: formData.creditRate,
        corporateRate: formData.corporateRate,
        internationalRate: formData.internationalRate,
        amexRate: formData.amexRate,
        secureTransactionFee: formData.secureTransactionFee,
        platformFee: formData.platformFee,
        fasterSettlement: formData.fasterSettlement,
        terminalFee: formData.terminalFee,
        estimatedMonthlySavings: savingsData.totalSavings
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab("savings")}
            className={`mr-8 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "savings" 
                ? "border-green-500 text-green-600 bg-green-50" 
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            💰 Client Savings
          </button>
          <button
            onClick={() => setActiveTab("rates")}
            className={`mr-8 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "rates" 
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            📊 Rates Setup
          </button>
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab === "savings" && (
          <div className="space-y-4">
            {/* Highlighted Savings Display */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-green-800 mb-2">
                  Monthly Savings: £{savingsData.totalSavings.toFixed(2)}
                </h3>
                <p className="text-green-700">
                  Annual Savings: £{(savingsData.totalSavings * 12).toFixed(2)}
                </p>
                <p className="text-sm text-green-600 mt-2">
                  Based on £{monthlyVolume.toLocaleString()} monthly volume
                </p>
              </div>
            </div>

            {/* Commission Input */}
            <div>
              <Label htmlFor="actualCommission">Actual Commission Amount (£)</Label>
              <Input
                id="actualCommission"
                type="number"
                step="0.01"
                min="0"
                value={formData.actualCommission}
                onChange={(e) => setFormData({ ...formData, actualCommission: e.target.value })}
                placeholder="e.g., 1500.00"
                required
              />
            </div>

            {/* Expandable Breakdown */}
            <div>
              <button
                type="button"
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showBreakdown ? "Hide" : "View"} Detailed Breakdown
              </button>
              
              {showBreakdown && (
                <div className="mt-2 p-4 bg-gray-50 rounded-lg border text-xs text-gray-600">
                  <p className="text-xs text-gray-500 italic mb-3">View Only - Internal Use</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Transaction Savings:</strong><br />
                      Debit (60%): £{savingsData.breakdown.debitSavings?.toFixed(2)}<br />
                      Credit (30%): £{savingsData.breakdown.creditSavings?.toFixed(2)}<br />
                      Corporate (10%): £{savingsData.breakdown.corporateSavings?.toFixed(2)}
                    </div>
                    <div>
                      <strong>Fixed Savings:</strong><br />
                      Platform Fee: £{savingsData.breakdown.platformSavings?.toFixed(2)}<br />
                      Terminal Fee: £{savingsData.breakdown.terminalSavings?.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
              <Textarea
                id="adminNotes"
                value={formData.adminNotes}
                onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                placeholder="Any additional notes for the user..."
                rows={3}
              />
            </div>
          </div>
        )}

        {activeTab === "rates" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Debit Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.debitRate}
                  onChange={(e) => setFormData({ ...formData, debitRate: e.target.value })}
                />
              </div>
              <div>
                <Label>Credit Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.creditRate}
                  onChange={(e) => setFormData({ ...formData, creditRate: e.target.value })}
                />
              </div>
              <div>
                <Label>Corporate Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.corporateRate}
                  onChange={(e) => setFormData({ ...formData, corporateRate: e.target.value })}
                />
              </div>
              <div>
                <Label>International Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.internationalRate}
                  onChange={(e) => setFormData({ ...formData, internationalRate: e.target.value })}
                />
              </div>
              <div>
                <Label>AMEX Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amexRate}
                  onChange={(e) => setFormData({ ...formData, amexRate: e.target.value })}
                />
              </div>
              <div>
                <Label>Secure Transaction Fee (pence)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.secureTransactionFee}
                  onChange={(e) => setFormData({ ...formData, secureTransactionFee: e.target.value })}
                  placeholder="e.g., 1.5"
                />
              </div>
              <div>
                <Label>Platform Fee (£)</Label>
                <Select 
                  value={formData.platformFee} 
                  onValueChange={(value) => setFormData({ ...formData, platformFee: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">£0</SelectItem>
                    <SelectItem value="10">£10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Terminal Fee - Dojo Go (£)</Label>
                <Input
                  type="number"
                  value={formData.terminalFee}
                  onChange={(e) => setFormData({ ...formData, terminalFee: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="fasterSettlement"
                checked={formData.fasterSettlement}
                onChange={(e) => setFormData({ ...formData, fasterSettlement: e.target.checked })}
              />
              <Label htmlFor="fasterSettlement">Faster Settlement (+£10/month)</Label>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Updating..." : "Update Commission"}
          </Button>
          <Button type="button" variant="outline" className="flex-1">
            Send Quote to Client
          </Button>
        </div>
      </form>
    </div>
  );
}

function UserEditForm({ user, onSave }: { user: any; onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    profession: user.profession || "",
    company: user.company || "",
    isAdmin: user.isAdmin || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="profession">Profession</Label>
          <Input
            id="profession"
            value={formData.profession}
            onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isAdmin"
          checked={formData.isAdmin}
          onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
        />
        <Label htmlFor="isAdmin">Admin Access</Label>
      </div>
      
      <Button type="submit" className="w-full">Save Changes</Button>
    </form>
  );
}

function QuoteForm({ referral, onSend }: { referral: any; onSend: (quoteData: any) => void }) {
  const [formData, setFormData] = useState({
    debitCardRate: "",
    creditCardRate: "",
    corporateCardRate: "",
    securityFee: "",
    platformFee: "",
    terminalCost: "",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="debitCardRate">Debit Card Rate (%)</Label>
          <Input
            id="debitCardRate"
            placeholder="e.g., 0.15"
            value={formData.debitCardRate}
            onChange={(e) => setFormData({ ...formData, debitCardRate: e.target.value })}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="creditCardRate">Credit Card Rate (%)</Label>
          <Input
            id="creditCardRate"
            placeholder="e.g., 0.95"
            value={formData.creditCardRate}
            onChange={(e) => setFormData({ ...formData, creditCardRate: e.target.value })}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="corporateCardRate">Corporate Card Rate (%)</Label>
          <Input
            id="corporateCardRate"
            placeholder="e.g., 1.25"
            value={formData.corporateCardRate}
            onChange={(e) => setFormData({ ...formData, corporateCardRate: e.target.value })}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="securityFee">Security Fee (£)</Label>
          <Input
            id="securityFee"
            placeholder="e.g., 9.95"
            value={formData.securityFee}
            onChange={(e) => setFormData({ ...formData, securityFee: e.target.value })}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="platformFee">Platform Fee (£)</Label>
          <Input
            id="platformFee"
            placeholder="e.g., 15.00"
            value={formData.platformFee}
            onChange={(e) => setFormData({ ...formData, platformFee: e.target.value })}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="terminalCost">Terminal Cost (£)</Label>
          <Input
            id="terminalCost"
            placeholder="e.g., 25.00"
            value={formData.terminalCost}
            onChange={(e) => setFormData({ ...formData, terminalCost: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any additional information or special terms..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>
      
      <Button type="submit" className="w-full">Send Quote to Customer</Button>
    </form>
  );
}

function ReferralDetailsView({ referral, onUpdate }: { referral: any; onUpdate: (data: any) => void }) {
  const [formData, setFormData] = useState({
    status: referral.status,
    estimatedCommission: referral.estimatedCommission || "",
    actualCommission: referral.actualCommission || "",
    adminNotes: referral.adminNotes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Business Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Business Name</Label>
          <p className="text-sm text-muted-foreground">{referral.businessName}</p>
        </div>
        <div>
          <Label>Business Email</Label>
          <p className="text-sm text-muted-foreground">{referral.businessEmail}</p>
        </div>
        <div>
          <Label>Business Phone</Label>
          <p className="text-sm text-muted-foreground">{referral.businessPhone || "Not provided"}</p>
        </div>
        <div>
          <Label>Monthly Volume</Label>
          <p className="text-sm text-muted-foreground">£{referral.monthlyVolume || "Not specified"}</p>
        </div>
      </div>
      
      {referral.businessAddress && (
        <div>
          <Label>Business Address</Label>
          <p className="text-sm text-muted-foreground">{referral.businessAddress}</p>
        </div>
      )}
      
      {referral.notes && (
        <div>
          <Label>Referrer Notes</Label>
          <p className="text-sm text-muted-foreground">{referral.notes}</p>
        </div>
      )}

      {/* Admin Update Form */}
      <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
        <h4 className="font-semibold">Admin Actions</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="estimatedCommission">Estimated Commission (£)</Label>
            <Input
              id="estimatedCommission"
              type="number"
              step="0.01"
              value={formData.estimatedCommission}
              onChange={(e) => setFormData({ ...formData, estimatedCommission: e.target.value })}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="actualCommission">Actual Commission (£)</Label>
          <Input
            id="actualCommission"
            type="number"
            step="0.01"
            value={formData.actualCommission}
            onChange={(e) => setFormData({ ...formData, actualCommission: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="adminNotes">Admin Notes</Label>
          <Textarea
            id="adminNotes"
            rows={3}
            value={formData.adminNotes}
            onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
            placeholder="Internal notes about this referral..."
          />
        </div>
        
        <Button type="submit" className="w-full">Update Referral</Button>
      </form>
    </div>
  );
}