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
  X
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
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Referral Details: {referral.businessName}</DialogTitle>
                            </DialogHeader>
                            <ReferralDetailsView 
                              referral={referral} 
                              onUpdate={(data) => updateReferralMutation.mutate({ referralId: referral.id, data })} 
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
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