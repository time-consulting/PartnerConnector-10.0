import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/toast-disabled";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import SideNavigation from "@/components/side-navigation";
import ProgressionSystem from "@/components/progression-system";
import ReferralLinkManager from "@/components/referral-link-manager";
import InviteTracker from "@/components/invite-tracker";
import MobileShareSheet from "@/components/mobile-share-sheet";
import TeamAnalytics from "@/components/team-analytics";
import InviteTeamMember from "@/components/invite-team-member";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users2, 
  Rocket, 
  Share2, 
  Target,
  TrendingUp,
  Crown,
  Sparkles,
  Network,
  Trophy,
  Zap
} from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

// Type definitions for better type safety
interface ReferralLinkData {
  id: string;
  name: string;
  url: string;
  shortCode: string;
  clicks: number;
  conversions: number;
  created: Date;
  expires?: Date;
  isActive: boolean;
  trackingEnabled: boolean;
  campaignName?: string;
}

interface CreateLinkData {
  name: string;
  campaignName?: string;
  expiresAt?: Date;
  trackingEnabled?: boolean;
}

interface UpdateLinkData {
  name?: string;
  isActive?: boolean;
  trackingEnabled?: boolean;
}

interface ShareData {
  platform: string;
  message: string;
  customData?: any;
}

interface UserStats {
  level: string;
  earnings: number;
  teamSize: number;
}

