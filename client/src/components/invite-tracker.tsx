import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Send, 
  Eye, 
  MousePointer, 
  UserPlus, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  Clock,
  ArrowRight,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  Users,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

interface InviteMetrics {
  sent: number;
  opened: number;
  clicked: number;
  registered: number;
  active: number;
}

interface Invite {
  id: string;
  email: string;
  name?: string;
  status: 'sent' | 'opened' | 'clicked' | 'registered' | 'active' | 'expired';
  sentAt: Date;
  openedAt?: Date;
  clickedAt?: Date;
  registeredAt?: Date;
  activatedAt?: Date;
  source: string;
  device?: 'mobile' | 'tablet' | 'desktop';
  location?: string;
  referralCode: string;
  remindersSent: number;
  lastActivity?: Date;
}

interface InviteTrackerProps {
  invites: Invite[];
  metrics: InviteMetrics;
  isLoading?: boolean;
  onResendInvite: (id: string) => Promise<void>;
  onSendReminder: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export default function InviteTracker({ 
  invites, 
  metrics, 
  isLoading = false,
  onResendInvite, 
  onSendReminder, 
  onRefresh 
}: InviteTrackerProps) {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d");

  const funnelSteps = [
    { key: 'sent', label: 'Sent', icon: Send, value: metrics.sent, color: 'bg-blue-500' },
    { key: 'opened', label: 'Opened', icon: Eye, value: metrics.opened, color: 'bg-purple-500' },
    { key: 'clicked', label: 'Clicked', icon: MousePointer, value: metrics.clicked, color: 'bg-orange-500' },
    { key: 'registered', label: 'Registered', icon: UserPlus, value: metrics.registered, color: 'bg-green-500' },
    { key: 'active', label: 'Active', icon: CheckCircle, value: metrics.active, color: 'bg-emerald-500' }
  ];

  const getConversionRate = (current: number, previous: number) => {
    return previous > 0 ? ((current / previous) * 100).toFixed(1) : '0.0';
  };

  const getStatusIcon = (status: string, className: string = "w-4 h-4") => {
    const icons = {
      sent: Send,
      opened: Eye,
      clicked: MousePointer,
      registered: UserPlus,
      active: CheckCircle,
      expired: AlertCircle
    };
    const IconComponent = icons[status as keyof typeof icons] || Send;
    return <IconComponent className={className} />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      sent: 'bg-blue-100 text-blue-700',
      opened: 'bg-purple-100 text-purple-700',
      clicked: 'bg-orange-100 text-orange-700',
      registered: 'bg-green-100 text-green-700',
      active: 'bg-emerald-100 text-emerald-700',
      expired: 'bg-red-100 text-red-700'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getDeviceIcon = (device?: string) => {
    switch (device) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      case 'desktop': return <Monitor className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const filteredInvites = invites.filter(invite => {
    if (selectedFilter === 'all') return true;
    return invite.status === selectedFilter;
  });

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'all', label: 'All time' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Invites' },
    { value: 'sent', label: 'Sent' },
    { value: 'opened', label: 'Opened' },
    { value: 'clicked', label: 'Clicked' },
    { value: 'registered', label: 'Registered' },
    { value: 'active', label: 'Active' },
    { value: 'expired', label: 'Expired' }
  ];

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header with Refresh and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Invite Analytics</h3>
          <p className="text-gray-600">Track your invitation funnel and conversions</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
            data-testid="button-refresh-invites"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" data-testid="button-export-data">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Conversion Funnel */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Funnel Steps */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {funnelSteps.map((step, index) => {
                const IconComponent = step.icon;
                const prevStep = index > 0 ? funnelSteps[index - 1] : null;
                const conversionRate = prevStep ? getConversionRate(step.value, prevStep.value) : '100.0';
                
                return (
                  <div key={step.key} className="relative">
                    <Card className="bg-white border-2 border-gray-100">
                      <CardContent className="p-4 text-center">
                        <div className={`w-12 h-12 rounded-full ${step.color} mx-auto mb-3 flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{step.value}</div>
                        <div className="text-sm text-gray-600 mb-2">{step.label}</div>
                        {index > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {conversionRate}%
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                    
                    {/* Arrow between steps */}
                    {index < funnelSteps.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Overall Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  {getConversionRate(metrics.active, metrics.sent)}%
                </div>
                <div className="text-sm text-gray-600">Overall Conversion</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">
                  {getConversionRate(metrics.opened, metrics.sent)}%
                </div>
                <div className="text-sm text-gray-600">Open Rate</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">
                  {getConversionRate(metrics.clicked, metrics.opened)}%
                </div>
                <div className="text-sm text-gray-600">Click-through Rate</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">
                  {getConversionRate(metrics.registered, metrics.clicked)}%
                </div>
                <div className="text-sm text-gray-600">Registration Rate</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Invite Details ({filteredInvites.length})
            </CardTitle>
            <div className="flex gap-2">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-40" data-testid="select-status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-40" data-testid="select-time-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRangeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInvites.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No invites found</p>
              <p className="text-sm">Start inviting team members to see analytics here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvites.map((invite) => (
                <div 
                  key={invite.id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  data-testid={`invite-${invite.id}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {invite.name || invite.email}
                      </h4>
                      {invite.name && (
                        <p className="text-sm text-gray-600">{invite.email}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(invite.status)}>
                        {getStatusIcon(invite.status, "w-3 h-3 mr-1")}
                        {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                      </Badge>
                      {invite.status === 'sent' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSendReminder(invite.id)}
                          data-testid={`button-remind-${invite.id}`}
                        >
                          Remind
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Send className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600">
                        {formatRelativeTime(invite.sentAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Eye className={`w-4 h-4 ${invite.openedAt ? 'text-purple-500' : 'text-gray-300'}`} />
                      <span className={invite.openedAt ? 'text-gray-600' : 'text-gray-400'}>
                        {invite.openedAt ? formatRelativeTime(invite.openedAt) : 'Not opened'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MousePointer className={`w-4 h-4 ${invite.clickedAt ? 'text-orange-500' : 'text-gray-300'}`} />
                      <span className={invite.clickedAt ? 'text-gray-600' : 'text-gray-400'}>
                        {invite.clickedAt ? formatRelativeTime(invite.clickedAt) : 'Not clicked'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <UserPlus className={`w-4 h-4 ${invite.registeredAt ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={invite.registeredAt ? 'text-gray-600' : 'text-gray-400'}>
                        {invite.registeredAt ? formatRelativeTime(invite.registeredAt) : 'Not registered'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 ${invite.activatedAt ? 'text-emerald-500' : 'text-gray-300'}`} />
                      <span className={invite.activatedAt ? 'text-gray-600' : 'text-gray-400'}>
                        {invite.activatedAt ? formatRelativeTime(invite.activatedAt) : 'Not active'}
                      </span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      {getDeviceIcon(invite.device)}
                      <span>{invite.device || 'Unknown'}</span>
                    </div>
                    {invite.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{invite.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Source: {invite.source}</span>
                    </div>
                    {invite.remindersSent > 0 && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{invite.remindersSent} reminder{invite.remindersSent > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}