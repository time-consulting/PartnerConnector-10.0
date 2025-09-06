import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PlayCircleIcon,
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  LockIcon,
  TrophyIcon,
  StarIcon,
  FileTextIcon,
  UsersIcon,
  TargetIcon
} from "lucide-react";

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  type: 'video' | 'interactive' | 'document' | 'quiz';
  completed: boolean;
  locked: boolean;
  progress: number;
  points: number;
  prerequisites?: string[];
}

interface TrainingModulesProps {
  onModuleComplete: (moduleId: string) => void;
}

export default function TrainingModules({ onModuleComplete }: TrainingModulesProps) {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState({
    totalPoints: 450,
    completedModules: 8,
    totalModules: 20,
    currentLevel: 'Bronze Partner',
    nextLevel: 'Silver Partner',
    pointsToNext: 550
  });

  const trainingModules: TrainingModule[] = [
    {
      id: 'getting-started',
      title: 'Getting Started with PartnerConnector',
      description: 'Learn the basics of our platform and how to start earning commissions',
      duration: '15 min',
      difficulty: 'Beginner',
      type: 'interactive',
      completed: true,
      locked: false,
      progress: 100,
      points: 50
    },
    {
      id: 'payment-processing',
      title: 'Payment Processing Solutions',
      description: 'Understand card machines, online payments, and processing rates',
      duration: '25 min',
      difficulty: 'Beginner',
      type: 'video',
      completed: true,
      locked: false,
      progress: 100,
      points: 75
    },
    {
      id: 'business-funding',
      title: 'Business Funding & Merchant Cash Advance',
      description: 'Learn about funding options and how to qualify businesses',
      duration: '30 min',
      difficulty: 'Intermediate',
      type: 'interactive',
      completed: true,
      locked: false,
      progress: 100,
      points: 100
    },
    {
      id: 'sales-techniques',
      title: 'Effective Sales Techniques',
      description: 'Master the art of consultative selling and building trust',
      duration: '35 min',
      difficulty: 'Intermediate',
      type: 'video',
      completed: false,
      locked: false,
      progress: 60,
      points: 125
    },
    {
      id: 'objection-handling',
      title: 'Overcoming Client Objections',
      description: 'Handle common objections and turn them into opportunities',
      duration: '20 min',
      difficulty: 'Intermediate',
      type: 'interactive',
      completed: false,
      locked: false,
      progress: 0,
      points: 100
    },
    {
      id: 'commission-optimization',
      title: 'Maximizing Your Commissions',
      description: 'Advanced strategies to increase your earning potential',
      duration: '40 min',
      difficulty: 'Advanced',
      type: 'video',
      completed: false,
      locked: true,
      progress: 0,
      points: 150,
      prerequisites: ['sales-techniques', 'objection-handling']
    },
    {
      id: 'compliance-legal',
      title: 'Compliance & Legal Requirements',
      description: 'Understanding regulatory requirements and best practices',
      duration: '25 min',
      difficulty: 'Intermediate',
      type: 'document',
      completed: false,
      locked: false,
      progress: 0,
      points: 75
    },
    {
      id: 'advanced-products',
      title: 'Advanced Product Knowledge',
      description: 'Deep dive into insurance, utilities, and specialized services',
      duration: '45 min',
      difficulty: 'Advanced',
      type: 'interactive',
      completed: false,
      locked: true,
      progress: 0,
      points: 175,
      prerequisites: ['payment-processing', 'business-funding']
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayCircleIcon className="w-4 h-4" />;
      case 'interactive': return <TargetIcon className="w-4 h-4" />;
      case 'document': return <FileTextIcon className="w-4 h-4" />;
      case 'quiz': return <BookOpenIcon className="w-4 h-4" />;
      default: return <BookOpenIcon className="w-4 h-4" />;
    }
  };

  const handleStartModule = (moduleId: string) => {
    setSelectedModule(moduleId);
    // In a real app, this would navigate to the module content
    setTimeout(() => {
      // Simulate module completion
      const updatedModules = trainingModules.map(module => 
        module.id === moduleId 
          ? { ...module, completed: true, progress: 100 }
          : module
      );
      onModuleComplete(moduleId);
      setUserProgress(prev => ({
        ...prev,
        completedModules: prev.completedModules + 1,
        totalPoints: prev.totalPoints + (trainingModules.find(m => m.id === moduleId)?.points || 0)
      }));
    }, 2000);
  };

  const overallProgress = (userProgress.completedModules / userProgress.totalModules) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrophyIcon className="w-6 h-6 text-yellow-600" />
            Your Training Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userProgress.completedModules}</div>
              <div className="text-sm text-muted-foreground">Modules Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{userProgress.totalPoints}</div>
              <div className="text-sm text-muted-foreground">Points Earned</div>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="text-sm">
                {userProgress.currentLevel}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">Current Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{userProgress.pointsToNext}</div>
              <div className="text-sm text-muted-foreground">Points to {userProgress.nextLevel}</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Progress</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Training Content */}
      <Tabs defaultValue="modules" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="modules">Training Modules</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-4">
          <div className="grid gap-4">
            {trainingModules.map((module) => (
              <Card 
                key={module.id} 
                className={`transition-all hover:shadow-md ${
                  module.locked ? 'opacity-60' : ''
                } ${module.completed ? 'border-green-200 bg-green-50' : ''}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          {module.completed ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                          ) : module.locked ? (
                            <LockIcon className="w-5 h-5 text-gray-400" />
                          ) : (
                            getTypeIcon(module.type)
                          )}
                          <h3 className="font-semibold text-lg">{module.title}</h3>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className={getDifficultyColor(module.difficulty)}>
                            {module.difficulty}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {module.duration}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">
                        {module.description}
                      </p>

                      {module.progress > 0 && module.progress < 100 && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{module.progress}%</span>
                          </div>
                          <Progress value={module.progress} className="w-full" />
                        </div>
                      )}

                      {module.prerequisites && (
                        <div className="mb-3">
                          <span className="text-sm text-muted-foreground">
                            Prerequisites: {module.prerequisites.join(', ')}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StarIcon className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">{module.points} points</span>
                        </div>
                        <Button
                          onClick={() => handleStartModule(module.id)}
                          disabled={module.locked}
                          variant={module.completed ? "outline" : "default"}
                          data-testid={`button-module-${module.id}`}
                        >
                          {module.completed ? 'Review' : 
                           module.progress > 0 ? 'Continue' : 'Start Module'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrophyIcon className="w-5 h-5 text-yellow-600" />
                  Partner Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Payment Processing Specialist</h4>
                      <p className="text-sm text-muted-foreground">Master payment solutions and earn 20% bonus commissions</p>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      Certified
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Business Funding Expert</h4>
                      <p className="text-sm text-muted-foreground">Complete 3 more modules to unlock this certification</p>
                    </div>
                    <Badge variant="outline">
                      In Progress
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg opacity-60">
                    <div>
                      <h4 className="font-medium">Master Partner</h4>
                      <p className="text-sm text-muted-foreground">Elite certification with premium benefits</p>
                    </div>
                    <Badge variant="outline">
                      Locked
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileTextIcon className="w-5 h-5" />
                  Sales Materials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Product Brochures & Flyers
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Commission Rate Sheets
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Client Proposal Templates
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Email Templates
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="w-5 h-5" />
                  Support & Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Partner Community Forum
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Live Support Chat
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Monthly Webinars
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Success Stories
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}