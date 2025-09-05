import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UsersIcon, 
  UserPlusIcon, 
  ShieldCheckIcon, 
  CrownIcon,
  SettingsIcon,
  EyeIcon,
  EyeOffIcon,
  MailIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
  ShareIcon,
  DollarSignIcon,
  TrendingUpIcon,
  GiftIcon,
  StarIcon,
  ArrowRightIcon,
  CopyIcon,
  HeartHandshakeIcon
} from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function TeamManagement() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showCustomerReferralDialog, setShowCustomerReferralDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
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
  }, [isAuthenticated, isLoading, toast]);

  // Customer referral data with realistic commission calculations based on 60% Level 1 rate
  const customerReferrals = [
    {
      id: "1",
      customerName: "Sarah Johnson",
      customerEmail: "sarah@techcorp.com",
      businessName: "TechCorp Solutions",
      referralValue: 25000, // Monthly card processing volume
      commission: 300, // £500 base * 60% = £300 (for £25k volume bracket)
      status: "converted",
      dateReferred: "2024-01-15",
      referredBy: "you"
    },
    {
      id: "2", 
      customerName: "Mike Chen",
      customerEmail: "mike@growthco.com",
      businessName: "GrowthCo Marketing",
      referralValue: 75000, // Business funding amount
      commission: 1350, // £75k * 3% * 60% = £1,350
      status: "in_progress",
      dateReferred: "2024-01-20",
      referredBy: "you"
    },
    {
      id: "3",
      customerName: "Lisa Rodriguez",
      customerEmail: "lisa@innovatetech.com", 
      businessName: "InnovateTech Ltd",
      referralValue: 45000, // Monthly processing volume
      commission: 480, // £800 base * 60% = £480 (for £45k volume bracket)
      status: "pending",
      dateReferred: "2024-01-25",
      referredBy: "you"
    },
    {
      id: "4",
      customerName: "James Wilson",
      customerEmail: "james@wilsonltd.com",
      businessName: "Wilson & Associates",
      referralValue: 120000, // Business funding
      commission: 2160, // £120k * 3% * 60% = £2,160
      status: "converted",
      dateReferred: "2024-01-10",
      referredBy: "you"
    },
    {
      id: "5",
      customerName: "Emma Thompson",
      customerEmail: "emma@creativeco.com",
      businessName: "Creative Solutions Co",
      referralValue: 15000, // Monthly processing
      commission: 120, // £200 base * 60% = £120 (for £15k volume bracket)
      status: "converted",
      dateReferred: "2024-01-05",
      referredBy: "you"
    }
  ];

  // Calculate realistic team stats based on actual referral data
  const teamStats = {
    totalCustomerReferrals: customerReferrals.length,
    totalReferralValue: customerReferrals.reduce((sum, ref) => sum + ref.referralValue, 0),
    totalCommissionEarned: customerReferrals.reduce((sum, ref) => sum + ref.commission, 0),
    averageReferralValue: Math.round(customerReferrals.reduce((sum, ref) => sum + ref.referralValue, 0) / customerReferrals.length),
    averageCommission: Math.round(customerReferrals.reduce((sum, ref) => sum + ref.commission, 0) / customerReferrals.length),
    conversionRate: Math.round((customerReferrals.filter(ref => ref.status === 'converted').length / customerReferrals.length) * 100)
  };

  const customerReferralMutation = useMutation({
    mutationFn: async (data: { customerName: string; customerEmail: string; referralSource: string }) => {
      // Mock API call - would be real in production
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      setShowCustomerReferralDialog(false);
      setCustomerName("");
      setCustomerEmail("");
      setReferralSource("");
      toast({
        title: "Customer Referral Submitted",
        description: "Your customer referral has been submitted and is being processed.",
      });
    },
    onError: (error: any) => {
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
        description: error.message || "Failed to submit customer referral",
        variant: "destructive",
      });
    },
  });

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}?ref=demo`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link Copied",
      description: "Your referral link has been copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Team & Referrals</h1>
          <p className="text-xl text-gray-600">
            Manage your team and empower your customers to refer business for extra commission
          </p>
        </div>

        <Tabs defaultValue="customer-referrals" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customer-referrals" className="flex items-center gap-2" data-testid="tab-customer-referrals">
              <HeartHandshakeIcon className="w-4 h-4" />
              Customer Referrals
            </TabsTrigger>
            <TabsTrigger value="team-management" className="flex items-center gap-2" data-testid="tab-team-management">
              <UsersIcon className="w-4 h-4" />
              Team Management  
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customer-referrals" className="space-y-6">
            {/* Customer Referral Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Referrals</p>
                      <p className="text-3xl font-bold text-blue-700">{teamStats.totalCustomerReferrals}</p>
                    </div>
                    <ShareIcon className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Total Value</p>
                      <p className="text-2xl font-bold text-green-700">£{teamStats.totalReferralValue.toLocaleString()}</p>
                    </div>
                    <TrendingUpIcon className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Commission Earned</p>
                      <p className="text-2xl font-bold text-purple-700">£{teamStats.totalCommissionEarned.toLocaleString()}</p>
                    </div>
                    <DollarSignIcon className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">Avg. Value</p>
                      <p className="text-2xl font-bold text-yellow-700">£{teamStats.averageReferralValue.toLocaleString()}</p>
                    </div>
                    <GiftIcon className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-indigo-600 font-medium">Avg. Commission</p>
                      <p className="text-2xl font-bold text-indigo-700">£{teamStats.averageCommission.toLocaleString()}</p>
                    </div>
                    <DollarSignIcon className="w-8 h-8 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600 font-medium">Conversion Rate</p>
                      <p className="text-3xl font-bold text-red-700">{teamStats.conversionRate}%</p>
                    </div>
                    <StarIcon className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Referral Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HeartHandshakeIcon className="w-5 h-5" />
                    Customer Referral Program
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Empower your existing customers to refer new business and earn additional commission on successful referrals.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Dialog open={showCustomerReferralDialog} onOpenChange={setShowCustomerReferralDialog}>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-refer-customer">
                          <UserPlusIcon className="w-4 h-4 mr-2" />
                          Refer a Customer
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Refer a Customer for Extra Commission</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="customerName">Customer Name</Label>
                            <Input
                              id="customerName"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Enter customer's full name"
                              data-testid="input-customer-name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="customerEmail">Customer Email</Label>
                            <Input
                              id="customerEmail"
                              type="email"
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              placeholder="customer@company.com"
                              data-testid="input-customer-email"
                            />
                          </div>
                          <div>
                            <Label htmlFor="referralSource">How did you connect with this customer?</Label>
                            <Select value={referralSource} onValueChange={setReferralSource}>
                              <SelectTrigger data-testid="select-referral-source">
                                <SelectValue placeholder="Select referral source" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="existing-client">Existing Client</SelectItem>
                                <SelectItem value="networking">Networking Event</SelectItem>
                                <SelectItem value="social-media">Social Media</SelectItem>
                                <SelectItem value="word-of-mouth">Word of Mouth</SelectItem>
                                <SelectItem value="cold-outreach">Cold Outreach</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end space-x-3">
                            <Button
                              variant="outline"
                              onClick={() => setShowCustomerReferralDialog(false)}
                              data-testid="button-cancel-referral"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => customerReferralMutation.mutate({
                                customerName,
                                customerEmail,
                                referralSource
                              })}
                              disabled={!customerName || !customerEmail || !referralSource || customerReferralMutation.isPending}
                              data-testid="button-submit-referral"
                            >
                              {customerReferralMutation.isPending ? "Submitting..." : "Submit Referral"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="outline" 
                      onClick={copyReferralLink}
                      data-testid="button-copy-referral-link"
                    >
                      <CopyIcon className="w-4 h-4 mr-2" />
                      Copy Referral Link
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Commission Structure</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Customer Referrals</span>
                      <span className="font-semibold text-green-700">5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Partner Referrals</span>
                      <span className="font-semibold text-blue-700">7.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Team Bonuses</span>
                      <span className="font-semibold text-purple-700">2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer Referrals List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Customer Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Customer</th>
                        <th className="text-left py-3 px-4 font-medium">Business</th>
                        <th className="text-left py-3 px-4 font-medium">Value</th>
                        <th className="text-left py-3 px-4 font-medium">Commission</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerReferrals.map((referral) => (
                        <tr key={referral.id} className="border-b hover:bg-gray-50" data-testid={`row-customer-referral-${referral.id}`}>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{referral.customerName}</div>
                              <div className="text-sm text-gray-500">{referral.customerEmail}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">{referral.businessName}</td>
                          <td className="py-3 px-4 font-semibold text-gray-900">£{referral.referralValue.toLocaleString()}</td>
                          <td className="py-3 px-4 font-semibold text-green-600">£{referral.commission.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={
                                referral.status === 'converted' ? 'default' : 
                                referral.status === 'in_progress' ? 'secondary' : 
                                'outline'
                              }
                              className={
                                referral.status === 'converted' ? 'bg-green-100 text-green-700' :
                                referral.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }
                            >
                              {referral.status === 'converted' ? 'Converted' :
                               referral.status === 'in_progress' ? 'In Progress' :
                               'Pending'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(referral.dateReferred).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team-management" className="space-y-6">
            {/* Team Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Team Members</p>
                      <p className="text-3xl font-bold text-gray-900">4</p>
                    </div>
                    <UsersIcon className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Invitations</p>
                      <p className="text-3xl font-bold text-gray-900">2</p>
                    </div>
                    <MailIcon className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">£124k</p>
                    </div>
                    <TrendingUpIcon className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Actions */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
                <p className="text-gray-600">Manage your team and invite new members</p>
              </div>
              
              <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-invite-member">
                    <UserPlusIcon className="w-4 h-4 mr-2" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="inviteEmail">Email Address</Label>
                      <Input
                        id="inviteEmail"
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        data-testid="input-invite-email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="inviteRole">Role</Label>
                      <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger data-testid="select-invite-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowInviteDialog(false)}
                        data-testid="button-cancel-invite"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={async () => {
                          try {
                            // Call GHL webhook for team member invite
                            const response = await fetch('/api/webhooks/ghl/team-invite', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                email: inviteEmail,
                                role: inviteRole,
                                invitedBy: (user as any)?.email || 'demo@partnerconnector.com',
                                teamName: 'PartnerConnector Team'
                              })
                            });
                            
                            const result = await response.json();
                            
                            if (result.success) {
                              toast({
                                title: "Invitation Sent",
                                description: "Team invitation has been sent via email automation.",
                              });
                            } else {
                              toast({
                                title: "Invitation Queued", 
                                description: "Team invitation has been queued for processing.",
                                variant: "default",
                              });
                            }
                            
                            setShowInviteDialog(false);
                            setInviteEmail("");
                            setInviteRole("member");
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to send invitation. Please try again.",
                              variant: "destructive",
                            });
                          }
                        }}
                        disabled={!inviteEmail}
                        data-testid="button-send-invite"
                      >
                        Send Invitation
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Team Members Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-6 font-medium">Member</th>
                        <th className="text-left py-3 px-6 font-medium">Role</th>
                        <th className="text-left py-3 px-6 font-medium">Referrals</th>
                        <th className="text-left py-3 px-6 font-medium">Commission</th>
                        <th className="text-left py-3 px-6 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-700 font-medium">JD</span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">John Doe</div>
                              <div className="text-sm text-gray-500">john@company.com</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className="bg-purple-100 text-purple-700">
                            <CrownIcon className="w-3 h-3 mr-1" />
                            Owner
                          </Badge>
                        </td>
                        <td className="py-4 px-6 font-semibold">8</td>
                        <td className="py-4 px-6 font-semibold text-green-600">£4,250</td>
                        <td className="py-4 px-6">
                          <Button variant="ghost" size="sm">
                            <SettingsIcon className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-700 font-medium">SM</span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">Sarah Miller</div>
                              <div className="text-sm text-gray-500">sarah@company.com</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className="bg-blue-100 text-blue-700">
                            <ShieldCheckIcon className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        </td>
                        <td className="py-4 px-6 font-semibold">12</td>
                        <td className="py-4 px-6 font-semibold text-green-600">£6,100</td>
                        <td className="py-4 px-6">
                          <Button variant="ghost" size="sm">
                            <SettingsIcon className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}