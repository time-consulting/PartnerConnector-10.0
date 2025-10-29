import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Network, 
  Users, 
  User, 
  Crown, 
  Target,
  TrendingUp,
  DollarSign,
  Plus,
  Minus,
  Eye,
  ChevronDown,
  ChevronRight,
  Building,
  ArrowUp,
  ArrowDown
} from "lucide-react";

interface MlmNode {
  id: string;
  name: string;
  email: string;
  partnerId: string;
  level: number;
  children: MlmNode[];
  totalReferrals: number;
  totalCommissions: number;
  parentPartnerId?: string;
}

interface MlmVisualizationProps {
  userId?: string;
  showFullTree?: boolean;
}

export default function MlmVisualization({ userId, showFullTree = false }: MlmVisualizationProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [focusedUserId, setFocusedUserId] = useState<string | null>(null);

  // Fetch MLM hierarchy data
  const { data: hierarchyData, isLoading } = useQuery<{
    tree: MlmNode;
    stats: {
      totalLevels: number;
      totalUsers: number;
      levelDistribution: { [key: number]: number };
    };
  }>({
    queryKey: ['/api/admin/mlm-hierarchy', userId],
    enabled: !!userId,
  });

  // Fetch all users for the selector
  const { data: allUsers = [] } = useQuery<Array<{id: string, name: string, partnerId: string}>>({
    queryKey: ['/api/admin/users/list'],
  });

  // Fetch personal tree for focused user (upline + downline)
  const { data: personalTree, isLoading: isLoadingPersonal } = useQuery<{
    upline: Array<{id: string, name: string, partnerId: string, level: number}>;
    user: {id: string, name: string, partnerId: string, email: string};
    downline: MlmNode;
  }>({
    queryKey: ['/api/admin/mlm-personal-tree', focusedUserId],
    enabled: !!focusedUserId,
  });

  const { data: userDetails } = useQuery<any>({
    queryKey: ['/api/admin/user-details', selectedNode],
    enabled: !!selectedNode,
  });

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800 border-green-200';
      case 2: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 3: return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCommissionPercentage = (level: number) => {
    switch (level) {
      case 1: return '60%';
      case 2: return '20%';
      case 3: return '10%';
      default: return '0%';
    }
  };

  const renderNode = (node: MlmNode, depth = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="ml-0" style={{ marginLeft: depth * 24 }}>
        <div className={`border rounded-lg p-4 mb-2 transition-all duration-200 hover:shadow-md ${
          selectedNode === node.id ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(node.id)}
                  className="p-1 h-6 w-6"
                  data-testid={`button-expand-${node.id}`}
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
              )}
              
              <div className="flex items-center gap-2">
                {depth === 0 ? <Crown className="w-5 h-5 text-yellow-600" /> : <User className="w-5 h-5 text-gray-500" />}
                <div>
                  <h4 className="font-semibold text-gray-900">{node.name}</h4>
                  <p className="text-sm text-gray-500">{node.partnerId}</p>
                </div>
              </div>

              <Badge className={`${getLevelColor(node.level)} border font-medium`}>
                Level {node.level} ({getCommissionPercentage(node.level)})
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Building className="w-4 h-4" />
                  <span>{node.totalReferrals} referrals</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-green-700">
                  <DollarSign className="w-4 h-4" />
                  <span>£{node.totalCommissions}</span>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedNode(node.id)}
                    data-testid={`button-view-details-${node.id}`}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]" data-testid={`modal-user-details-${node.id}`}>
                  <DialogHeader>
                    <DialogTitle>Partner Details - {node.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Partner ID</label>
                        <p className="font-semibold">{node.partnerId}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="font-semibold">{node.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">MLM Level</label>
                        <div className="flex items-center gap-2">
                          <Badge className={getLevelColor(node.level)}>
                            Level {node.level}
                          </Badge>
                          <span className="text-sm text-gray-600">({getCommissionPercentage(node.level)} commission)</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Team Size</label>
                        <p className="font-semibold">{node.children?.length || 0} direct partners</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Total Referrals</label>
                        <p className="font-semibold text-blue-700">{node.totalReferrals}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Total Commissions</label>
                        <p className="font-semibold text-green-700">£{node.totalCommissions}</p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {hasChildren && (
            <div className="mt-2 text-sm text-gray-600">
              <span>{node.children.length} direct partner{node.children.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-6">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Network className="w-6 h-6 text-purple-600" />
            MLM Network Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 bg-gray-200 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="space-y-1">
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-8"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hierarchyData) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Network className="w-6 h-6 text-purple-600" />
            MLM Network Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Network className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No MLM Data Found</h3>
            <p className="text-gray-600">Unable to load the MLM network structure.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <Network className="w-6 h-6 text-purple-600" />
            MLM Network Structure
          </CardTitle>
          
          {/* User Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">View Personal Tree:</label>
            <Select value={focusedUserId || ""} onValueChange={(val) => setFocusedUserId(val || null)}>
              <SelectTrigger className="w-[250px]" data-testid="select-user-tree">
                <SelectValue placeholder="Select a partner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Full Network Tree</SelectItem>
                {allUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.partnerId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tree" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tree" data-testid="tab-tree-view">
              {focusedUserId ? 'Personal Tree' : 'Full Tree View'}
            </TabsTrigger>
            <TabsTrigger value="stats" data-testid="tab-stats-view">Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tree" className="mt-6">
            {focusedUserId && personalTree ? (
              <div className="space-y-6">
                {/* Upline Section */}
                {personalTree.upline.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <ArrowUp className="w-5 h-5 text-blue-600" />
                      Upline (Who Referred Them)
                    </h3>
                    <div className="space-y-2 pl-4 border-l-4 border-blue-300">
                      {personalTree.upline.map((parent, index) => (
                        <Card key={parent.id} className="bg-blue-50 border-blue-200">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-blue-500">
                                  Level {parent.level}
                                </Badge>
                                <div>
                                  <div className="font-medium text-sm">{parent.name}</div>
                                  <div className="text-xs text-gray-500">{parent.partnerId}</div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setFocusedUserId(parent.id)}
                                data-testid={`button-view-upline-${parent.id}`}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View Tree
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current User */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-600" />
                    Current Partner
                  </h3>
                  <Card className="bg-purple-50 border-purple-300 border-2">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Crown className="w-6 h-6 text-purple-600" />
                        <div>
                          <div className="font-bold text-lg">{personalTree.user.name}</div>
                          <div className="text-sm text-gray-600">{personalTree.user.partnerId}</div>
                          <div className="text-xs text-gray-500">{personalTree.user.email}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Downline Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <ArrowDown className="w-5 h-5 text-green-600" />
                    Downline (People They Referred)
                  </h3>
                  {personalTree.downline && personalTree.downline.children && personalTree.downline.children.length > 0 ? (
                    <div className="space-y-2 pl-4 border-l-4 border-green-300 max-h-96 overflow-y-auto">
                      {personalTree.downline.children.map(child => renderNode(child))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No downline yet</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {hierarchyData?.tree && renderNode(hierarchyData.tree)}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="stats" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Total Partners</h3>
                </div>
                <p className="text-2xl font-bold text-blue-700">{hierarchyData.stats.totalUsers}</p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Total Levels</h3>
                </div>
                <p className="text-2xl font-bold text-green-700">{hierarchyData.stats.totalLevels}</p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-900">Network Depth</h3>
                </div>
                <p className="text-2xl font-bold text-purple-700">{hierarchyData.stats.totalLevels}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Level Distribution</h3>
              <div className="space-y-2">
                {Object.entries(hierarchyData.stats.levelDistribution).map(([level, count]) => (
                  <div key={level} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge className={getLevelColor(parseInt(level))}>
                        Level {level}
                      </Badge>
                      <span className="text-sm text-gray-600">({getCommissionPercentage(parseInt(level))} commission)</span>
                    </div>
                    <span className="font-semibold text-gray-900">{count} partner{count !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setExpandedNodes(new Set(Object.keys(hierarchyData.tree)))}
            data-testid="button-expand-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Expand All
          </Button>
          <Button
            variant="outline"
            onClick={() => setExpandedNodes(new Set())}
            data-testid="button-collapse-all"
          >
            <Minus className="w-4 h-4 mr-2" />
            Collapse All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}