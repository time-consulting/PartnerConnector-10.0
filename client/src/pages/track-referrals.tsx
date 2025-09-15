import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  ArrowLeft
} from "lucide-react";
import Navigation from "@/components/navigation";
import ProgressTracker from "@/components/progress-tracker";
import { Link } from "wouter";

export default function TrackReferrals() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [showProgressTracker, setShowProgressTracker] = useState(false);

  const { data: referrals, isLoading: referralsLoading } = useQuery({
    queryKey: ["/api/referrals"],
    enabled: isAuthenticated,
    retry: false,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'quote_sent': return 'bg-purple-100 text-purple-800';
      case 'quote_approved': return 'bg-green-100 text-green-800';
      case 'contract_review': return 'bg-indigo-100 text-indigo-800';
      case 'processing': return 'bg-orange-100 text-orange-800';
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusProgress = (status: string): number => {
    const statusMap: { [key: string]: number } = {
      'submitted': 15,
      'in_review': 30,
      'quote_sent': 50,
      'quote_approved': 70,
      'processing': 85,
      'approved': 95,
      'paid': 100
    };
    return statusMap[status] || 0;
  };

  const filteredReferrals = Array.isArray(referrals) ? referrals.filter((referral: any) => {
    const matchesSearch = referral.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         referral.businessEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || referral.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const handleViewProgress = (referral: any) => {
    setSelectedReferral(referral);
    setShowProgressTracker(true);
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to view your referrals.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Track Referrals</h1>
              <p className="text-muted-foreground">Monitor the progress of all your submitted referrals</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                  <p className="text-2xl font-bold">{filteredReferrals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">
                    {filteredReferrals.filter((r: any) => !['paid', 'rejected'].includes(r.status)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">
                    {filteredReferrals.filter((r: any) => r.status === 'paid').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <PoundSterling className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Commissions</p>
                  <p className="text-2xl font-bold">
                    £{filteredReferrals
                      .filter((r: any) => r.status === 'paid')
                      .reduce((sum: number, r: any) => sum + (parseFloat(r.estimatedCommission) || 0), 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by business name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11"
                    data-testid="input-search-referrals"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 min-w-fit">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 h-11 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  data-testid="select-status-filter"
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="in_review">Under Review</option>
                  <option value="quote_sent">Quote Sent</option>
                  <option value="quote_approved">Quote Approved</option>
                  <option value="contract_review">Contract Review</option>
                  <option value="processing">Processing</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              {(searchTerm || statusFilter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="h-11 px-4"
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              )}
            </div>
            {(searchTerm || statusFilter !== 'all') && (
              <div className="mt-4 text-sm text-muted-foreground">
                Showing {filteredReferrals.length} of {Array.isArray(referrals) ? referrals.length : 0} referrals
                {searchTerm && (
                  <span> matching "{searchTerm}"</span>
                )}
                {statusFilter !== 'all' && (
                  <span> with status "{statusFilter.replace('_', ' ').toUpperCase()}"</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referrals List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            {referralsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-48"></div>
                        <div className="h-3 bg-muted rounded w-32"></div>
                      </div>
                      <div className="h-6 bg-muted rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredReferrals.length > 0 ? (
              <div className="space-y-4">
                {filteredReferrals.map((referral: any) => (
                  <div
                    key={referral.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{referral.businessName}</h3>
                        <p className="text-muted-foreground text-sm">{referral.businessEmail}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(referral.submittedAt).toLocaleDateString()}
                          </span>
                          {referral.estimatedCommission && (
                            <span className="flex items-center gap-1">
                              <PoundSterling className="w-3 h-3" />
                              £{referral.estimatedCommission}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(referral.status)}>
                          {referral.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProgress(referral)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Progress
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{getStatusProgress(referral.status)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getStatusProgress(referral.status)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No referrals found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? "Try adjusting your search or filter criteria"
                    : "You haven't submitted any referrals yet"
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Link href="/submit-referral">
                    <Button>Submit Your First Referral</Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Tracker Modal */}
      {selectedReferral && (
        <ProgressTracker
          isOpen={showProgressTracker}
          onClose={() => {
            setShowProgressTracker(false);
            setSelectedReferral(null);
          }}
          referral={selectedReferral}
        />
      )}
    </div>
  );
}