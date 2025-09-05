import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  UsersIcon, 
  UserPlusIcon, 
  ShieldCheckIcon, 
  CrownIcon,
  SettingsIcon,
  EyeIcon,
  EyeOffIcon,
  MailIcon,
  TrashIcon,
  CheckIcon,
  XIcon
} from "lucide-react";

export default function TeamManagement() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
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

  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ["/api/team"],
    enabled: isAuthenticated,
  });

  const { data: teamMembers, isLoading: membersLoading } = useQuery({
    queryKey: ["/api/team/members"],
    enabled: isAuthenticated,
  });

  const { data: pendingInvitations } = useQuery({
    queryKey: ["/api/team/invitations"],
    enabled: isAuthenticated,
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      return await apiRequest("/api/team/invite", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/invitations"] });
      setShowInviteDialog(false);
      setInviteEmail("");
      setInviteRole("member");
      toast({
        title: "Invitation Sent",
        description: "Team invitation has been sent successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return await apiRequest(`/api/team/members/${memberId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/members"] });
      toast({
        title: "Member Removed",
        description: "Team member has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove member",
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      return await apiRequest(`/api/team/members/${memberId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/members"] });
      toast({
        title: "Role Updated",
        description: "Team member role has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    },
  });

  const handleInvite = () => {
    if (!inviteEmail || !inviteRole) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner": return <CrownIcon className="w-4 h-4 text-yellow-600" />;
      case "admin": return <ShieldCheckIcon className="w-4 h-4 text-red-600" />;
      case "manager": return <SettingsIcon className="w-4 h-4 text-blue-600" />;
      default: return <UsersIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner": return "bg-yellow-100 text-yellow-800";
      case "admin": return "bg-red-100 text-red-800";
      case "manager": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPermissionLabel = (canSubmit: boolean, canViewCommissions: boolean, canManageTeam: boolean) => {
    if (canManageTeam) return "Full Access";
    if (canViewCommissions && canSubmit) return "Standard Access";
    if (canSubmit && !canViewCommissions) return "Submission Only";
    return "View Only";
  };

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Management</h1>
              <p className="text-gray-600">Manage your team members and their permissions</p>
            </div>
            
            {(user as any)?.canManageTeam && (
              <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <UserPlusIcon className="w-4 h-4 mr-2" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member - Submit referrals, view own commissions</SelectItem>
                          <SelectItem value="manager">Manager - Full access except team management</SelectItem>
                          <SelectItem value="admin">Admin - Full access including team management</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleInvite} 
                      disabled={inviteMutation.isPending}
                      className="w-full"
                    >
                      {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Team Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <UsersIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {teamMembers?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Team Members</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {teamMembers?.filter((m: any) => m.canSubmitReferrals).length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Can Submit</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <EyeIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {teamMembers?.filter((m: any) => m.canViewCommissions).length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Can View Commissions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <MailIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {pendingInvitations?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Pending Invites</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Team Members */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              {membersLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg">
                        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-32"></div>
                          <div className="h-3 bg-gray-300 rounded w-24"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : teamMembers && teamMembers.length > 0 ? (
                <div className="space-y-4">
                  {teamMembers.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          {member.profileImageUrl ? (
                            <img 
                              src={member.profileImageUrl} 
                              alt={member.firstName} 
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-semibold">
                              {member.firstName?.[0]}{member.lastName?.[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </h4>
                            {getRoleIcon(member.teamRole)}
                          </div>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-xs ${getRoleBadgeColor(member.teamRole)}`}>
                              {member.teamRole}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {getPermissionLabel(member.canSubmitReferrals, member.canViewCommissions, member.canManageTeam)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {(user as any)?.canManageTeam && member.id !== user?.id && (
                        <div className="flex items-center gap-2">
                          <Select 
                            value={member.teamRole} 
                            onValueChange={(role) => updateRoleMutation.mutate({ memberId: member.id, role })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMemberMutation.mutate(member.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No team members yet</p>
                  <p className="text-sm text-gray-500">Invite members to start collaborating</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Invitations */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MailIcon className="w-5 h-5" />
                Pending Invitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingInvitations && pendingInvitations.length > 0 ? (
                <div className="space-y-4">
                  {pendingInvitations.map((invitation: any) => (
                    <div key={invitation.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div>
                        <h4 className="font-medium text-gray-900">{invitation.email}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-xs ${getRoleBadgeColor(invitation.role)}`}>
                            {invitation.role}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Invited {new Date(invitation.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                          Pending
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MailIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No pending invitations</p>
                  <p className="text-sm text-gray-500">All invitations have been accepted or expired</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Permission Levels Guide */}
        <Card className="mt-8 bg-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Permission Levels Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CrownIcon className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Owner</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• All permissions</li>
                  <li>• Cannot be removed</li>
                  <li>• Team billing access</li>
                </ul>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Admin</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Manage team members</li>
                  <li>• View all commissions</li>
                  <li>• Submit referrals</li>
                </ul>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <SettingsIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Manager</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• View all commissions</li>
                  <li>• Submit referrals</li>
                  <li>• Access reports</li>
                </ul>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Member</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Submit referrals</li>
                  <li>• View own commissions</li>
                  <li>• Basic access</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}