import { useState, useEffect } from "react";
import SideNavigation from "@/components/side-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  GraduationCapIcon,
  BookOpenIcon,
  TrophyIcon,
  HelpCircleIcon,
  PlayCircleIcon,
  CheckCircleIcon,
  StarIcon,
  CreditCardIcon,
  UsersIcon,
  TargetIcon,
  PhoneIcon,
  SearchIcon,
  AwardIcon,
  ZapIcon,
  TrendingUpIcon,
  ShieldIcon,
  ClockIcon,
  ArrowRightIcon,
  MessageCircleIcon,
  CalendarIcon,
  DollarSignIcon,
  BarChartIcon,
  LightbulbIcon,
  RocketIcon,
  FlameIcon,
  CrownIcon,
  MedalIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  XIcon
} from "lucide-react";
import OnboardingWizard from "@/components/onboarding-wizard";
import TrainingModules from "@/components/training-modules";
import KnowledgeBase from "@/components/knowledge-base";
import DownloadableResources from "@/components/downloadable-resources";
import { useToast } from "@/hooks/toast-noop";
import { motion, AnimatePresence } from "framer-motion";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface TrainingStats {
  totalEarnings: number;
  completionRate: number;
  streak: number;
  rank: number;
}

export default function Training() {
  const { toast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [celebrateAchievement, setCelebrateAchievement] = useState<string | null>(null);
  
  const [userProfile, setUserProfile] = useState({
    name: "David Skeats",
    level: 'Gold Partner',
    completedModules: 15,
    totalModules: 24,
    certificationsEarned: 2,
    totalPoints: 1850,
    currentStreak: 7,
    onboardingCompleted: true,
    joinedDate: '2024-03-15',
    avatar: '/api/placeholder/40/40'
  });

  const [trainingStats, setTrainingStats] = useState<TrainingStats>({
    totalEarnings: 12450,
    completionRate: 68,
    streak: 7,
    rank: 23
  });

  const achievements: Achievement[] = [
    {
      id: 'first-module',
      title: 'First Steps',
      description: 'Complete your first training module',
      icon: <PlayCircleIcon className="w-5 h-5" />,
      unlocked: true
    },
    {
      id: 'dojo-expert',
      title: 'Dojo Expert',
      description: 'Master Dojo payment solutions',
      icon: <CreditCardIcon className="w-5 h-5" />,
      unlocked: true
    },
    {
      id: 'team-builder',
      title: 'Team Builder',
      description: 'Invite your first team member',
      icon: <UsersIcon className="w-5 h-5" />,
      unlocked: false,
      progress: 0,
      maxProgress: 1
    },
    {
      id: 'streak-master',
      title: 'Streak Master',
      description: 'Maintain a 7-day learning streak',
      icon: <FlameIcon className="w-5 h-5" />,
      unlocked: true
    },
    {
      id: 'high-earner',
      title: 'High Earner',
      description: 'Earn over £10,000 in commissions',
      icon: <CrownIcon className="w-5 h-5" />,
      unlocked: true
    },
    {
      id: 'mentor',
      title: 'Mentor',
      description: 'Help 5 team members succeed',
      icon: <AwardIcon className="w-5 h-5" />,
      unlocked: false,
      progress: 2,
      maxProgress: 5
    }
  ];

  const handleOnboardingComplete = (data: any) => {
    console.log('Onboarding completed:', data);
    setUserProfile(prev => ({ ...prev, onboardingCompleted: true }));
    setShowOnboarding(false);
    toast({
      title: "🎉 Welcome to PartnerConnector!",
      description: "Your onboarding is complete. Let's start earning commissions together!",
    });
  };

  const handleModuleComplete = (moduleId: string) => {
    console.log('Module completed:', moduleId);
    setUserProfile(prev => ({
      ...prev,
      completedModules: prev.completedModules + 1,
      totalPoints: prev.totalPoints + 100,
      currentStreak: prev.currentStreak + 1
    }));
    
    // Show celebration animation
    setCelebrateAchievement(moduleId);
    setTimeout(() => setCelebrateAchievement(null), 3000);
    
    toast({
      title: "🎉 Module Complete!",
      description: "+100 points earned! Keep up the great work!",
    });
  };

  const calculateNextLevel = () => {
    const levels = [
      { name: 'Bronze Partner', points: 0, color: 'text-orange-600' },
      { name: 'Silver Partner', points: 500, color: 'text-gray-600' },
      { name: 'Gold Partner', points: 1500, color: 'text-yellow-600' },
      { name: 'Platinum Partner', points: 3000, color: 'text-purple-600' },
      { name: 'Master Partner', points: 5000, color: 'text-blue-600' }
    ];
    
    const currentLevel = levels.find(level => 
      userProfile.totalPoints >= level.points && 
      userProfile.totalPoints < (levels[levels.indexOf(level) + 1]?.points || Infinity)
    ) || levels[0];
    
    const nextLevel = levels[levels.indexOf(currentLevel) + 1];
    return { currentLevel, nextLevel };
  };

  const { currentLevel, nextLevel } = calculateNextLevel();

  useEffect(() => {
    // Simulate achievement unlock animations
    const timer = setTimeout(() => {
      if (celebrateAchievement) {
        setCelebrateAchievement(null);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [celebrateAchievement]);

  if (showOnboarding) {
    return (
      <OnboardingWizard
        onComplete={handleOnboardingComplete}
        onSkip={() => setShowOnboarding(false)}
      />
    );
  }

  const progressPercentage = (userProfile.completedModules / userProfile.totalModules) * 100;
  const nextLevelProgress = nextLevel ? 
    ((userProfile.totalPoints - currentLevel.points) / (nextLevel.points - currentLevel.points)) * 100 : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <SideNavigation />
      
      {/* Achievement Celebration Modal */}
      {celebrateAchievement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="achievement-modal">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center max-w-md mx-4 shadow-2xl">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Achievement Unlocked!</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Module completed successfully</p>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              +100 Points Earned!
            </Badge>
            <Button 
              onClick={() => setCelebrateAchievement(null)}
              className="mt-4"
              data-testid="close-achievement-modal"
            >
              <XIcon className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      )}

      <div className="lg:ml-16 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Enhanced Header with User Profile */}
          <div className="text-center space-y-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-left">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                    <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                      {userProfile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      Welcome back, {userProfile.name.split(' ')[0]}! 👋
                    </h1>
                    <div className="flex items-center gap-3">
                      <Badge className={`${currentLevel.color} bg-opacity-10 border-current font-semibold px-3 py-1`}>
                        <CrownIcon className="w-4 h-4 mr-1" />
                        {currentLevel.name}
                      </Badge>
                      <div className="flex items-center gap-1 text-orange-600">
                        <FlameIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{userProfile.currentStreak} day streak</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                  Continue your learning journey and unlock higher earnings. You're {progressPercentage.toFixed(0)}% complete!
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <DollarSignIcon className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">£{trainingStats.totalEarnings.toLocaleString()}</div>
                    <div className="text-sm opacity-90">Total Earned</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <TrophyIcon className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">#{trainingStats.rank}</div>
                    <div className="text-sm opacity-90">Leaderboard</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <StarIcon className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{userProfile.totalPoints}</div>
                    <div className="text-sm opacity-90">Points</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <BarChartIcon className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{trainingStats.completionRate}%</div>
                    <div className="text-sm opacity-90">Complete</div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Progress Overview */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Learning Progress</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {userProfile.completedModules}/{userProfile.totalModules} modules
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-3 mb-4" />
                  
                  {nextLevel && (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          Progress to {nextLevel.name}
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {userProfile.totalPoints}/{nextLevel.points} points
                        </span>
                      </div>
                      <Progress value={nextLevelProgress} className="h-2" />
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => setActiveSection('modules')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                    data-testid="button-continue-learning"
                  >
                    <PlayCircleIcon className="w-4 h-4 mr-2" />
                    Continue Learning
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveSection('achievements')}
                    className="border-2 hover:bg-gray-50 dark:hover:bg-slate-700"
                    data-testid="button-view-achievements"
                  >
                    <AwardIcon className="w-4 h-4 mr-2" />
                    Achievements
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-2"
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: <BarChartIcon className="w-4 h-4" /> },
                { id: 'product-training', label: 'Product Training', icon: <CreditCardIcon className="w-4 h-4" /> },
                { id: 'platform-training', label: 'Platform Training', icon: <UsersIcon className="w-4 h-4" /> },
                { id: 'usage-training', label: 'Usage Training', icon: <BookOpenIcon className="w-4 h-4" /> },
                { id: 'support', label: 'Support Hub', icon: <HelpCircleIcon className="w-4 h-4" /> },
                { id: 'achievements', label: 'Achievements', icon: <TrophyIcon className="w-4 h-4" /> }
              ].map((section) => (
                <Button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  variant={activeSection === section.id ? 'default' : 'ghost'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    activeSection === section.id 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                      : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                  data-testid={`nav-${section.id}`}
                >
                  {section.icon}
                  <span className="hidden lg:inline">{section.label}</span>
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Main Content Area */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Dashboard View */}
            {activeSection === 'dashboard' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Progress Overview */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <RocketIcon className="w-6 h-6 text-blue-600" />
                        Your Learning Journey
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {userProfile.completedModules}/{userProfile.totalModules}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Modules</div>
                        </div>
                        
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {userProfile.totalPoints}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Points</div>
                        </div>
                        
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                          <div className="text-2xl font-bold text-purple-600 mb-1">
                            {userProfile.certificationsEarned}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Certificates</div>
                        </div>
                        
                        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                          <div className="text-2xl font-bold text-orange-600 mb-1">
                            {userProfile.currentStreak}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Day Streak</div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Module Progress</span>
                            <span className="text-sm text-gray-600">{progressPercentage.toFixed(0)}%</span>
                          </div>
                          <Progress value={progressPercentage} className="h-3" />
                        </div>
                        
                        {nextLevel && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Next Level: {nextLevel.name}</span>
                              <span className="text-sm text-gray-600">{nextLevelProgress.toFixed(0)}%</span>
                            </div>
                            <Progress value={nextLevelProgress} className="h-2" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Quick Actions */}
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ZapIcon className="w-6 h-6 text-yellow-500" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                          onClick={() => setActiveSection('product-training')}
                          className="h-20 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex flex-col gap-2"
                          data-testid="quick-product-training"
                        >
                          <CreditCardIcon className="w-6 h-6" />
                          <span className="text-sm font-medium">Learn Dojo Payments</span>
                        </Button>
                        
                        <Button
                          onClick={() => setActiveSection('platform-training')}
                          className="h-20 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex flex-col gap-2"
                          data-testid="quick-platform-training"
                        >
                          <UsersIcon className="w-6 h-6" />
                          <span className="text-sm font-medium">Build Your Team</span>
                        </Button>
                        
                        <Button
                          onClick={() => setActiveSection('support')}
                          className="h-20 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white flex flex-col gap-2"
                          data-testid="quick-support"
                        >
                          <HelpCircleIcon className="w-6 h-6" />
                          <span className="text-sm font-medium">Get Support</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Achievements Sidebar */}
                <div className="space-y-6">
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AwardIcon className="w-6 h-6 text-yellow-500" />
                        Recent Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {achievements.filter(a => a.unlocked).slice(0, 4).map((achievement) => (
                          <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white">
                              {achievement.icon}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{achievement.title}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">{achievement.description}</div>
                            </div>
                          </div>
                        ))}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveSection('achievements')}
                          className="w-full mt-4"
                          data-testid="view-all-achievements"
                        >
                          View All Achievements
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Leaderboard */}
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrophyIcon className="w-6 h-6 text-gold-500" />
                        This Month's Leaders
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { name: 'Sarah Mitchell', points: 2850, rank: 1 },
                          { name: 'Marcus Thompson', points: 2650, rank: 2 },
                          { name: 'You', points: userProfile.totalPoints, rank: trainingStats.rank },
                          { name: 'Emma Wilson', points: 1680, rank: 4 },
                        ].map((leader, index) => (
                          <div key={index} className={`flex items-center gap-3 p-2 rounded ${leader.name === 'You' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              leader.rank === 1 ? 'bg-yellow-500 text-white' :
                              leader.rank === 2 ? 'bg-gray-400 text-white' :
                              leader.rank === 3 ? 'bg-orange-500 text-white' :
                              'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300'
                            }`}>
                              {leader.rank}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{leader.name}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">{leader.points.toLocaleString()} points</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            {/* Product Training Section */}
            {activeSection === 'product-training' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCardIcon className="w-6 h-6 text-blue-600" />
                      Dojo Card Payments Training
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-300">
                      Master our flagship payment processing partner and unlock premium commissions
                    </p>
                  </CardHeader>
                  <CardContent>
                    <TrainingModules onModuleComplete={handleModuleComplete} />
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* Platform Training Section */}
            {activeSection === 'platform-training' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UsersIcon className="w-6 h-6 text-green-600" />
                      Platform & Team Building Training
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-300">
                      Learn how to build your partner network and maximize commission potential
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Commission Structure */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold mb-4">Commission Structure</h3>
                        
                        <div className="space-y-3">
                          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                  L1
                                </div>
                                <div>
                                  <div className="font-bold text-blue-900 dark:text-blue-100">Level 1 Partner</div>
                                  <div className="text-sm text-blue-700 dark:text-blue-300">Direct referrals</div>
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-blue-600 mb-2">60% Commission</div>
                              <div className="text-sm text-blue-700 dark:text-blue-300">
                                Earn 60% on all direct client referrals
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                                  L2
                                </div>
                                <div>
                                  <div className="font-bold text-green-900 dark:text-green-100">Level 2 Team</div>
                                  <div className="text-sm text-green-700 dark:text-green-300">Invited partners</div>
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-green-600 mb-2">20% Override</div>
                              <div className="text-sm text-green-700 dark:text-green-300">
                                Earn 20% on team members you invite
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                  L3
                                </div>
                                <div>
                                  <div className="font-bold text-purple-900 dark:text-purple-100">Extended Network</div>
                                  <div className="text-sm text-purple-700 dark:text-purple-300">Team's referrals</div>
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-purple-600 mb-2">10% Override</div>
                              <div className="text-sm text-purple-700 dark:text-purple-300">
                                Earn 10% on your team's invites
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                      
                      {/* Commission Calculator */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold mb-4">Earnings Calculator</h3>
                        
                        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200">
                          <CardContent className="p-6">
                            <h4 className="font-bold mb-4">Monthly Potential Example:</h4>
                            
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between items-center py-2 border-b border-yellow-200">
                                <span>5 Direct Clients (£800 each)</span>
                                <span className="font-bold text-green-600">£2,400</span>
                              </div>
                              
                              <div className="flex justify-between items-center py-2 border-b border-yellow-200">
                                <span>3 Team Members (£500 each override)</span>
                                <span className="font-bold text-green-600">£300</span>
                              </div>
                              
                              <div className="flex justify-between items-center py-2 border-b border-yellow-200">
                                <span>Team's 10 Clients (£80 each override)</span>
                                <span className="font-bold text-green-600">£800</span>
                              </div>
                              
                              <div className="flex justify-between items-center py-3 border-t-2 border-yellow-300 font-bold text-lg">
                                <span>Total Monthly Earnings</span>
                                <span className="text-green-600">£3,500</span>
                              </div>
                            </div>
                            
                            <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
                              💡 <strong>Pro Tip:</strong> Build a team of 5+ active partners to achieve consistent 4-figure monthly earnings
                            </div>
                          </CardContent>
                        </Card>
                        
                        <div className="flex flex-col gap-3">
                          <Button
                            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                            data-testid="button-invite-team-member"
                          >
                            <UsersIcon className="w-4 h-4 mr-2" />
                            Invite Your First Team Member
                          </Button>
                          
                          <Button
                            variant="outline"
                            data-testid="button-commission-calculator"
                          >
                            <BarChartIcon className="w-4 h-4 mr-2" />
                            Full Commission Calculator
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* Usage Training Section */}
            {activeSection === 'usage-training' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpenIcon className="w-6 h-6 text-purple-600" />
                      Platform Usage Training
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-300">
                      Master the PartnerConnector platform with step-by-step guides
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        {
                          title: 'Deal Submission Process',
                          description: 'Learn how to submit and track client referrals',
                          icon: <TargetIcon className="w-6 h-6" />,
                          steps: ['Client Discovery', 'Information Gathering', 'Submission', 'Follow-up'],
                          duration: '15 min'
                        },
                        {
                          title: 'Dashboard Navigation',
                          description: 'Master all dashboard features and reports',
                          icon: <BarChartIcon className="w-6 h-6" />,
                          steps: ['Overview Stats', 'Referral Tracking', 'Commission Reports', 'Team Management'],
                          duration: '12 min'
                        },
                        {
                          title: 'Payment & Commission Collection',
                          description: 'Understand how and when you get paid',
                          icon: <DollarSignIcon className="w-6 h-6" />,
                          steps: ['Payment Schedule', 'Bank Setup', 'Tax Information', 'Payment History'],
                          duration: '10 min'
                        },
                        {
                          title: 'Team Management System',
                          description: 'Build and manage your partner network',
                          icon: <UsersIcon className="w-6 h-6" />,
                          steps: ['Send Invitations', 'Track Team Performance', 'Support Team Members', 'Override Tracking'],
                          duration: '18 min'
                        }
                      ].map((module, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white">
                                {module.icon}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold mb-2">{module.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{module.description}</p>
                                
                                <div className="space-y-2 mb-4">
                                  {module.steps.map((step, stepIndex) => (
                                    <div key={stepIndex} className="flex items-center gap-2 text-sm">
                                      <div className="w-6 h-6 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                                        {stepIndex + 1}
                                      </div>
                                      <span>{step}</span>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline" className="text-xs">
                                    <ClockIcon className="w-3 h-3 mr-1" />
                                    {module.duration}
                                  </Badge>
                                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                                    Start Module
                                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* Support Hub Section */}
            {activeSection === 'support' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Contact Methods */}
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PhoneIcon className="w-6 h-6 text-green-600" />
                        Get Support
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white" data-testid="button-book-call">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Book Support Call
                      </Button>
                      
                      <Button variant="outline" className="w-full" data-testid="button-live-chat">
                        <MessageCircleIcon className="w-4 h-4 mr-2" />
                        Start Live Chat
                      </Button>
                      
                      <div className="text-center space-y-2">
                        <div className="text-sm font-medium">Direct Contact</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">support@partnerconnector.co.uk</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">0203 9876 543</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Search Help */}
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <SearchIcon className="w-6 h-6 text-blue-600" />
                        Search Help
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Input
                          placeholder="Search help articles..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="mb-4"
                          data-testid="input-search-help"
                        />
                        
                        <div className="space-y-2">
                          <div className="text-sm font-medium mb-2">Popular Searches:</div>
                          {['Commission payments', 'Team invitations', 'Dojo setup', 'Referral tracking'].map((term, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              className="text-left justify-start w-full h-auto py-2 px-3 text-sm"
                              onClick={() => setSearchQuery(term)}
                            >
                              {term}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Quick Links */}
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LightbulbIcon className="w-6 h-6 text-yellow-600" />
                        Quick Help
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { title: 'Getting Started Guide', icon: <BookOpenIcon className="w-4 h-4" /> },
                          { title: 'Commission FAQ', icon: <HelpCircleIcon className="w-4 h-4" /> },
                          { title: 'Technical Issues', icon: <ShieldIcon className="w-4 h-4" /> },
                          { title: 'Account Settings', icon: <UsersIcon className="w-4 h-4" /> }
                        ].map((link, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            className="w-full justify-start text-left h-auto py-3"
                            data-testid={`quick-help-${index}`}
                          >
                            {link.icon}
                            <span className="ml-3">{link.title}</span>
                            <ChevronRightIcon className="w-4 h-4 ml-auto" />
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Enhanced Knowledge Base */}
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 shadow-xl">
                  <CardContent className="p-6">
                    <KnowledgeBase />
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* Achievements Section */}
            {activeSection === 'achievements' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrophyIcon className="w-6 h-6 text-yellow-600" />
                      Achievements & Progress
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-300">
                      Track your accomplishments and unlock new opportunities
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {achievements.map((achievement) => (
                        <Card
                          key={achievement.id}
                          className={`relative overflow-hidden ${
                            achievement.unlocked
                              ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-900/20 dark:to-orange-900/20'
                              : 'bg-gray-50 border-gray-200 dark:bg-slate-700/50 dark:border-slate-600 opacity-60'
                          }`}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                achievement.unlocked
                                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                                  : 'bg-gray-300 text-gray-500 dark:bg-slate-600 dark:text-slate-400'
                              }`}>
                                {achievement.icon}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold mb-2">{achievement.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{achievement.description}</p>
                                
                                {achievement.unlocked ? (
                                  <Badge className="bg-green-600 text-white">
                                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                                    Unlocked
                                  </Badge>
                                ) : (
                                  achievement.progress !== undefined && achievement.maxProgress && (
                                    <div className="space-y-2">
                                      <div className="text-xs text-gray-600 dark:text-gray-400">
                                        Progress: {achievement.progress}/{achievement.maxProgress}
                                      </div>
                                      <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                            
                            {achievement.unlocked && (
                              <div className="absolute top-2 right-2">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <CheckCircleIcon className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="mt-8 text-center">
                      <div className="text-lg font-bold mb-2">Achievement Progress</div>
                      <div className="text-3xl font-bold text-blue-600 mb-4">
                        {achievements.filter(a => a.unlocked).length}/{achievements.length} Completed
                      </div>
                      <Progress 
                        value={(achievements.filter(a => a.unlocked).length / achievements.length) * 100} 
                        className="max-w-md mx-auto h-4" 
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}