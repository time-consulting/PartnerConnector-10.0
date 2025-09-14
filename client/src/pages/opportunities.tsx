import { useState, Suspense, lazy } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Filter, ArrowUpDown, Mail, Phone, Building, User, Edit3, MoreHorizontal, TrendingUp, DollarSign, Calendar, Target, Grid3X3, List, Layers } from "lucide-react";
import { DragEndEvent } from '@dnd-kit/core';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Opportunity } from "@shared/schema";

const OpportunityKanbanView = lazy(() => import("@/components/opportunity-kanban-view"));

interface OpportunityFormData {
  businessName: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  contactId?: string;
  estimatedValue: string;
  currentMonthlyVolume: string;
  status: string;
  stage: string;
  priority: string;
  assignedTo: string;
  expectedCloseDate: string;
  productInterest: string[];
  businessType: string;
  decisionMakers: string;
  painPoints: string;
  competitorInfo: string;
  notes: string;
  nextSteps: string;
}

const initialFormData: OpportunityFormData = {
  businessName: "",
  contactFirstName: "",
  contactLastName: "",
  contactEmail: "",
  contactPhone: "",
  estimatedValue: "",
  currentMonthlyVolume: "",
  status: "prospect",
  stage: "initial_contact",
  priority: "medium",
  assignedTo: "",
  expectedCloseDate: "",
  productInterest: [],
  businessType: "",
  decisionMakers: "",
  painPoints: "",
  competitorInfo: "",
  notes: "",
  nextSteps: "",
};

const statusOptions = [
  { value: "prospect", label: "Prospect", color: "bg-blue-100 text-blue-800" },
  { value: "qualified", label: "Qualified", color: "bg-yellow-100 text-yellow-800" },
  { value: "proposal", label: "Proposal Sent", color: "bg-purple-100 text-purple-800" },
  { value: "negotiation", label: "Negotiation", color: "bg-orange-100 text-orange-800" },
  { value: "closed_won", label: "Closed Won", color: "bg-green-100 text-green-800" },
  { value: "closed_lost", label: "Closed Lost", color: "bg-red-100 text-red-800" },
  { value: "on_hold", label: "On Hold", color: "bg-gray-100 text-gray-800" },
];

const stageOptions = [
  "initial_contact",
  "qualified_lead",
  "needs_analysis",
  "proposal_development",
  "proposal_review",
  "decision_pending",
  "contract_negotiation",
  "closed",
];

