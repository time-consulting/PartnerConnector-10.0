import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SideNavigation from "@/components/side-navigation";
import Navigation from "@/components/navigation";
import MlmVisualization from "@/components/mlm-visualization";
import {
  Search,
  Filter,
  Eye,
  Edit,
  FileText,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Building,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Settings,
  Download,
  Upload,
  Users,
  TrendingUp,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Plus,
  Trash2,
  ExternalLink,
  Shield,
  Bell,
  Home,
  Database,
  FileBarChart
} from "lucide-react";

// Quote form schema
const quoteFormSchema = z.object({
  totalAmount: z.string().min(1, "Amount is required"),
  cardRate: z.string().min(1, "Card rate is required"),
  businessFundingRate: z.string().optional(),
  adminNotes: z.string().optional(),
  validUntil: z.string().optional(),
});

// Document requirements schema
const documentRequirementsSchema = z.object({
  requiredDocuments: z.array(z.string()).min(1, "At least one document is required"),
  notes: z.string().optional(),
});

// Stage form schema
const stageFormSchema = z.object({
  stage: z.string().min(1, "Stage is required"),
  notes: z.string().optional(),
});

// Stage override schema
const stageOverrideSchema = z.object({
  dealStage: z.string().min(1, "Stage is required"),
  status: z.string().optional(),
  overrideReason: z.string().min(1, "Override reason is required"),
  adminNotes: z.string().optional(),
});

