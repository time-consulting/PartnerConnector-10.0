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
  ArrowLeft,
  FileText
} from "lucide-react";
import Navigation from "@/components/navigation";
import SideNavigation from "@/components/side-navigation";
import ProgressTracker from "@/components/progress-tracker";
import { Link, useLocation } from "wouter";

export default function TrackReferrals() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
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
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Referrals</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{Array.isArray(referrals) ? referrals.length : 0}</p>
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
                    {filteredReferrals.filter((r: any) => !['paid', 'rejected'].includes(r.status)).length}
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
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Completed</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {filteredReferrals.filter((r: any) => r.status === 'paid').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-green-600 mt-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                Success rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Earned</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    £{filteredReferrals
                      .filter((r: any) => r.status === 'paid')
                      .reduce((sum: number, r: any) => sum + (parseFloat(r.estimatedCommission) || 0), 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <PoundSterling className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-purple-600 mt-3">
                Commission earned
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search by business name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    data-testid="input-search-referrals"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 min-w-fit">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 h-12 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
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
                  className="h-12 px-6 border-gray-200 hover:bg-gray-50"
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              )}
            </div>
            {(searchTerm || statusFilter !== 'all') && (
              <div className="mt-4 text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
                Showing <span className="font-semibold">{filteredReferrals.length}</span> of <span className="font-semibold">{Array.isArray(referrals) ? referrals.length : 0}</span> referrals
                {searchTerm && (
                  <span> matching "<span className="font-medium text-blue-600">{searchTerm}</span>"</span>
                )}
                {statusFilter !== 'all' && (
                  <span> with status "<span className="font-medium text-blue-600">{statusFilter.replace('_', ' ').toUpperCase()}</span>"</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referrals List */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Building className="w-6 h-6 text-blue-600" />
              Your Referrals
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {referralsLoading ? (
              <div className="space-y-4 p-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse border rounded-xl p-6">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-48"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredReferrals.length > 0 ? (
              <div className="space-y-1">
                {filteredReferrals.map((referral: any, index: number) => (
                  <div
                    key={referral.id}
                    className={`p-6 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer border-l-4 ${
                      referral.status === 'paid' ? 'border-l-green-500 bg-green-50/30' :
                      referral.status === 'processing' ? 'border-l-orange-500 bg-orange-50/30' :
                      referral.status === 'submitted' ? 'border-l-blue-500 bg-blue-50/30' :
                      'border-l-gray-300'
                    } ${index !== filteredReferrals.length - 1 ? 'border-b border-gray-100' : ''}`}
                    onClick={() => handleViewProgress(referral)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-xl text-gray-900">{referral.businessName}</h3>
                          <Badge className={`${getStatusColor(referral.status)} border-0 font-medium px-3 py-1`}>
                            {referral.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-base mb-3">{referral.businessEmail}</p>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1">
                            <Calendar className="w-4 h-4" />
                            Submitted {new Date(referral.submittedAt).toLocaleDateString()}
                          </span>
                          {referral.estimatedCommission && (
                            <span className="flex items-center gap-2 bg-green-100 text-green-700 rounded-lg px-3 py-1 font-medium">
                              <PoundSterling className="w-4 h-4" />
                              £{referral.estimatedCommission} Commission
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {['quote_sent', 'quote_approved'].includes(referral.status) && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLocation('/quotes');
                            }}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            data-testid={`button-view-quote-${referral.id}`}
                          >
                            <FileText className="w-4 h-4" />
                            View Quote
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProgress(referral);
                          }}
                          className="flex items-center gap-2 bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-700 hover:text-blue-700"
                          data-testid={`button-view-details-${referral.id}`}
                        >
                          <Eye className="w-4 h-4" />
                          View Details
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
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No referrals found</h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                  {searchTerm || statusFilter !== 'all' 
                    ? "Try adjusting your search or filter criteria to find what you're looking for"
                    : "Ready to start earning? Submit your first referral and begin building your commission income"
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Link href="/submit-referral">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg">
                      Submit Your First Referral
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
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
          referral={selectedReferral}
        />
      )}
    </div>
  );
}