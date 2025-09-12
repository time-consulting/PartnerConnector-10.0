import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import SideNavigation from "@/components/side-navigation";
import LeadsUpload from "@/components/leads-upload";
import LeadsDashboard from "@/components/leads-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersIcon, UploadIcon, BarChart3Icon } from "lucide-react";
import type { InsertLead, Lead } from "@shared/schema";

export default function Leads() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  // Fetch leads
  const { data: leads = [], isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Add single lead mutation
  const addLeadMutation = useMutation({
    mutationFn: async (leadData: InsertLead) => {
      const response = await apiRequest("POST", "/api/leads", leadData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Lead Added Successfully!",
        description: "The lead has been added to your CRM.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
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
        description: "Failed to add lead. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Add bulk leads mutation
  const addBulkLeadsMutation = useMutation({
    mutationFn: async (leadsData: InsertLead[]) => {
      const response = await apiRequest("POST", "/api/leads/bulk", { leads: leadsData });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Leads Uploaded Successfully!",
        description: `${data.count} leads have been added to your CRM.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
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
        description: "Failed to upload leads. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update lead status mutation
  const updateLeadStatusMutation = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/leads/${leadId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
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
        description: "Failed to update lead status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Add interaction mutation
  const addInteractionMutation = useMutation({
    mutationFn: async ({ leadId, interaction }: { leadId: string; interaction: any }) => {
      const response = await apiRequest("POST", `/api/leads/${leadId}/interactions`, interaction);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Interaction Added",
        description: "The interaction has been logged successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
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
        description: "Failed to add interaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Send info mutation
  const sendInfoMutation = useMutation({
    mutationFn: async ({ leadId, productInfo }: { leadId: string; productInfo: any }) => {
      const response = await apiRequest("POST", `/api/leads/${leadId}/send-info`, productInfo);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Information Sent",
        description: "The business information has been prepared for sending.",
      });
      // Add an interaction record for this
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
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
        description: "Failed to prepare information. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleLeadSubmit = (leadData: any) => {
    // Add partnerId from authenticated user
    const leadWithPartnerId = {
      ...leadData,
      partnerId: 'current-user-id' // This will be set from user context in backend
    };
    addLeadMutation.mutate(leadWithPartnerId);
  };

  const handleBulkUpload = (leadsData: any[]) => {
    // Add partnerId to all leads
    const leadsWithPartnerId = leadsData.map(lead => ({
      ...lead,
      partnerId: 'current-user-id' // This will be set from user context in backend
    }));
    addBulkLeadsMutation.mutate(leadsWithPartnerId);
  };

  const handleStatusUpdate = (leadId: string, status: string) => {
    updateLeadStatusMutation.mutate({ leadId, status });
  };

  const handleAddInteraction = (leadId: string, interaction: any) => {
    addInteractionMutation.mutate({ leadId, interaction });
  };

  const handleSendInfo = (leadId: string, productInfo: any) => {
    sendInfoMutation.mutate({ leadId, productInfo });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SideNavigation />
      <div className="lg:ml-16">
        <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leads Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Upload, track, and manage your business leads with our CRM-style dashboard
            </p>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3Icon className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <UploadIcon className="h-4 w-4" />
                Upload Leads
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <LeadsDashboard
                leads={leads}
                onStatusUpdate={handleStatusUpdate}
                onAddInteraction={handleAddInteraction}
                onSendInfo={handleSendInfo}
              />
            </TabsContent>

            <TabsContent value="upload" className="space-y-6">
              <LeadsUpload
                onLeadSubmit={handleLeadSubmit}
                onBulkUpload={handleBulkUpload}
                isSubmitting={addLeadMutation.isPending || addBulkLeadsMutation.isPending}
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Conversion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {leads.length > 0 
                        ? `${Math.round((leads.filter((l: Lead) => l.status === 'converted').length / leads.length) * 100)}%`
                        : '0%'
                      }
                    </div>
                    <p className="text-sm text-gray-600">Leads converted to referrals</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Active Pipeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {leads.filter((l: Lead) => ['contacted', 'interested', 'quoted'].includes(l.status)).length}
                    </div>
                    <p className="text-sm text-gray-600">Leads in active discussions</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>High Priority</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">
                      {leads.filter((l: Lead) => l.priority === 'high').length}
                    </div>
                    <p className="text-sm text-gray-600">High priority leads requiring attention</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Lead Sources Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leads.length > 0 ? Object.entries(
                      leads.reduce((acc: Record<string, number>, lead: Lead) => {
                        const source = lead.leadSource || 'unknown';
                        acc[source] = (acc[source] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([source, count]) => (
                      <div key={source} className="flex justify-between items-center">
                        <span className="capitalize">{source.replace('_', ' ')}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    )) : (
                      <p className="text-gray-500">No leads yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      </div>
    </div>
  );
}