// Confirm payment schema
const confirmPaymentSchema = z.object({
  actualCommission: z.string().min(1, "Commission amount is required"),
  paymentReference: z.string().min(1, "Payment reference is required"),
  paymentMethod: z.string().optional(),
  paymentNotes: z.string().optional(),
});

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showStageOverrideModal, setShowStageOverrideModal] = useState(false);
  const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedReferrals, setSelectedReferrals] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [seedingTestData, setSeedingTestData] = useState(false);

  // Check if user is admin
  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!(user as any)?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <SideNavigation />
        <div className="lg:ml-16">
          <Navigation />
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 text-lg">You don't have admin privileges to access this area.</p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch admin referrals
  const { data: referralsData, isLoading: referralsLoading } = useQuery<{
    referrals: any[];
    total: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>({
    queryKey: ['/api/admin/referrals', { search: searchTerm, status: statusFilter, page: currentPage }],
    enabled: !!(user as any)?.isAdmin,
  });

  // Fetch admin users
  const { data: users, isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/users'],
    enabled: !!(user as any)?.isAdmin,
  });

  // Fetch admin stats
  const { data: adminStats, isLoading: statsLoading } = useQuery<{
    totalUsers: number;
    totalReferrals: number;
    pendingReferrals: number;
    totalCommissions: number;
    recentActivity: any[];
    conversionRate: number;
    monthlyGrowth: number;
  }>({
    queryKey: ['/api/admin/stats'],
    enabled: !!(user as any)?.isAdmin,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Quote form
  const quoteForm = useForm<z.infer<typeof quoteFormSchema>>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      totalAmount: "",
      cardRate: "1.5",
      businessFundingRate: "",
      adminNotes: "",
      validUntil: "",
    },
  });

  // Document requirements form
  const documentForm = useForm<z.infer<typeof documentRequirementsSchema>>({
    resolver: zodResolver(documentRequirementsSchema),
    defaultValues: {
      requiredDocuments: [],
      notes: "",
    },
  });

  // Stage form
  const stageForm = useForm<z.infer<typeof stageFormSchema>>({
    resolver: zodResolver(stageFormSchema),
    defaultValues: {
      stage: "",
      notes: "",
    },
  });

  // Stage override form
  const stageOverrideForm = useForm<z.infer<typeof stageOverrideSchema>>({
    resolver: zodResolver(stageOverrideSchema),
    defaultValues: {
      dealStage: "",
      status: "",
      overrideReason: "",
      adminNotes: "",
    },
  });

  // Confirm payment form
  const confirmPaymentForm = useForm<z.infer<typeof confirmPaymentSchema>>({
    resolver: zodResolver(confirmPaymentSchema),
    defaultValues: {
      actualCommission: "",
      paymentReference: "",
      paymentMethod: "Bank Transfer",
      paymentNotes: "",
    },
  });

  // Send quote mutation
  const sendQuoteMutation = useMutation({
    mutationFn: async (data: { referralId: string; quoteData: any }) => {
      const response = await fetch(`/api/admin/referrals/${data.referralId}/send-quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.quoteData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/referrals'] });
      setShowQuoteModal(false);
      quoteForm.reset();
    },
  });

  // Update document requirements mutation
  const updateDocumentsMutation = useMutation({
    mutationFn: async (data: { referralId: string; documentsData: any }) => {
      const response = await fetch(`/api/admin/referrals/${data.referralId}/document-requirements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.documentsData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/referrals'] });
      setShowDocumentsModal(false);
      documentForm.reset();
    },
  });

  // Update stage mutation
  const updateStageMutation = useMutation({
    mutationFn: async (data: { referralId: string; stageData: z.infer<typeof stageFormSchema> }) => {
      const response = await fetch(`/api/admin/referrals/${data.referralId}/update-stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.stageData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/referrals'] });
      setShowStageModal(false);
      stageForm.reset();
    },
  });

  // Stage override mutation
  const stageOverrideMutation = useMutation({
    mutationFn: async (data: { referralId: string; overrideData: any }) => {
      const response = await fetch(`/api/admin/referrals/${data.referralId}/override-stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.overrideData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/referrals'] });
      setShowStageOverrideModal(false);
      stageOverrideForm.reset();
    },
  });

  // Confirm payment mutation
  const confirmPaymentMutation = useMutation({
    mutationFn: async (data: { referralId: string; paymentData: any }) => {
      const response = await fetch(`/api/admin/referrals/${data.referralId}/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.paymentData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/referrals'] });
      setShowConfirmPaymentModal(false);
      confirmPaymentForm.reset();
    },
  });

  // Seed test data mutation
  const seedTestDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/seed-test-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/referrals'] });
      setSeedingTestData(false);
    },
    onError: () => {
      setSeedingTestData(false);
    },
  });

  // Docs out confirmation mutation
  const docsOutMutation = useMutation({
    mutationFn: async (referralId: string) => {
      const response = await fetch(`/api/admin/referrals/${referralId}/docs-out-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentsSent: ['agreement', 'terms'],
          recipientEmail: selectedReferral?.businessEmail || '',
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/referrals'] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'quote_sent': return 'bg-blue-100 text-blue-800';
      case 'quote_approved': return 'bg-green-100 text-green-800';
      case 'docs_out_confirmation': return 'bg-orange-100 text-orange-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const availableDocuments = [
    'identification',
    'proof_of_bank',
    'business_registration',
    'vat_certificate',
    'proof_of_address',
  ];

  const dealStages = [
    { value: 'quote_request_received', label: 'Quote Request Received' },
    { value: 'quote_sent', label: 'Quote Sent' },
    { value: 'quote_approved', label: 'Quote Approved' },
    { value: 'docs_out_confirmation', label: 'Docs Out Confirmation' },
    { value: 'docs_received', label: 'Documents Received' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SideNavigation />
      <div className="lg:ml-16">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-800 relative overflow-hidden mb-8 rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-2">Admin Dashboard</h1>
                  <p className="text-white/90 text-lg md:text-xl">Comprehensive submissions portal and deal management</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    onClick={() => queryClient.invalidateQueries()}
                    data-testid="button-refresh-data"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Data
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <Tabs defaultValue="submissions" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="submissions" data-testid="tab-submissions">
                <FileText className="w-4 h-4 mr-2" />
                Submissions Portal
              </TabsTrigger>
              <TabsTrigger value="users" data-testid="tab-users">
                <Users className="w-4 h-4 mr-2" />
                User Management
              </TabsTrigger>
              <TabsTrigger value="mlm" data-testid="tab-mlm">
                <Target className="w-4 h-4 mr-2" />
                MLM Network
              </TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" data-testid="tab-settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="submissions">
              <div className="space-y-6">
                {/* Search and Filter */}
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <Input
                            placeholder="Search referrals by business name, email, or notes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            data-testid="input-search-admin-referrals"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-48 h-12 border-gray-200" data-testid="select-status-filter">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="submitted">Submitted</SelectItem>
                            <SelectItem value="quote_sent">Quote Sent</SelectItem>
                            <SelectItem value="quote_approved">Quote Approved</SelectItem>
                            <SelectItem value="docs_out_confirmation">Docs Out</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Referrals List */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                    <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <Building className="w-6 h-6 text-blue-600" />
                      Submissions Portal ({referralsData?.total || 0} deals)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {referralsLoading ? (
                      <div className="space-y-4 p-6">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="animate-pulse border-b border-gray-100 p-6">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <div className="h-6 bg-gray-200 rounded w-64"></div>
                                <div className="h-4 bg-gray-200 rounded w-48"></div>
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                              </div>
                              <div className="flex gap-2">
                                <div className="h-8 bg-gray-200 rounded w-20"></div>
                                <div className="h-8 bg-gray-200 rounded w-24"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : referralsData?.referrals && referralsData.referrals.length > 0 ? (
                      <div className="space-y-1">
                        {referralsData.referrals.map((referral: any, index: number) => (
                          <div
                            key={referral.id}
                            className={`p-6 hover:bg-blue-50/50 transition-all duration-200 border-l-4 ${
                              referral.status === 'completed' ? 'border-l-green-500 bg-green-50/30' :
                              referral.status === 'processing' ? 'border-l-orange-500 bg-orange-50/30' :
                              referral.status === 'quote_sent' ? 'border-l-blue-500 bg-blue-50/30' :
                              'border-l-gray-300'
                            } ${index !== (referralsData.referrals?.length || 0) - 1 ? 'border-b border-gray-100' : ''}`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h3 className="font-bold text-xl text-gray-900">{referral.businessName}</h3>
                                  <Badge className={`${getStatusColor(referral.status)} border-0 font-medium px-3 py-1`}>
                                    {referral.status.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm">{referral.businessEmail}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    <span className="text-sm">{referral.businessPhone || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm">
                                      {new Date(referral.submittedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Target className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                      Level {referral.referralLevel || 1} ({referral.commissionPercentage || '60.00'}%)
                                    </span>
                                  </div>
                                </div>

                                {referral.estimatedCommission && (
                                  <div className="flex items-center gap-2 bg-green-100 text-green-700 rounded-lg px-3 py-1 font-medium inline-flex">
                                    <DollarSign className="w-4 h-4" />
                                    £{referral.estimatedCommission} Commission
                                  </div>
                                )}

                                {referral.adminNotes && (
                                  <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                    <p className="text-sm text-gray-700"><strong>Admin Notes:</strong> {referral.adminNotes}</p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-col gap-2 ml-6">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedReferral(referral);
                                    setShowQuoteModal(true);
                                  }}
                                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                  data-testid={`button-send-quote-${referral.id}`}
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  Send Quote
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => docsOutMutation.mutate(referral.id)}
                                  disabled={docsOutMutation.isPending}
                                  className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                                  data-testid={`button-docs-out-${referral.id}`}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Docs Out
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedReferral(referral);
                                    setShowDocumentsModal(true);
                                  }}
                                  className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                                  data-testid={`button-document-requirements-${referral.id}`}
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  Documents
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedReferral(referral);
                                    setShowStageModal(true);
                                  }}
                                  className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                                  data-testid={`button-edit-stage-${referral.id}`}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Stage
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 px-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <Building className="w-10 h-10 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">No submissions found</h3>
                        <p className="text-gray-600 text-lg">
                          {searchTerm || statusFilter !== 'all' 
                            ? "Try adjusting your search or filter criteria"
                            : "No referral submissions have been made yet"
                          }
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Pagination */}
                {referralsData?.pagination && referralsData.pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      data-testid="button-previous-page"
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 py-2 text-sm text-gray-600">
                      Page {currentPage} of {referralsData.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === referralsData.pagination.totalPages}
                      data-testid="button-next-page"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-blue-600" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse border rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-48"></div>
                              <div className="h-3 bg-gray-200 rounded w-32"></div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded w-20"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users?.map((user: any) => (
                        <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <p className="text-xs text-gray-500">
                                Partner ID: {user.partnerId || 'Not assigned'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {user.isAdmin && (
                                <Badge className="bg-red-100 text-red-800">Admin</Badge>
                              )}
                              <Badge className="bg-blue-100 text-blue-800">
                                Level {user.partnerLevel || 1}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mlm">
              <MlmVisualization userId={(user as any)?.id} showFullTree={true} />
            </TabsContent>

            <TabsContent value="analytics">
              <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Total Users</p>
                          <p className="text-3xl font-bold text-blue-900">{adminStats?.totalUsers || 0}</p>
                          <p className="text-xs text-blue-600 mt-1">Active partners</p>
                        </div>
                        <Users className="w-10 h-10 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Total Referrals</p>
                          <p className="text-3xl font-bold text-green-900">{adminStats?.totalReferrals || 0}</p>
                          <p className="text-xs text-green-600 mt-1">All time deals</p>
                        </div>
                        <FileBarChart className="w-10 h-10 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">Total Commissions</p>
                          <p className="text-3xl font-bold text-purple-900">£{adminStats?.totalCommissions?.toFixed(2) || '0.00'}</p>
                          <p className="text-xs text-purple-600 mt-1">Lifetime earnings</p>
                        </div>
                        <DollarSign className="w-10 h-10 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-600">Conversion Rate</p>
                          <p className="text-3xl font-bold text-orange-900">{adminStats?.conversionRate || 0}%</p>
                          <p className="text-xs text-orange-600 mt-1">Quote to deal</p>
                        </div>
                        <TrendingUp className="w-10 h-10 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Commission Structure Display */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Target className="w-6 h-6 text-blue-600" />
                      MLM Commission Structure
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h3 className="font-bold text-green-900 mb-2">Direct Sales (L1)</h3>
                        <p className="text-3xl font-bold text-green-700">60%</p>
                        <p className="text-sm text-green-600 mt-1">Commission on direct referrals</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="font-bold text-blue-900 mb-2">Level 2 Team</h3>
                        <p className="text-3xl font-bold text-blue-700">20%</p>
                        <p className="text-sm text-blue-600 mt-1">Override on team sales</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h3 className="font-bold text-purple-900 mb-2">Extended Network (L3)</h3>
                        <p className="text-3xl font-bold text-purple-700">10%</p>
                        <p className="text-sm text-purple-600 mt-1">Network override commission</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Activity className="w-6 h-6 text-blue-600" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {adminStats?.recentActivity?.length > 0 ? (
                      <div className="space-y-3">
                        {adminStats.recentActivity.map((activity: any, index: number) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{activity.description}</p>
                              <p className="text-xs text-gray-500">{activity.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No recent activity</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="space-y-6">
                {/* Export Data Section */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Database className="w-6 h-6 text-blue-600" />
                      Data Export
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center gap-2"
                        onClick={async () => {
                          const response = await fetch('/api/admin/export/users');
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
                          a.click();
                        }}
                        data-testid="button-export-users"
                      >
                        <Users className="w-6 h-6" />
                        <span>Export Users CSV</span>
                      </Button>

                      <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center gap-2"
                        onClick={async () => {
                          const response = await fetch('/api/admin/export/referrals');
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `referrals-export-${new Date().toISOString().split('T')[0]}.csv`;
                          a.click();
                        }}
                        data-testid="button-export-referrals"
                      >
                        <FileText className="w-6 h-6" />
                        <span>Export Referrals CSV</span>
                      </Button>

                      <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center gap-2"
                        onClick={async () => {
                          const response = await fetch('/api/admin/export/payments');
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `payments-export-${new Date().toISOString().split('T')[0]}.csv`;
                          a.click();
                        }}
                        data-testid="button-export-payments"
                      >
                        <DollarSign className="w-6 h-6" />
                        <span>Export Payments CSV</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* System Settings */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Settings className="w-6 h-6 text-blue-600" />
                      System Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium">Seed Test Data</h3>
                        <p className="text-sm text-gray-600">Generate sample referrals for testing</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSeedingTestData(true);
                          seedTestDataMutation.mutate();
                        }}
                        disabled={seedingTestData}
                        data-testid="button-seed-data"
                      >
                        {seedingTestData ? 'Seeding...' : 'Seed Data'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium">Stripe Integration</h3>
                        <p className="text-sm text-gray-600">Payment processing for commissions</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium">Go High Level Integration</h3>
                        <p className="text-sm text-gray-600">CRM synchronization</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Pending Setup</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Admin Actions */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-blue-600" />
                      Admin Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => {
                        queryClient.invalidateQueries();
                        setRefreshing(true);
                        setTimeout(() => setRefreshing(false), 1000);
                      }}
                      disabled={refreshing}
                      data-testid="button-refresh-all"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      {refreshing ? 'Refreshing...' : 'Refresh All Data'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

          </Tabs>
        </div>

        {/* Quote Modal */}
        <Dialog open={showQuoteModal} onOpenChange={setShowQuoteModal}>
          <DialogContent className="sm:max-w-[600px]" data-testid="modal-send-quote">
            <DialogHeader>
              <DialogTitle>Send Quote - {selectedReferral?.businessName}</DialogTitle>
            </DialogHeader>
            <Form {...quoteForm}>
              <form onSubmit={quoteForm.handleSubmit((data) => {
                sendQuoteMutation.mutate({
                  referralId: selectedReferral.id,
                  quoteData: data
                });
              })} className="space-y-4">
                <FormField
                  control={quoteForm.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Quote Amount (£)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 1500" data-testid="input-quote-amount" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={quoteForm.control}
                  name="cardRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Processing Rate (%)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="1.5" data-testid="input-card-rate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={quoteForm.control}
                  name="businessFundingRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Funding Rate (%) - Optional</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="5.9" data-testid="input-funding-rate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={quoteForm.control}
                  name="adminNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Internal notes about this quote..."
                          data-testid="textarea-admin-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowQuoteModal(false)}
                    data-testid="button-cancel-quote"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={sendQuoteMutation.isPending}
                    data-testid="button-send-quote"
                  >
                    {sendQuoteMutation.isPending ? 'Sending...' : 'Send Quote'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Document Requirements Modal */}
        <Dialog open={showDocumentsModal} onOpenChange={setShowDocumentsModal}>
          <DialogContent className="sm:max-w-[500px]" data-testid="modal-document-requirements">
            <DialogHeader>
              <DialogTitle>Document Requirements - {selectedReferral?.businessName}</DialogTitle>
            </DialogHeader>
            <Form {...documentForm}>
              <form onSubmit={documentForm.handleSubmit((data) => {
                updateDocumentsMutation.mutate({
                  referralId: selectedReferral.id,
                  documentsData: data
                });
              })} className="space-y-4">
                <FormField
                  control={documentForm.control}
                  name="requiredDocuments"
                  render={() => (
                    <FormItem>
                      <FormLabel>Required Documents</FormLabel>
                      <div className="space-y-2">
                        {availableDocuments.map((doc) => (
                          <FormField
                            key={doc}
                            control={documentForm.control}
                            name="requiredDocuments"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={doc}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(doc)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, doc])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== doc
                                              )
                                            )
                                      }}
                                      data-testid={`checkbox-document-${doc}`}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal capitalize">
                                    {doc.replace('_', ' ')}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={documentForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Any additional document requirements or notes..."
                          data-testid="textarea-document-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowDocumentsModal(false)}
                    data-testid="button-cancel-documents"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateDocumentsMutation.isPending}
                    data-testid="button-update-documents"
                  >
                    {updateDocumentsMutation.isPending ? 'Updating...' : 'Update Requirements'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Stage Update Modal */}
        <Dialog open={showStageModal} onOpenChange={setShowStageModal}>
          <DialogContent className="sm:max-w-[500px]" data-testid="modal-edit-stage">
            <DialogHeader>
              <DialogTitle>Edit Deal Stage - {selectedReferral?.businessName}</DialogTitle>
            </DialogHeader>
            <Form {...stageForm}>
              <form onSubmit={stageForm.handleSubmit((data) => {
                updateStageMutation.mutate({
                  referralId: selectedReferral.id,
                  stageData: data
                });
              })} className="space-y-4">
                <FormField
                  control={stageForm.control}
                  name="stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal Stage</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-deal-stage">
                            <SelectValue placeholder="Select a stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dealStages.map((stage) => (
                            <SelectItem key={stage.value} value={stage.value}>
                              {stage.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={stageForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stage Change Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Reason for stage change or additional notes..."
                          data-testid="textarea-stage-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowStageModal(false)}
                    data-testid="button-cancel-stage"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateStageMutation.isPending}
                    data-testid="button-update-stage"
                  >
                    {updateStageMutation.isPending ? 'Updating...' : 'Update Stage'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}