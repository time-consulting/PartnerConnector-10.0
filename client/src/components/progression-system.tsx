import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Star, 
  Crown, 
  Shield, 
  Diamond,
  Users,
  TrendingUp,
  Target,
  Zap,
  Gift,
  Award,
  Flame,
  ChevronRight
} from "lucide-react";

interface ProgressionData {
  currentLevel: string;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  teamSize: number;
  totalInvites: number;
  successfulInvites: number;
  currentStreak: number;
  longestStreak: number;
  revenue: number;
  achievements: Achievement[];
  nextMilestone: Milestone;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress?: number;
  total?: number;
}

interface Milestone {
  name: string;
  description: string;
  progress: number;
  total: number;
  reward: string;
}

interface ProgressionSystemProps {
  data: ProgressionData;
}

export default function ProgressionSystem({ data }: ProgressionSystemProps) {
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  const levels = [
    { name: "Bronze Partner", color: "from-amber-600 to-amber-700", icon: Shield, xpRequired: 0 },
    { name: "Silver Partner", color: "from-gray-400 to-gray-600", icon: Star, xpRequired: 1000 },
    { name: "Gold Partner", color: "from-yellow-400 to-yellow-600", icon: Trophy, xpRequired: 2500 },
    { name: "Platinum Partner", color: "from-purple-400 to-purple-600", icon: Crown, xpRequired: 5000 },
    { name: "Diamond Partner", color: "from-blue-400 to-blue-600", icon: Diamond, xpRequired: 10000 }
  ];

  const getCurrentLevelIndex = () => {
    return levels.findIndex(level => level.name === data.currentLevel);
  };

  const getNextLevel = () => {
    const currentIndex = getCurrentLevelIndex();
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
  };

  const currentLevelIndex = getCurrentLevelIndex();
  const nextLevel = getNextLevel();
  const currentLevelData = levels[currentLevelIndex];
  const CurrentLevelIcon = currentLevelData.icon;

  const progressPercentage = nextLevel 
    ? ((data.currentXP - currentLevelData.xpRequired) / (nextLevel.xpRequired - currentLevelData.xpRequired)) * 100
    : 100;

  const getAchievementIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      users: Users,
      trending: TrendingUp,
      target: Target,
      zap: Zap,
      gift: Gift,
      award: Award,
      flame: Flame,
      trophy: Trophy,
      star: Star
    };
    return icons[iconName] || Award;
  };

  const recentAchievements = data.achievements
    .filter(a => a.unlockedAt)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, 3);

  const inProgressAchievements = data.achievements
    .filter(a => !a.unlockedAt && a.progress !== undefined)
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Level Progress Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentLevelData.color} flex items-center justify-center shadow-lg`}>
                <CurrentLevelIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{data.currentLevel}</h3>
                <p className="text-gray-600">{data.totalXP.toLocaleString()} XP Total</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">#{currentLevelIndex + 1}</div>
              <div className="text-sm text-gray-500">Level Rank</div>
            </div>
          </div>

          {nextLevel && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Progress to {nextLevel.name}
                </span>
                <span className="text-sm text-gray-600">
                  {data.currentXP - currentLevelData.xpRequired} / {nextLevel.xpRequired - currentLevelData.xpRequired} XP
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" data-testid="progress-level" />
              <div className="text-xs text-gray-500 text-center">
                {data.xpToNextLevel} XP to unlock {nextLevel.name}
              </div>
            </div>
          )}

          {!nextLevel && (
            <div className="text-center py-4">
              <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
              <p className="text-lg font-semibold text-gray-900">Maximum Level Reached!</p>
              <p className="text-gray-600">You've achieved the highest partner status</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-700">{data.teamSize}</p>
                <p className="text-xs text-green-600">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-700">{data.currentStreak}</p>
                <p className="text-xs text-orange-600">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-700">{data.successfulInvites}</p>
                <p className="text-xs text-purple-600">Successful</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-700">£{data.revenue.toLocaleString()}</p>
                <p className="text-xs text-blue-600">Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Milestone */}
      <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8 text-blue-600" />
              <div>
                <h4 className="font-semibold text-gray-900">{data.nextMilestone.name}</h4>
                <p className="text-sm text-gray-600">{data.nextMilestone.description}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
              {data.nextMilestone.reward}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{data.nextMilestone.progress}/{data.nextMilestone.total}</span>
            </div>
            <Progress 
              value={(data.nextMilestone.progress / data.nextMilestone.total) * 100} 
              className="h-2" 
              data-testid="progress-milestone"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAchievements.map((achievement) => {
              const AchievementIcon = getAchievementIcon(achievement.icon);
              return (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200" data-testid={`achievement-${achievement.id}`}>
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <AchievementIcon className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{achievement.name}</h5>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(achievement.unlockedAt!).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* In Progress Achievements */}
      {inProgressAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Almost There!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inProgressAchievements.map((achievement) => {
              const AchievementIcon = getAchievementIcon(achievement.icon);
              const progressPercent = achievement.total ? (achievement.progress! / achievement.total) * 100 : 0;
              
              return (
                <div key={achievement.id} className="space-y-2" data-testid={`achievement-progress-${achievement.id}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <AchievementIcon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h6 className="font-medium text-gray-900">{achievement.name}</h6>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                  <div className="ml-11">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.total}</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* View All Achievements Button */}
      <div className="text-center">
        <Button 
          variant="outline" 
          onClick={() => setShowAllAchievements(true)}
          className="w-full"
          data-testid="button-view-achievements"
        >
          View All Achievements & Badges
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}