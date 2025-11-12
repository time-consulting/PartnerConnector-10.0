import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SideNavigation from "@/components/side-navigation";
import Navigation from "@/components/navigation";
import { AdminDealsPipeline } from "@/components/admin-deals-pipeline";
import {
  DollarSign,
  FileText,
  MessageSquare,
  Database,
} from "lucide-react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

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
                  onClick={() => setLocation("/admin/payments")}
                  className="gap-2"
                  data-testid="button-open-payments"
                >
                  <DollarSign className="h-4 w-4" />
                  Payments
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation("/admin/invoices")}
                  className="gap-2"
                  data-testid="button-open-invoices"
                >
                  <FileText className="h-4 w-4" />
                  Invoices
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation("/admin/messages")}
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
                  onClick={() => setLocation("/admin/backend")}
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
    </div>
  );
}
