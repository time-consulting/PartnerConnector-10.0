import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  Trophy,
  Users,
  TrendingUp,
  Target,
  Calendar,
  Award,
  Star,
  Crown,
  Medal,
  Zap,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";

// Types for team analytics
interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: string;
  rank: number;
  totalInvites: number;
  activeMembers: number;
  conversionRate: number;
  totalRevenue: number;
  monthlyRevenue: number;
  joinedAt: Date;
  lastActive: Date;
  currentStreak: number;
  longestStreak: number;
  achievements: string[];
  performanceScore: number;
}

interface PerformanceMetrics {
  totalTeamMembers: number;
  totalRevenue: number;
  avgConversionRate: number;
  totalInvites: number;
  monthlyGrowth: number;
  topPerformer: string;
}

interface ChartData {
  month: string;
  revenue: number;
  invites: number;
  conversions: number;
  members: number;
}

interface TeamAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function TeamAnalytics({ isOpen, onClose, onRefresh }: TeamAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("6months");
  const [sortBy, setSortBy] = useState("revenue");

  // Mock data - would come from API in production
  const performanceMetrics: PerformanceMetrics = {
    totalTeamMembers: 12,
    totalRevenue: 28500,
    avgConversionRate: 68,
    totalInvites: 89,
    monthlyGrowth: 15.2,
    topPerformer: "Sarah Johnson",
  };

  const teamMembers: TeamMember[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@techcorp.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      level: "Platinum Partner",
      rank: 1,
      totalInvites: 25,
      activeMembers: 12,
      conversionRate: 85,
      totalRevenue: 8750,
      monthlyRevenue: 1250,
      joinedAt: new Date("2024-01-15"),
      lastActive: new Date(),
      currentStreak: 14,
      longestStreak: 21,
      achievements: ["Top Performer", "Revenue Leader", "Streak Master"],
      performanceScore: 95,
    },
    {
      id: "2",
      name: "Mike Chen",
      email: "mike@growthco.com",
      level: "Gold Partner",
      rank: 2,
      totalInvites: 18,
      activeMembers: 8,
      conversionRate: 72,
      totalRevenue: 5200,
      monthlyRevenue: 890,
      joinedAt: new Date("2024-01-20"),
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      currentStreak: 7,
      longestStreak: 14,
      achievements: ["Consistency Award", "Team Builder"],
      performanceScore: 82,
    },
    {
      id: "3",
      name: "Lisa Rodriguez",
      email: "lisa@innovatetech.com",
      level: "Gold Partner",
      rank: 3,
      totalInvites: 22,
      activeMembers: 7,
      conversionRate: 64,
      totalRevenue: 4100,
      monthlyRevenue: 720,
      joinedAt: new Date("2024-01-25"),
      lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      currentStreak: 5,
      longestStreak: 12,
      achievements: ["Rising Star", "Network Builder"],
      performanceScore: 76,
    },
    {
      id: "4",
      name: "David Park",
      email: "david@salesforce.com",
      level: "Silver Partner",
      rank: 4,
      totalInvites: 15,
      activeMembers: 6,
      conversionRate: 68,
      totalRevenue: 3200,
      monthlyRevenue: 580,
      joinedAt: new Date("2024-02-01"),
      lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      currentStreak: 3,
      longestStreak: 8,
      achievements: ["Steady Growth"],
      performanceScore: 68,
    },
    {
      id: "5",
      name: "Emma Wilson",
      email: "emma@startupco.com",
      level: "Silver Partner",
      rank: 5,
      totalInvites: 12,
      activeMembers: 5,
      conversionRate: 62,
      totalRevenue: 2800,
      monthlyRevenue: 450,
      joinedAt: new Date("2024-02-10"),
      lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      currentStreak: 1,
      longestStreak: 6,
      achievements: ["First Milestone"],
      performanceScore: 61,
    },
  ];

  const chartData: ChartData[] = [
    { month: "Jan", revenue: 12500, invites: 28, conversions: 18, members: 8 },
    { month: "Feb", revenue: 15200, invites: 35, conversions: 22, members: 10 },
    { month: "Mar", revenue: 18800, invites: 42, conversions: 28, members: 12 },
    { month: "Apr", revenue: 22100, invites: 38, conversions: 24, members: 12 },
    { month: "May", revenue: 25600, invites: 45, conversions: 31, members: 12 },
    { month: "Jun", revenue: 28500, invites: 52, conversions: 35, members: 12 },
  ];

  const conversionFunnelData = [
    { name: "Invites Sent", value: 89, color: "#3b82f6" },
    { name: "Invites Opened", value: 67, color: "#06b6d4" },
    { name: "Links Clicked", value: 52, color: "#10b981" },
    { name: "Registrations", value: 38, color: "#f59e0b" },
    { name: "Active Members", value: 32, color: "#ef4444" },
  ];

  const chartConfig = {
    revenue: {
      label: "Revenue (£)",
      color: "#10b981",
    },
    invites: {
      label: "Invites",
      color: "#3b82f6",
    },
    conversions: {
      label: "Conversions",
      color: "#f59e0b",
    },
    members: {
      label: "Active Members",
      color: "#ef4444",
    },
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "Platinum Partner":
        return <Crown className="w-4 h-4 text-purple-600" />;
      case "Gold Partner":
        return <Medal className="w-4 h-4 text-yellow-600" />;
      case "Silver Partner":
        return <Award className="w-4 h-4 text-gray-600" />;
      default:
        return <Star className="w-4 h-4 text-blue-600" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (rank === 2) return "bg-gray-100 text-gray-800 border-gray-300";
    if (rank === 3) return "bg-orange-100 text-orange-800 border-orange-300";
    return "bg-blue-100 text-blue-800 border-blue-300";
  };

  const sortedMembers = [...teamMembers].sort((a, b) => {
    switch (sortBy) {
      case "revenue":
        return b.totalRevenue - a.totalRevenue;
      case "conversions":
        return b.conversionRate - a.conversionRate;
      case "invites":
        return b.totalInvites - a.totalInvites;
      case "performance":
        return b.performanceScore - a.performanceScore;
      default:
        return a.rank - b.rank;
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-600" />
              <h2 className="text-2xl font-bold text-gray-900">Team Performance Analytics</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                data-testid="button-refresh-analytics"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                data-testid="button-download-report"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                data-testid="button-close-analytics"
              >
                ✕
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Performance Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{performanceMetrics.totalTeamMembers}</div>
                    <div className="text-sm text-gray-600">Team Members</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">£{performanceMetrics.totalRevenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold">{performanceMetrics.avgConversionRate}%</div>
                    <div className="text-sm text-gray-600">Avg Conversion</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold">+{performanceMetrics.monthlyGrowth}%</div>
                    <div className="text-sm text-gray-600">Monthly Growth</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="leaderboard" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="leaderboard" data-testid="tab-leaderboard">
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </TabsTrigger>
              <TabsTrigger value="charts" data-testid="tab-performance-charts">
                <TrendingUp className="w-4 h-4 mr-2" />
                Performance Charts
              </TabsTrigger>
              <TabsTrigger value="funnel" data-testid="tab-conversion-funnel">
                <Target className="w-4 h-4 mr-2" />
                Conversion Funnel
              </TabsTrigger>
            </TabsList>

            <TabsContent value="leaderboard" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Team Member Rankings</CardTitle>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                        data-testid="select-sort-by"
                      >
                        <option value="revenue">Sort by Revenue</option>
                        <option value="conversions">Sort by Conversion Rate</option>
                        <option value="invites">Sort by Total Invites</option>
                        <option value="performance">Sort by Performance Score</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Conversion Rate</TableHead>
                        <TableHead>Active Members</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Achievements</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedMembers.map((member, index) => (
                        <TableRow
                          key={member.id}
                          data-testid={`row-team-member-${member.id}`}
                        >
                          <TableCell>
                            <Badge className={`${getRankBadgeColor(index + 1)} border`}>
                              #{index + 1}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback>
                                  {member.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{member.name}</div>
                                <div className="text-sm text-gray-500">{member.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getLevelIcon(member.level)}
                              <span className="text-sm">{member.level}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">£{member.totalRevenue.toLocaleString()}</div>
                              <div className="text-sm text-gray-500">£{member.monthlyRevenue}/month</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium">{member.conversionRate}%</div>
                              <Progress value={member.conversionRate} className="w-16 h-2" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{member.activeMembers}</div>
                              <div className="text-sm text-gray-500">
                                {member.totalInvites} invited
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium">{member.performanceScore}</div>
                              <Progress value={member.performanceScore} className="w-16 h-2" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {member.achievements.slice(0, 2).map((achievement, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {achievement}
                                </Badge>
                              ))}
                              {member.achievements.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{member.achievements.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="charts" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue & Growth Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-80">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stackId="1"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Team Activity Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-80">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="invites" fill="#3b82f6" />
                        <Bar dataKey="conversions" fill="#f59e0b" />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Performance Metrics Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-80">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: "#10b981" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="members"
                          stroke="#ef4444"
                          strokeWidth={2}
                          dot={{ fill: "#ef4444" }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="funnel" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Conversion Funnel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-80">
                      <PieChart>
                        <Pie
                          data={conversionFunnelData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {conversionFunnelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Funnel Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {conversionFunnelData.map((stage, index) => {
                      const prevStage = conversionFunnelData[index - 1];
                      const conversionRate = prevStage
                        ? ((stage.value / prevStage.value) * 100).toFixed(1)
                        : "100.0";

                      return (
                        <div
                          key={stage.name}
                          className="flex items-center justify-between p-3 rounded-lg border"
                          data-testid={`funnel-stage-${index}`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: stage.color }}
                            />
                            <div>
                              <div className="font-medium">{stage.name}</div>
                              <div className="text-sm text-gray-500">
                                {stage.value} users ({conversionRate}%)
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">{stage.value}</div>
                            <Progress value={parseFloat(conversionRate)} className="w-20 h-2" />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}