export default function TeamManagement() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showMobileShareSheet, setShowMobileShareSheet] = useState(false);
  const [showTeamAnalytics, setShowTeamAnalytics] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const queryClient = useQueryClient();

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

  // Mock data for gamified system - would be from API in production
  const userStats = {
    level: "Gold Partner",
    earnings: 4350,
    teamSize: 12
  };

  const progressionData = {
    currentLevel: "Gold Partner",
    currentXP: 3250,
    xpToNextLevel: 1750,
    totalXP: 3250,
    teamSize: 12,
    totalInvites: 25,
    successfulInvites: 12,
    currentStreak: 7,
    longestStreak: 14,
    revenue: 4350,
    achievements: [
      {
        id: "first-invite",
        name: "First Steps",
        description: "Sent your first team invitation",
        icon: "users",
        unlockedAt: new Date('2024-01-15')
      },
      {
        id: "week-streak",
        name: "Week Warrior",
        description: "7 day invitation streak",
        icon: "flame",
        unlockedAt: new Date('2024-01-22')
      },
      {
        id: "team-builder",
        name: "Team Builder",
        description: "Build a team of 10+ members",
        icon: "users",
        unlockedAt: new Date('2024-01-28')
      },
      {
        id: "revenue-milestone",
        name: "Revenue Generator",
        description: "Generate £5000+ in team revenue",
        icon: "trending",
        progress: 4350,
        total: 5000
      },
      {
        id: "platinum-path",
        name: "Platinum Potential",
        description: "Get 50% to Platinum level",
        icon: "star",
        progress: 3250,
        total: 5000
      }
    ],
    nextMilestone: {
      name: "Platinum Partner",
      description: "Reach Platinum level for premium benefits",
      progress: 3250,
      total: 5000,
      reward: "10% Bonus Rate"
    }
  };

  const mockReferralLinks = [
    {
      id: "1",
      name: "LinkedIn Campaign",
      url: "https://example.com/signup?ref=user123-linkedin",
      shortCode: "user123-linkedin",
      clicks: 47,
      conversions: 8,
      created: new Date('2024-01-15'),
      isActive: true,
      trackingEnabled: true,
      campaignName: "Q1-2024-LinkedIn"
    },
    {
      id: "2",
      name: "Email Newsletter",
      url: "https://example.com/signup?ref=user123-email",
      shortCode: "user123-email",
      clicks: 23,
      conversions: 5,
      created: new Date('2024-01-20'),
      expires: new Date('2024-04-20'),
      isActive: true,
      trackingEnabled: true
    }
  ];

  const mockInvites = [
    {
      id: "1",
      email: "sarah@techcorp.com",
      name: "Sarah Johnson",
      status: 'active' as const,
      sentAt: new Date('2024-01-15'),
      openedAt: new Date('2024-01-15'),
      clickedAt: new Date('2024-01-16'),
      registeredAt: new Date('2024-01-16'),
      activatedAt: new Date('2024-01-17'),
      source: "LinkedIn",
      device: 'desktop' as const,
      location: "London, UK",
      referralCode: "user123-sarah",
      remindersSent: 0
    },
    {
      id: "2",
      email: "mike@growthco.com",
      name: "Mike Chen",
      status: 'registered' as const,
      sentAt: new Date('2024-01-20'),
      openedAt: new Date('2024-01-20'),
      clickedAt: new Date('2024-01-21'),
      registeredAt: new Date('2024-01-22'),
      source: "Email",
      device: 'mobile' as const,
      location: "Manchester, UK",
      referralCode: "user123-mike",
      remindersSent: 1
    },
    {
      id: "3",
      email: "lisa@innovatetech.com",
      name: "Lisa Rodriguez",
      status: 'clicked' as const,
      sentAt: new Date('2024-01-25'),
      openedAt: new Date('2024-01-25'),
      clickedAt: new Date('2024-01-26'),
      source: "WhatsApp",
      device: 'mobile' as const,
      location: "Birmingham, UK",
      referralCode: "user123-lisa",
      remindersSent: 0
    }
  ];

  const inviteMetrics = {
    sent: 25,
    opened: 18,
    clicked: 15,
    registered: 12,
    active: 12
  };

  // Typed mutations for better type safety
  const createLinkMutation = useMutation({
    mutationFn: async (data: CreateLinkData): Promise<ReferralLinkData> => {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        id: Date.now().toString(),
        name: data.name,
        url: `https://example.com/signup?ref=${user?.id || 'demo123'}-${Date.now()}`,
        shortCode: `${user?.id || 'demo123'}-${Date.now()}`,
        clicks: 0,
        conversions: 0,
        created: new Date(),
        expires: data.expiresAt,
        isActive: true,
        trackingEnabled: data.trackingEnabled ?? true,
        campaignName: data.campaignName,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/referral-links'] });
      toast({
        title: "Link Created",
        description: "Referral link created successfully",
      });
    },
    onError: (error: unknown) => {
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
        description: "Failed to create referral link",
        variant: "destructive",
      });
    },
  });

  const shareTrackingMutation = useMutation({
    mutationFn: async (data: ShareData) => {
      // Mock API call to track sharing
      await new Promise((resolve) => setTimeout(resolve, 500));
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Shared Successfully",
        description: `Shared on ${data.platform}`,
      });
    },
    onError: (error: unknown) => {
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
        description: "Failed to track sharing",
        variant: "destructive",
      });
    },
  });

  // Typed handler functions for component interactions
  const handleCreateReferralLink = async (data: CreateLinkData): Promise<ReferralLinkData> => {
    return createLinkMutation.mutateAsync(data);
  };

  const handleUpdateReferralLink = async (id: string, data: UpdateLinkData): Promise<UpdateLinkData> => {
    // Mock update API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: "Link Updated",
      description: "Referral link updated successfully",
    });
    return data;
  };

  const handleDeleteReferralLink = async (id: string): Promise<void> => {
    // Mock delete API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: "Link Deleted",
      description: "Referral link deleted successfully",
    });
  };

  const handleShare = async (platform: string, message: string, customData?: any): Promise<ShareData> => {
    return shareTrackingMutation.mutateAsync({ platform, message, customData });
  };

  const handleOpenAnalytics = () => {
    setShowTeamAnalytics(true);
  };

  const handleOpenInviteDialog = () => {
    setShowInviteDialog(true);
  };

  const handleRefreshAnalytics = async () => {
    // Mock refresh analytics data
    await new Promise((resolve) => setTimeout(resolve, 1000));
    queryClient.invalidateQueries({ queryKey: ['/api/team-analytics'] });
    toast({
      title: "Analytics Refreshed",
      description: "Team analytics data has been updated",
    });
  };

  const handleInviteSuccess = (invitation: any) => {
    // Handle successful invitation
    queryClient.invalidateQueries({ queryKey: ['/api/team-invitations'] });
    queryClient.invalidateQueries({ queryKey: ['/api/team-analytics'] });
  };

  const handleResendInvite = async (id: string) => {
    // Mock resend API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: "Invite Resent",
      description: "Invitation has been resent successfully",
    });
  };

  const handleSendReminder = async (id: string) => {
    // Mock reminder API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: "Reminder Sent",
      description: "Reminder has been sent successfully",
    });
  };

  const handleRefreshInvites = async () => {
    // Mock refresh API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    queryClient.invalidateQueries({ queryKey: ['/api/invites'] });
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SideNavigation />
      <div className="lg:ml-16">
        <Navigation />
        
        {/* Full Width Layout */}
        <div className="w-full">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
                  <Crown className="w-8 h-8 text-yellow-500" />
                  Team Growth Center
                  <Sparkles className="w-8 h-8 text-purple-500" />
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Build your network, track your progress, and unlock rewards through our gamified team growth platform
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* Main Content - 8 columns on XL screens */}
              <div className="xl:col-span-8">
                <Tabs defaultValue="progression" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="progression" className="flex items-center gap-2" data-testid="tab-progression">
                      <Rocket className="w-4 h-4" />
                      Progression
                    </TabsTrigger>
                    <TabsTrigger value="referral-links" className="flex items-center gap-2" data-testid="tab-referral-links">
                      <Share2 className="w-4 h-4" />
                      Referral Links
                    </TabsTrigger>
                    <TabsTrigger value="invite-tracking" className="flex items-center gap-2" data-testid="tab-invite-tracking">
                      <Target className="w-4 h-4" />
                      Invite Tracking
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="progression" className="space-y-6">
                    <ProgressionSystem data={progressionData} />
                  </TabsContent>

                  <TabsContent value="referral-links" className="space-y-6">
                    <ReferralLinkManager 
                      userReferralCode={user?.id || 'demo123'}
                      links={mockReferralLinks}
                      onCreateLink={handleCreateReferralLink}
                      onUpdateLink={handleUpdateReferralLink}
                      onDeleteLink={handleDeleteReferralLink}
                    />
                  </TabsContent>

                  <TabsContent value="invite-tracking" className="space-y-6">
                    <InviteTracker 
                      invites={mockInvites}
                      metrics={inviteMetrics}
                      onResendInvite={handleResendInvite}
                      onSendReminder={handleSendReminder}
                      onRefresh={handleRefreshInvites}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar - 4 columns on XL screens */}
              <div className="xl:col-span-4">
                {/* Desktop Sidebar */}
                <div className="hidden xl:block">
                  <div className="sticky top-8 space-y-6">
                    
                    {/* Quick Actions Card */}
                    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button 
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          onClick={() => setShowMobileShareSheet(true)}
                          data-testid="button-share-quick"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Referral Link
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={handleOpenInviteDialog}
                          data-testid="button-invite-team"
                        >
                          <Users2 className="w-4 h-4 mr-2" />
                          Invite Team Member
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={handleOpenAnalytics}
                          data-testid="button-view-analytics"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          View Analytics
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Level Progress Card */}
                    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-yellow-600" />
                          Level Progress
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center space-y-3">
                          <div className="text-2xl font-bold text-yellow-700">{userStats.level}</div>
                          <div className="text-sm text-gray-600">1,750 XP to Platinum</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                          <div className="text-xs text-gray-500">65% to next level</div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Team Stats Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Network className="w-5 h-5" />
                          Team Stats
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Team Size</span>
                          <span className="font-semibold">{userStats.teamSize}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Earnings</span>
                          <span className="font-semibold text-green-600">£{userStats.earnings}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Active Invites</span>
                          <span className="font-semibold">{inviteMetrics.active}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Conversion Rate</span>
                          <span className="font-semibold text-blue-600">{Math.round((inviteMetrics.active / inviteMetrics.sent) * 100)}%</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Commission Structure Card */}
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium text-green-800">Commission Rates</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-green-700">Direct Referrals</span>
                          <Badge className="bg-green-200 text-green-800">7.5%</Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-green-700">Level 2 Team</span>
                          <Badge className="bg-green-200 text-green-800">2%</Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-green-700">Performance Bonus</span>
                          <Badge className="bg-green-200 text-green-800">+10%</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Mobile Bottom Sheet */}
                <div className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-2xl">
                  <div className="px-4 py-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-lg font-bold text-gray-900">{userStats.level}</div>
                        <div className="text-sm text-gray-600">£{userStats.earnings} earned</div>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => setShowMobileShareSheet(true)}
                        data-testid="button-mobile-share"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Mobile Share Sheet */}
        <MobileShareSheet 
          isOpen={showMobileShareSheet}
          onOpenChange={setShowMobileShareSheet}
          referralUrl={`${window.location.origin}/signup?ref=${user?.id || 'demo123'}`}
          userStats={userStats}
          onShare={handleShare}
        />

        {/* Team Analytics Dialog */}
        <TeamAnalytics
          isOpen={showTeamAnalytics}
          onClose={() => setShowTeamAnalytics(false)}
          onRefresh={handleRefreshAnalytics}
        />

        {/* Invite Team Member Dialog */}
        <InviteTeamMember
          isOpen={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          userReferralCode={user?.id || 'demo123'}
          onInviteSuccess={handleInviteSuccess}
        />

      </div>
    </div>
  );
}