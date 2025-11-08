import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SideNavigation from "@/components/side-navigation";
import Navigation from "@/components/navigation";
import { AdminDealsPipeline } from "@/components/admin-deals-pipeline";
import { AdminPaymentsPortal } from "@/components/admin-payments-portal";
import { AdminInvoicesView } from "@/components/admin-invoices-view";
import MlmVisualization from "@/components/mlm-visualization";
import {
  Settings,
  DollarSign,
  FileText,
  MessageSquare,
  Database,
  Users,
  TrendingUp,
  Target,
  BarChart3,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [paymentsDialogOpen, setPaymentsDialogOpen] = useState(false);
  const [invoicesDialogOpen, setInvoicesDialogOpen] = useState(false);
  const [backendDialogOpen, setBackendDialogOpen] = useState(false);
  const [messagesDialogOpen, setMessagesDialogOpen] = useState(false);

  // Fetch notification counts
  const { data: notificationData } = useQuery({
    queryKey: ["/api/admin/notifications"],
  });

  const notificationCounts = notificationData || {
    submissions: 0,
    signups: 0,
    pipeline: 0,
    messages: 0,
    completedDeals: 0,
  };

  // Fetch messages
  const { data: messages = [] } = useQuery({
    queryKey: ["/api/quotes/messages"],
  });

  // Fetch all users for backend management
  const { data: allUsers = [] } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <SideNavigation />
        <div className="lg:ml-16">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-red-600">Access Denied: Admin privileges required</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SideNavigation />
      <div className="lg:ml-16">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with Action Buttons */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="page-title-admin">
                  Deal Pipeline Management
                </h1>
                <p className="text-gray-600" data-testid="text-admin-description">
                  Track and manage all deals from quote request to completion
                </p>
              </div>
              
              {/* Quick Access Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaymentsDialogOpen(true)}
                  className="gap-2"
                  data-testid="button-open-payments"
                >
                  <DollarSign className="h-4 w-4" />
                  Payments
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInvoicesDialogOpen(true)}
                  className="gap-2"
                  data-testid="button-open-invoices"
                >
                  <FileText className="h-4 w-4" />
                  Invoices
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMessagesDialogOpen(true)}
                  className="gap-2 relative"
                  data-testid="button-open-messages"
                >
                  <MessageSquare className="h-4 w-4" />
                  Messages
                  {notificationCounts.messages > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5">
                      {notificationCounts.messages}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBackendDialogOpen(true)}
                  className="gap-2"
                  data-testid="button-open-backend"
                >
                  <Database className="h-4 w-4" />
                  Backend
                </Button>
              </div>
            </div>
          </div>

          {/* Main Pipeline Component */}
          <AdminDealsPipeline />
        </div>
      </div>

      {/* Payments Dialog */}
      <Dialog open={paymentsDialogOpen} onOpenChange={setPaymentsDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Commission Payments</DialogTitle>
          </DialogHeader>
          <AdminPaymentsPortal />
        </DialogContent>
      </Dialog>

      {/* Invoices Dialog */}
      <Dialog open={invoicesDialogOpen} onOpenChange={setInvoicesDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Partner Invoices</DialogTitle>
          </DialogHeader>
          <AdminInvoicesView />
        </DialogContent>
      </Dialog>

      {/* Messages Dialog */}
      <Dialog open={messagesDialogOpen} onOpenChange={setMessagesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Partner Messages & Queries</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No messages</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {messages.map((message: any) => (
                  <Card key={message.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{message.sender?.firstName} {message.sender?.lastName}</p>
                            <p className="text-xs text-gray-500">{message.sender?.email}</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded p-3 border border-gray-200">
                          <p className="text-sm text-gray-900">{message.message}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            window.open(`/quotes#${message.quoteId}`, "_blank");
                            setMessagesDialogOpen(false);
                          }}
                          data-testid={`button-view-message-${message.id}`}
                        >
                          View Deal
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Backend Management Dialog */}
      <Dialog open={backendDialogOpen} onOpenChange={setBackendDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Backend Management</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="users" data-testid="tab-backend-users" className="gap-2">
                <Users className="h-4 w-4" />
                <span>Users</span>
              </TabsTrigger>
              <TabsTrigger value="mlm" data-testid="tab-backend-mlm" className="gap-2">
                <Target className="h-4 w-4" />
                <span>MLM Network</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-backend-analytics" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="settings" data-testid="tab-backend-settings" className="gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">User Management</h3>
                <div className="grid gap-4">
                  {allUsers.map((u: any) => (
                    <Card key={u.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{u.firstName} {u.lastName}</p>
                            <p className="text-sm text-gray-600">{u.email}</p>
                            {u.company && <p className="text-xs text-gray-500">{u.company}</p>}
                          </div>
                          <div className="flex gap-2">
                            {u.isAdmin && <Badge className="bg-purple-500">Admin</Badge>}
                            {u.emailVerified && <Badge variant="outline">Verified</Badge>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="mlm">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">MLM Network Visualization</h3>
                <MlmVisualization />
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Platform Analytics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold">{allUsers.length}</p>
                      <p className="text-sm text-gray-600">Total Users</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold">{notificationCounts.submissions}</p>
                      <p className="text-sm text-gray-600">Pending Quotes</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                      <p className="text-2xl font-bold">{notificationCounts.completedDeals}</p>
                      <p className="text-sm text-gray-600">Completed Deals</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">System Settings</h3>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-gray-600">System settings and configuration options will appear here.</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
