import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import SideNavigation from "@/components/side-navigation";
import ReferralForm from "@/components/referral-form";
import BillUpload from "@/components/bill-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircleIcon, ArrowRightIcon, SendIcon, UserIcon, MailIcon, PhoneIcon, BuildingIcon, SearchIcon, PackageIcon } from "lucide-react";

export default function SubmitReferral() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [submittedReferralId, setSubmittedReferralId] = useState<string | null>(null);
  const [showBillUpload, setShowBillUpload] = useState(false);
  const [showMissingInfoDialog, setShowMissingInfoDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [missingInfo, setMissingInfo] = useState({
    businessAddress: "",
    businessTypeId: "",
    currentProcessor: "",
    currentRate: "",
    selectedProducts: [] as string[]
  });

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

  const { data: businessTypes } = useQuery({
    queryKey: ["/api/business-types"],
    enabled: isAuthenticated,
  });

  const { data: products } = useQuery({
    queryKey: ["/api/products"],
    enabled: isAuthenticated,
  });

  const { data: leads } = useQuery({
    queryKey: ["/api/leads"],
    enabled: isAuthenticated,
  });

  // Filter leads based on search
  const filteredLeads = useMemo(() => {
    if (!leads || !Array.isArray(leads)) return [];
    if (!customerSearch.trim()) return leads;
    
    return leads.filter((lead: any) => 
      lead.businessName?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      lead.contactName?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      lead.contactEmail?.toLowerCase().includes(customerSearch.toLowerCase())
    );
  }, [leads, customerSearch]);

  const submitReferralMutation = useMutation({
    mutationFn: async (referralData: any) => {
      const response = await apiRequest("POST", "/api/referrals", referralData);
      return response.json();
    },
    onSuccess: (data) => {
      setSubmittedReferralId(data.id);
      setShowBillUpload(true);
      toast({
        title: "Referral Submitted Successfully!",
        description: "Now you can upload current payment processing bills to help create a better quote.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/referrals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
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
        description: "Failed to submit referral. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMissingInfoSubmit = () => {
    if (!selectedLead) return;
    
    // Get the final selected products (prioritize header selection, then dialog selection)
    const finalSelectedProducts = selectedProduct ? [selectedProduct] : (missingInfo.selectedProducts.length > 0 ? missingInfo.selectedProducts : []);
    
    // Ensure a product is selected
    if (finalSelectedProducts.length === 0) {
      toast({
        title: "Product Required",
        description: "Please select a product type before submitting the referral.",
        variant: "destructive",
      });
      return;
    }
    
    const referralData = {
      businessName: selectedLead.businessName,
      businessEmail: selectedLead.contactEmail || "",
      businessPhone: selectedLead.contactPhone || "",
      businessAddress: missingInfo.businessAddress,
      businessTypeId: missingInfo.businessTypeId,
      currentProcessor: missingInfo.currentProcessor,
      monthlyVolume: selectedLead.estimatedMonthlyVolume || "",
      currentRate: missingInfo.currentRate,
      cardMachineQuantity: 1,
      selectedProducts: finalSelectedProducts,
      notes: selectedLead.notes || "",
      gdprConsent: true,
    };
    
    submitReferralMutation.mutate(referralData);
    setShowMissingInfoDialog(false);
    setSelectedLead(null);
    setMissingInfo({
      businessAddress: "",
      businessTypeId: "",
      currentProcessor: "",
      currentRate: "",
      selectedProducts: []
    });
  };

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  const handleBillUploadComplete = () => {
    setShowBillUpload(false);
    toast({
      title: "Process Complete!",
      description: "Your referral and bills have been submitted. We'll be in touch with a competitive quote soon.",
    });
  };

  const handleSkipBillUpload = () => {
    setShowBillUpload(false);
    toast({
      title: "Referral Submitted",
      description: "Your referral has been submitted successfully. You can upload bills later from the dashboard.",
    });
  };

  if (showBillUpload && submittedReferralId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <SideNavigation />
        <div className="lg:ml-16">
          <Navigation />
        
        {/* Success Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50 py-16">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzMzMzMzMyIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+')] opacity-30"></div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-fadeIn">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-2xl mb-4">
                  <CheckCircleIcon className="w-10 h-10 text-green-600" />
                </div>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                Referral{" "}
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Submitted!
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Great! Your referral is now in our system. Upload current payment processing bills 
                below to help us create the most competitive quote possible.
              </p>
            </div>
          </div>
        </section>

        {/* Bill Upload Section */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="shadow-2xl border-0 bg-gradient-to-b from-white to-gray-50">
              <CardHeader className="pb-8">
                <div className="text-center">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Upload Bills (Optional)</CardTitle>
                  <p className="text-gray-600">
                    Help us create a better quote by sharing current processing bills
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <BillUpload
                  referralId={submittedReferralId}
                  onComplete={handleBillUploadComplete}
                  isOptional={true}
                />
              </CardContent>
            </Card>

            {/* Navigation Options */}
            <div className="mt-8 flex gap-4 justify-center">
              <Button
                variant="outline"
                size="lg"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4"
                onClick={() => window.location.href = '/'}
                data-testid="button-dashboard"
              >
                Return to Dashboard
              </Button>
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4"
                onClick={() => {
                  setSubmittedReferralId(null);
                  setShowBillUpload(false);
                }}
                data-testid="button-submit-another"
              >
                Submit Another Referral
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SideNavigation />
      <div className="lg:ml-16">
        <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-50 py-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzMzMzMzMyIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+')] opacity-30"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fadeIn">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                <SendIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
              Submit New{" "}
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Referral
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              Connect businesses with the right payment solutions and earn commissions.
            </p>
          </div>
        </div>
      </section>


      {/* Form Section */}
      <section className="py-8 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Product Selection Header */}
          <div className="mb-8">
            <Card className="shadow-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <PackageIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Select Product Type</h2>
                </div>
                <p className="text-gray-600 mb-4">Choose the product that best matches your referral to determine the correct submission requirements.</p>
                <Select 
                  value={selectedProduct} 
                  onValueChange={setSelectedProduct}
                >
                  <SelectTrigger className="bg-white" data-testid="select-product">
                    <SelectValue placeholder="Select a product category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {products && (products as any[]).filter((product: any) => product.isActive).map((product: any) => (
                      <SelectItem key={product.id} value={product.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-sm text-gray-500 capitalize">{product.category?.replace('_', ' ')}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProduct && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ Product selected. Now choose how to enter your customer information below.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Customer Information Section */}
          <Card className="shadow-xl border-0 bg-gradient-to-b from-white to-gray-50">
            <CardHeader className="pb-6">
              <div className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Customer Information</CardTitle>
                <p className="text-gray-600">
                  Add your customer details to submit the referral
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs defaultValue="existing" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="existing" className="flex items-center gap-2" data-testid="tab-existing">
                    <SearchIcon className="w-4 h-4" />
                    Search Existing Customers
                  </TabsTrigger>
                  <TabsTrigger value="new" className="flex items-center gap-2" data-testid="tab-new">
                    <UserIcon className="w-4 h-4" />
                    Add New Customer
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="existing" className="space-y-6">
                  {/* Search Bar */}
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search customers by name, business, or email..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="pl-10 bg-white"
                      data-testid="input-customer-search"
                    />
                  </div>

                  {filteredLeads.length > 0 ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          💡 Select a customer from your database to create a referral submission.
                        </p>
                      </div>
                      
                      <div className="grid gap-3 max-h-96 overflow-y-auto">
                        {filteredLeads.map((lead: any) => (
                          <div
                            key={lead.id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all bg-white"
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowMissingInfoDialog(true);
                            }}
                            data-testid={`button-select-lead-${lead.id}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-gray-100 rounded-lg">
                                    <BuildingIcon className="w-4 h-4 text-gray-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-1">{lead.businessName}</h4>
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <UserIcon className="w-3 h-3" />
                                        <span>{lead.contactName}</span>
                                      </div>
                                      {lead.contactEmail && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <MailIcon className="w-3 h-3" />
                                          <span>{lead.contactEmail}</span>
                                        </div>
                                      )}
                                      {lead.contactPhone && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <PhoneIcon className="w-3 h-3" />
                                          <span>{lead.contactPhone}</span>
                                        </div>
                                      )}
                                      {lead.estimatedMonthlyVolume && (
                                        <div className="text-sm text-blue-600 font-medium">
                                          Est. Volume: {lead.estimatedMonthlyVolume}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <Badge 
                                  className={`${
                                    lead.status === 'quote_received' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                    lead.status === 'submitted' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                                    lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                                    'bg-gray-100 text-gray-800 hover:bg-gray-100'
                                  }`}
                                  variant="secondary"
                                >
                                  {lead.status?.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {customerSearch && filteredLeads.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-500 mb-2">No customers found matching "{customerSearch}"</p>
                          <Button 
                            variant="outline" 
                            onClick={() => setCustomerSearch("")}    data-testid="button-clear-search"
                          >
                            Clear Search
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : !customerSearch ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <SearchIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 mb-4">No customers found in your database.</p>
                      <Button 
                        variant="outline" 
                        onClick={() => window.location.href = '/leads'}
                        data-testid="button-manage-leads"
                      >
                        Manage Customer Database
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-2">No customers found matching "{customerSearch}"</p>
                      <Button 
                        variant="outline" 
                        onClick={() => setCustomerSearch("")} 
                        data-testid="button-clear-search"
                      >
                        Clear Search
                      </Button>
                    </div>
                  )
                }
                </TabsContent>

                <TabsContent value="new" className="space-y-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      ✨ Enter new customer details below. All information will be saved to your database for future referrals.
                    </p>
                  </div>
                  
                  <ReferralForm
                    businessTypes={(businessTypes as any[]) || []}
                    onSubmit={(data) => {
                      const referralData = {
                        ...data,
                        selectedProducts: selectedProduct ? [selectedProduct] : data.selectedProducts
                      };
                      submitReferralMutation.mutate(referralData);
                    }}
                    isSubmitting={submitReferralMutation.isPending}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Missing Information Dialog */}
      <Dialog open={showMissingInfoDialog} onOpenChange={setShowMissingInfoDialog}>
        <DialogContent className="bg-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Complete Referral Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                Selected Lead: <strong>{selectedLead?.businessName}</strong>
              </p>
              <p className="text-sm text-blue-600">
                Please provide the missing information to submit this referral.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessAddress">Business Address *</Label>
                <Input
                  id="businessAddress"
                  value={missingInfo.businessAddress}
                  onChange={(e) => setMissingInfo({...missingInfo, businessAddress: e.target.value})}
                  placeholder="Enter full business address"
                  data-testid="input-business-address"
                />
              </div>

              <div>
                <Label htmlFor="businessType">Business Type *</Label>
                <Select 
                  value={missingInfo.businessTypeId} 
                  onValueChange={(value) => setMissingInfo({...missingInfo, businessTypeId: value})}
                >
                  <SelectTrigger data-testid="select-business-type">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {businessTypes && (businessTypes as any[]).map((type: any) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="currentProcessor">Current Payment Processor</Label>
                <Input
                  id="currentProcessor"
                  value={missingInfo.currentProcessor}
                  onChange={(e) => setMissingInfo({...missingInfo, currentProcessor: e.target.value})}
                  placeholder="e.g., Stripe, Square, Worldpay"
                  data-testid="input-current-processor"
                />
              </div>

              <div>
                <Label htmlFor="currentRate">Current Processing Rate (%)</Label>
                <Input
                  id="currentRate"
                  value={missingInfo.currentRate}
                  onChange={(e) => setMissingInfo({...missingInfo, currentRate: e.target.value})}
                  placeholder="e.g., 1.4"
                  data-testid="input-current-rate"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleMissingInfoSubmit}
                disabled={!missingInfo.businessAddress || !missingInfo.businessTypeId || submitReferralMutation.isPending}
                className="flex-1"
                data-testid="button-submit-referral"
              >
                {submitReferralMutation.isPending ? "Submitting..." : "Submit Referral"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowMissingInfoDialog(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
