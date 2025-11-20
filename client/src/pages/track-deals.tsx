import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Search,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle,
  Eye,
  Building,
  Calendar,
  PoundSterling,
  ArrowLeft,
  FileText,
  Mail,
  Phone,
  Banknote,
  FileCheck,
  FileUp,
  CreditCard,
  XCircle,
  AlertCircle
} from "lucide-react";
import Navigation from "@/components/navigation";
import SideNavigation from "@/components/side-navigation";
import ProgressTracker from "@/components/progress-tracker";
import { Link } from "wouter";
import { format } from "date-fns";

// Define pipeline stages for user view
const PIPELINE_STAGES = [
  {
    id: "quote_request_received",
    label: "Quote Requested",
    description: "Your deals? is being reviewed",
    icon: FileText,
    color: "bg-blue-50 border-blue-200",
    badgeColor: "bg-blue-500",
  },
  {
    id: "quote_sent",
    label: "Quote Received",
    description: "Quote has been prepared",
    icon: Mail,
    color: "bg-purple-50 border-purple-200",
    badgeColor: "bg-purple-500",
  },
  {
    id: "quote_approved",
    label: "Quote Approved - Awaiting Sign Up Form",
    description: "Client is ready to proceed",
    icon: CheckCircle,
    color: "bg-green-50 border-green-200",
    badgeColor: "bg-green-500",
  },
  {
    id: "agreement_sent",
    label: "Agreement Sent (Docs Out) - Awaiting Signature",
    description: "Contract sent to client",
    icon: FileCheck,
    color: "bg-yellow-50 border-yellow-200",
    badgeColor: "bg-yellow-500",
  },
  {
    id: "signed_awaiting_docs",
    label: "Documents Required",
    description: "Waiting for additional documents",
    icon: FileUp,
    color: "bg-orange-50 border-orange-200",
    badgeColor: "bg-orange-500",
  },
  {
    id: "approved",
    label: "Approved",
    description: "Everything approved",
    icon: CheckCircle,
    color: "bg-teal-50 border-teal-200",
    badgeColor: "bg-teal-500",
  },
  {
    id: "live_confirm_ltr",
    label: "Live (Confirm Invoice)",
    description: "Deal is live",
    icon: CreditCard,
    color: "bg-indigo-50 border-indigo-200",
    badgeColor: "bg-indigo-500",
  },
  {
    id: "declined",
    label: "Declined",
    description: "Deal did not proceed",
    icon: XCircle,
    color: "bg-gray-50 border-gray-200",
    badgeColor: "bg-gray-500",
  },
];

interface Referral {
  id: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string | null;
  dealStage: string;
  submittedAt: string;
  estimatedCommission: string | null;
  monthlyVolume: string | null;
  currentProcessor: string | null;
  status: string;
  billUploads?: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
  }>;
}

// Track deals? page - Last updated: 2025-11-12
export default function TrackReferrals() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [showProgressTracker, setShowProgressTracker] = useState(false);

  const { data: deals?, isLoading: deals?Loading } = useQuery({
    queryKey: ["/api/deals"],
    enabled: isAuthenticated,
    retry: false,
  });

  const deals?List = Array.isArray(deals?) ? deals? : [];

  const filteredReferrals = deals?List.filter((deals?: any) => {
    const matchesSearch = deals?.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deals?.businessEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Group deals? by deal stage
  const deals?ByStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.id] = filteredReferrals.filter((deals?: any) => deals?.dealStage === stage.id);
    return acc;
  }, {} as Record<string, Referral[]>);

  const handleViewProgress = (deals?: any) => {
    setSelectedReferral(deals?);
    setShowProgressTracker(true);
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to view your deals?.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SideNavigation />
      <div className="lg:ml-16">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section with Gradient Background */}
        <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-2">Track Your Referrals</h1>
                  <p className="text-white/90 text-lg md:text-xl">Monitor progress and watch your commissions grow</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Deals</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{deals?List.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-blue-600 mt-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                All time
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">In Progress</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {deals?List.filter((r: any) => !['live_confirm_ltr', 'declined'].includes(r.dealStage)).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <p className="text-sm text-orange-600 mt-3">
                Active deals
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Live Deals</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {deals?List.filter((r: any) => r.dealStage === 'live_confirm_ltr').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-green-600 mt-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                Successfully live
              </p>
            </CardContent>
          </Card>

        </div>

        {/* Search */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search by business name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    data-testid="input-search-deals?"
                  />
                </div>
              </div>
              {searchTerm && (
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  className="h-12 px-6 border-gray-200 hover:bg-gray-50"
                  data-testid="button-clear-search"
                >
                  Clear Search
                </Button>
              )}
            </div>
            {searchTerm && (
              <div className="mt-4 text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
                Showing <span className="font-semibold">{filteredReferrals.length}</span> of <span className="font-semibold">{deals?List.length}</span> deals?
                {searchTerm && (
                  <span> matching "<span className="font-medium text-blue-600">{searchTerm}</span>"</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pipeline Accordion */}
        {deals?Loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredReferrals.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-0">
              <div className="text-center py-16 px-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Building className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No deals? found</h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                  {searchTerm 
                    ? "Try adjusting your search criteria to find what you're looking for"
                    : "Ready to start earning? Submit your first deals? and begin building your commission income"
                  }
                </p>
                {!searchTerm && (
                  <Link href="/submit-deals?">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg">
                      Submit Your First Deal
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="multiple" className="w-full space-y-3">
            {PIPELINE_STAGES.map((stage) => {
              const stageReferrals = deals?ByStage[stage.id] || [];
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
                        {stageReferrals.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    {stageReferrals.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No deals? in this stage</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {stageReferrals.map((deals?: any) => (
                          <Card key={deals?.id} className="border-2 hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                              <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="text-xl font-bold text-gray-900">{deals?.businessName}</h4>
                                  </div>
                                </div>

                                {/* Deal Details */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">{deals?.businessEmail}</span>
                                  </div>
                                  {deals?.businessPhone && (
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-4 w-4 text-gray-400" />
                                      <span className="text-gray-600">{deals?.businessPhone}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">
                                      {format(new Date(deals?.submittedAt), "MMM dd, yyyy")}
                                    </span>
                                  </div>
                                  {deals?.monthlyVolume && (
                                    <div className="flex items-center gap-2">
                                      <Banknote className="h-4 w-4 text-gray-400" />
                                      <span className="text-gray-600">Vol: {deals?.monthlyVolume}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewProgress(deals?)}
                                    data-testid={`button-view-details-${deals?.id}`}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Button>
                                  {['quote_sent', 'quote_approved'].includes(stage.id) && (
                                    <Link href={`/quotes?dealId=${deals?.id}`}>
                                      <Button
                                        size="sm"
                                        data-testid={`button-view-quote-${deals?.id}`}
                                      >
                                        <FileText className="h-4 w-4 mr-2" />
                                        View Quote
                                      </Button>
                                    </Link>
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
        )}
        </div>
      </div>

      {/* Progress Tracker Modal */}
      {selectedReferral && (
        <ProgressTracker
          isOpen={showProgressTracker}
          onClose={() => {
            setShowProgressTracker(false);
            setSelectedReferral(null);
          }}
          deals?={selectedReferral}
        />
      )}
    </div>
  );
}