const priorityOptions = [
  { value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
  { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-800" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" },
];

const productCategories = [
  "Card Machines",
  "Business Funding",
  "Utilities",
  "Insurance",
  "Banking",
  "POS Systems"
];

const businessTypes = [
  "Retail",
  "Restaurant",
  "Professional Services",
  "Healthcare",
  "E-commerce",
  "Manufacturing",
  "Technology",
  "Construction",
  "Other"
];

function OpportunityForm({ 
  opportunity, 
  onClose, 
  onSave 
}: { 
  opportunity?: Opportunity; 
  onClose: () => void;
  onSave: (data: OpportunityFormData) => void;
}) {
  const [formData, setFormData] = useState<OpportunityFormData>(
    opportunity ? {
      businessName: opportunity.businessName || "",
      contactFirstName: opportunity.contactFirstName || "",
      contactLastName: opportunity.contactLastName || "",
      contactEmail: opportunity.contactEmail || "",
      contactPhone: opportunity.contactPhone || "",
      contactId: opportunity.contactId || "",
      estimatedValue: opportunity.estimatedValue || "",
      currentMonthlyVolume: opportunity.currentMonthlyVolume || "",
      status: opportunity.status || "prospect",
      stage: opportunity.stage || "initial_contact",
      priority: opportunity.priority || "medium",
      assignedTo: opportunity.assignedTo || "",
      expectedCloseDate: opportunity.expectedCloseDate ? new Date(opportunity.expectedCloseDate).toISOString().split('T')[0] : "",
      productInterest: opportunity.productInterest || [],
      businessType: opportunity.businessType || "",
      decisionMakers: opportunity.decisionMakers || "",
      painPoints: opportunity.painPoints || "",
      competitorInfo: opportunity.competitorInfo || "",
      notes: opportunity.notes || "",
      nextSteps: opportunity.nextSteps || "",
    } : initialFormData
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const toggleProductInterest = (product: string) => {
    setFormData(prev => ({
      ...prev,
      productInterest: prev.productInterest.includes(product)
        ? prev.productInterest.filter(p => p !== product)
        : [...prev.productInterest, product]
    }));
  };

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="opportunity-info" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="opportunity-info" data-testid="tab-opportunity-info">Opportunity Info</TabsTrigger>
            <TabsTrigger value="contact-details" data-testid="tab-contact-details">Contact Details</TabsTrigger>
            <TabsTrigger value="deal-info" data-testid="tab-deal-info">Deal Info</TabsTrigger>
            <TabsTrigger value="notes-actions" data-testid="tab-notes-actions">Notes & Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="opportunity-info" className="space-y-4 mt-6">
            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                data-testid="input-business-name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="stage">Stage</Label>
                <Select 
                  value={formData.stage} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, stage: value }))}
                >
                  <SelectTrigger data-testid="select-stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stageOptions.map(stage => (
                      <SelectItem key={stage} value={stage}>
                        {stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger data-testid="select-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="businessType">Business Type</Label>
                <Select 
                  value={formData.businessType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}
                >
                  <SelectTrigger data-testid="select-business-type">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Product Interests</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {productCategories.map(product => (
                  <label key={product} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.productInterest.includes(product)}
                      onChange={() => toggleProductInterest(product)}
                      className="rounded border-gray-300"
                      data-testid={`checkbox-product-${product.toLowerCase().replace(/\s+/g, '-')}`}
                    />
                    <span className="text-sm">{product}</span>
                  </label>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact-details" className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactFirstName">Contact First Name</Label>
                <Input
                  id="contactFirstName"
                  value={formData.contactFirstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactFirstName: e.target.value }))}
                  data-testid="input-contact-first-name"
                />
              </div>
              <div>
                <Label htmlFor="contactLastName">Contact Last Name</Label>
                <Input
                  id="contactLastName"
                  value={formData.contactLastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactLastName: e.target.value }))}
                  data-testid="input-contact-last-name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  data-testid="input-contact-email"
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  data-testid="input-contact-phone"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="decisionMakers">Decision Makers</Label>
              <Textarea
                id="decisionMakers"
                value={formData.decisionMakers}
                onChange={(e) => setFormData(prev => ({ ...prev, decisionMakers: e.target.value }))}
                placeholder="List the key decision makers and their roles..."
                data-testid="textarea-decision-makers"
              />
            </div>
          </TabsContent>

          <TabsContent value="deal-info" className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimatedValue">Estimated Value (£)</Label>
                <Input
                  id="estimatedValue"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedValue: e.target.value }))}
                  placeholder="0"
                  data-testid="input-estimated-value"
                />
              </div>
              <div>
                <Label htmlFor="currentMonthlyVolume">Current Monthly Volume (£)</Label>
                <Input
                  id="currentMonthlyVolume"
                  value={formData.currentMonthlyVolume}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentMonthlyVolume: e.target.value }))}
                  placeholder="0"
                  data-testid="input-monthly-volume"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
                <Input
                  id="expectedCloseDate"
                  type="date"
                  value={formData.expectedCloseDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedCloseDate: e.target.value }))}
                  data-testid="input-close-date"
                />
              </div>
              <div>
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                  placeholder="Partner or team member"
                  data-testid="input-assigned-to"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="painPoints">Pain Points & Challenges</Label>
              <Textarea
                id="painPoints"
                value={formData.painPoints}
                onChange={(e) => setFormData(prev => ({ ...prev, painPoints: e.target.value }))}
                placeholder="What challenges is the prospect facing that our solution can address?"
                data-testid="textarea-pain-points"
              />
            </div>

            <div>
              <Label htmlFor="competitorInfo">Competitor Information</Label>
              <Textarea
                id="competitorInfo"
                value={formData.competitorInfo}
                onChange={(e) => setFormData(prev => ({ ...prev, competitorInfo: e.target.value }))}
                placeholder="Current providers, competitor quotes, market position..."
                data-testid="textarea-competitor-info"
              />
            </div>
          </TabsContent>

          <TabsContent value="notes-actions" className="space-y-4 mt-6">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="General notes about this opportunity..."
                className="min-h-[150px] resize-y"
                data-testid="textarea-notes"
              />
            </div>

            <div>
              <Label htmlFor="nextSteps">Next Steps</Label>
              <Textarea
                id="nextSteps"
                value={formData.nextSteps}
                onChange={(e) => setFormData(prev => ({ ...prev, nextSteps: e.target.value }))}
                placeholder="Define next actions and follow-up steps..."
                className="min-h-[100px] resize-y"
                data-testid="textarea-next-steps"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            data-testid="button-save-opportunity"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {opportunity ? "Update Opportunity" : "Create Opportunity"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function OpportunitiesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("business");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterBy, setFilterBy] = useState<string>("all");
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  // Query for opportunities
  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['/api/opportunities'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/opportunities");
      if (!response.ok) {
        throw new Error('Failed to fetch opportunities');
      }
      return response.json();
    },
  });

  // Create opportunity mutation
  const createOpportunityMutation = useMutation({
    mutationFn: async (data: OpportunityFormData) => {
      const response = await apiRequest("POST", "/api/opportunities", data);
      if (!response.ok) {
        throw new Error('Failed to create opportunity');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Opportunity created successfully",
      });
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create opportunity",
        variant: "destructive",
      });
    },
  });

  // Update opportunity mutation
  const updateOpportunityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: OpportunityFormData }) => {
      const response = await apiRequest("PUT", `/api/opportunities/${id}`, data);
      if (!response.ok) {
        throw new Error('Failed to update opportunity');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success", 
        description: "Opportunity updated successfully",
      });
      setSelectedOpportunity(null);
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update opportunity",
        variant: "destructive",
      });
    },
  });

  // Drag and drop mutation for Kanban
  const updateOpportunityStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PUT", `/api/opportunities/${id}`, { status });
      if (!response.ok) {
        throw new Error('Failed to update opportunity status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to move opportunity",
        variant: "destructive",
      });
    },
  });

  const filteredAndSortedOpportunities = opportunities
    .filter((opportunity: Opportunity) => {
      const matchesSearch = `${opportunity.businessName} ${opportunity.contactFirstName} ${opportunity.contactLastName} ${opportunity.contactEmail}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      if (filterBy === "all") return matchesSearch;
      if (filterBy === "status") return matchesSearch && opportunity.status === filterBy;
      return matchesSearch;
    })
    .sort((a: Opportunity, b: Opportunity) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "business":
          aValue = a.businessName || "";
          bValue = b.businessName || "";
          break;
        case "value":
          aValue = parseFloat(a.estimatedValue || "0");
          bValue = parseFloat(b.estimatedValue || "0");
          break;
        case "stage":
          aValue = a.stage || "";
          bValue = b.stage || "";
          break;
        case "closeDate":
          aValue = a.expectedCloseDate ? new Date(a.expectedCloseDate) : new Date(0);
          bValue = b.expectedCloseDate ? new Date(b.expectedCloseDate) : new Date(0);
          break;
        default:
          aValue = a.businessName;
          bValue = b.businessName;
      }
      
      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleCreateOpportunity = (data: OpportunityFormData) => {
    createOpportunityMutation.mutate(data);
  };

  const handleUpdateOpportunity = (data: OpportunityFormData) => {
    if (selectedOpportunity) {
      updateOpportunityMutation.mutate({ id: selectedOpportunity.id, data });
    }
  };

  // Handle drag and drop for Kanban
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const opportunityId = active.id as string;
    const newStatus = over.id as string;
    
    // Find the opportunity being dragged
    const opportunity = opportunities.find((opp: Opportunity) => opp.id === opportunityId);
    if (!opportunity || opportunity.status === newStatus) return;
    
    // Optimistically update the UI
    queryClient.setQueryData(['/api/opportunities'], (old: Opportunity[] = []) => 
      old.map((opp) => 
        opp.id === opportunityId ? { ...opp, status: newStatus } : opp
      )
    );
    
    // Update on server
    updateOpportunityStatusMutation.mutate({ 
      id: opportunityId, 
      status: newStatus 
    });
  };

  const handleEditDetails = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption?.color || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: string) => {
    const priorityOption = priorityOptions.find(p => p.value === priority);
    return priorityOption?.color || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading opportunities...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="page-title">
                Opportunities
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Track your sales pipeline and manage deal progression
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <Button
                  variant={viewMode === "kanban" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("kanban")}
                  className="h-8 px-3"
                  data-testid="button-kanban-view"
                >
                  <Layers className="h-4 w-4 mr-1" />
                  Kanban
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 px-3"
                  data-testid="button-list-view"
                >
                  <List className="h-4 w-4 mr-1" />
                  List
                </Button>
              </div>
              
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    data-testid="button-add-opportunity"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Opportunity
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Create New Opportunity</DialogTitle>
                  </DialogHeader>
                  <OpportunityForm 
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleCreateOpportunity}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search opportunities by business name, contact, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-opportunities"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40" data-testid="select-sort-by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">Sort by Business</SelectItem>
                  <SelectItem value="value">Sort by Value</SelectItem>
                  <SelectItem value="stage">Sort by Stage</SelectItem>
                  <SelectItem value="closeDate">Sort by Close Date</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                data-testid="button-sort-order"
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-40" data-testid="select-filter-by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Opportunities</SelectItem>
                  <SelectItem value="prospect">Prospects</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal Sent</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Opportunities View */}
        {filteredAndSortedOpportunities.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No opportunities found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start tracking your sales pipeline by creating your first opportunity
              </p>
              <Button 
                onClick={() => setIsFormOpen(true)}
                data-testid="button-create-first-opportunity"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Opportunity
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === "kanban" ? (
          <Suspense fallback={<div className="text-center py-8">Loading Kanban view...</div>}>
            <OpportunityKanbanView
              opportunities={filteredAndSortedOpportunities}
              isLoading={isLoading}
              onEditDetails={handleEditDetails}
              onDragEnd={handleDragEnd}
            />
          </Suspense>
        ) : (
          <div className="grid gap-4" data-testid="opportunities-list">
            {filteredAndSortedOpportunities.map((opportunity: Opportunity) => (
              <Card 
                key={opportunity.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                data-testid={`opportunity-card-${opportunity.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {opportunity.businessName}
                          </h3>
                          <Badge className={getStatusColor(opportunity.status)}>
                            {statusOptions.find(s => s.value === opportunity.status)?.label || opportunity.status}
                          </Badge>
                          <Badge className={getPriorityColor(opportunity.priority || "medium")}>
                            {priorityOptions.find(p => p.value === opportunity.priority)?.label || opportunity.priority || "Medium"}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                          {opportunity.contactFirstName && opportunity.contactLastName && (
                            <div className="flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              {opportunity.contactFirstName} {opportunity.contactLastName}
                            </div>
                          )}
                          {opportunity.contactEmail && (
                            <div className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {opportunity.contactEmail}
                            </div>
                          )}
                          {opportunity.contactPhone && (
                            <div className="flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {opportunity.contactPhone}
                            </div>
                          )}
                          {opportunity.estimatedValue && (
                            <div className="flex items-center">
                              <DollarSign className="w-3 h-3 mr-1" />
                              £{opportunity.estimatedValue}
                            </div>
                          )}
                          {opportunity.expectedCloseDate && (
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(opportunity.expectedCloseDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {opportunity.stage?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`button-menu-${opportunity.id}`}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => setSelectedOpportunity(opportunity)}
                            data-testid={`menu-edit-${opportunity.id}`}
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Opportunity
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Opportunity Dialog */}
        <Dialog 
          open={!!selectedOpportunity} 
          onOpenChange={(open) => !open && setSelectedOpportunity(null)}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                Edit Opportunity: {selectedOpportunity?.businessName}
              </DialogTitle>
            </DialogHeader>
            {selectedOpportunity && (
              <OpportunityForm 
                opportunity={selectedOpportunity}
                onClose={() => setSelectedOpportunity(null)}
                onSave={handleUpdateOpportunity}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}