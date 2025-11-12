import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SideNavigation from "@/components/side-navigation";
import Navigation from "@/components/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminMessagesPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch messages
  const { data: messages = [] } = useQuery({
    queryKey: ["/api/quotes/messages"],
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
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setLocation("/admin")}
              className="gap-2 mb-4"
              data-testid="button-back-to-admin"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900" data-testid="page-title-admin-messages">
              Partner Messages & Queries
            </h1>
            <p className="text-gray-600 mt-2">
              View and respond to partner inquiries
            </p>
          </div>

          <div className="space-y-4">
            {messages.length === 0 ? (
              <Card>
                <CardContent className="p-12">
                  <div className="text-center text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No messages</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {messages.map((message: any) => (
                  <Card key={message.id} className="border-2">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {message.sender?.firstName} {message.sender?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{message.sender?.email}</p>
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <p className="text-gray-900">{message.message}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            window.open(`/quotes#${message.quoteId}`, "_blank");
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
        </div>
      </div>
    </div>
  );
}
