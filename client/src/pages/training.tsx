import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCapIcon,
  BookOpenIcon,
  TrophyIcon,
  HelpCircleIcon,
  PlayCircleIcon,
  CheckCircleIcon
} from "lucide-react";
import OnboardingWizard from "@/components/onboarding-wizard";
import TrainingModules from "@/components/training-modules";
import KnowledgeBase from "@/components/knowledge-base";

export default function Training() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState({
    onboardingCompleted: true,
    level: 'Bronze Partner',
    completedModules: 8,
    totalModules: 20,
    certificationsEarned: 1,
    totalPoints: 450
  });

  const handleOnboardingComplete = (data: any) => {
    console.log('Onboarding completed:', data);
    setUserProfile(prev => ({ ...prev, onboardingCompleted: true }));
    setShowOnboarding(false);
  };

  const handleModuleComplete = (moduleId: string) => {
    console.log('Module completed:', moduleId);
    setUserProfile(prev => ({
      ...prev,
      completedModules: prev.completedModules + 1,
      totalPoints: prev.totalPoints + 75
    }));
  };

  if (showOnboarding) {
    return (
      <OnboardingWizard
        onComplete={handleOnboardingComplete}
        onSkip={() => setShowOnboarding(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Partner Training Center</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master the skills you need to maximize your earning potential and build successful partnerships
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCapIcon className="w-6 h-6 text-blue-600" />
              Your Learning Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {userProfile.completedModules}/{userProfile.totalModules}
                </div>
                <div className="text-sm text-gray-600">Modules Completed</div>
                <Progress 
                  value={(userProfile.completedModules / userProfile.totalModules) * 100} 
                  className="mt-2"
                />
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {userProfile.totalPoints}
                </div>
                <div className="text-sm text-gray-600">Training Points</div>
                <Badge variant="secondary" className="mt-2">
                  {userProfile.level}
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {userProfile.certificationsEarned}
                </div>
                <div className="text-sm text-gray-600">Certifications</div>
                <div className="flex justify-center mt-2">
                  <TrophyIcon className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {userProfile.onboardingCompleted ? '✓' : '○'}
                </div>
                <div className="text-sm text-gray-600">Onboarding Status</div>
                <Badge 
                  variant={userProfile.onboardingCompleted ? "default" : "secondary"}
                  className="mt-2"
                >
                  {userProfile.onboardingCompleted ? 'Complete' : 'Pending'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Content */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-0">
            <Tabs defaultValue="modules" className="w-full">
              <div className="border-b px-6 pt-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="modules" className="flex items-center gap-2">
                    <PlayCircleIcon className="w-4 h-4" />
                    Training Modules
                  </TabsTrigger>
                  <TabsTrigger value="certifications" className="flex items-center gap-2">
                    <TrophyIcon className="w-4 h-4" />
                    Certifications
                  </TabsTrigger>
                  <TabsTrigger value="knowledge" className="flex items-center gap-2">
                    <HelpCircleIcon className="w-4 h-4" />
                    Knowledge Base
                  </TabsTrigger>
                  <TabsTrigger value="onboarding" className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" />
                    Onboarding
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="modules" className="p-6">
                <TrainingModules onModuleComplete={handleModuleComplete} />
              </TabsContent>

              <TabsContent value="certifications" className="p-6">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Partner Certifications</h3>
                    <p className="text-gray-600">
                      Earn certifications to unlock higher commission rates and exclusive benefits
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="border-green-200 bg-green-50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrophyIcon className="w-5 h-5 text-green-600" />
                          Payment Processing Specialist
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Badge className="bg-green-600">Certified</Badge>
                          <p className="text-sm text-gray-600">
                            Master payment solutions and earn 20% bonus commissions on card processing referrals
                          </p>
                          <div className="text-sm">
                            <strong>Benefits:</strong> +20% commission bonus, priority support, advanced training materials
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpenIcon className="w-5 h-5 text-blue-600" />
                          Business Funding Expert
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Badge variant="outline">3 modules remaining</Badge>
                          <p className="text-sm text-gray-600">
                            Become an expert in business funding and merchant cash advances
                          </p>
                          <div className="text-sm">
                            <strong>Requirements:</strong> Complete funding modules, pass assessment
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-200 bg-purple-50 opacity-60">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <GraduationCapIcon className="w-5 h-5 text-purple-600" />
                          Master Partner
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Badge variant="outline">Locked</Badge>
                          <p className="text-sm text-gray-600">
                            Elite certification with premium benefits and highest commission rates
                          </p>
                          <div className="text-sm">
                            <strong>Requirements:</strong> All certifications, 50+ successful referrals
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="knowledge" className="p-6">
                <KnowledgeBase />
              </TabsContent>

              <TabsContent value="onboarding" className="p-6">
                <div className="max-w-2xl mx-auto text-center space-y-6">
                  {userProfile.onboardingCompleted ? (
                    <div className="space-y-4">
                      <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto" />
                      <h3 className="text-2xl font-bold text-green-800">Onboarding Complete!</h3>
                      <p className="text-gray-600">
                        You've successfully completed the partner onboarding process. You're ready to start earning commissions!
                      </p>
                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Next Steps:</h4>
                          <ul className="text-sm text-gray-600 space-y-1 text-left">
                            <li>• Complete training modules to increase your expertise</li>
                            <li>• Submit your first referral using the referral form</li>
                            <li>• Join our partner community forum</li>
                            <li>• Schedule a call with your account manager</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <GraduationCapIcon className="w-16 h-16 text-blue-600 mx-auto" />
                      <h3 className="text-2xl font-bold">Complete Your Onboarding</h3>
                      <p className="text-gray-600">
                        Finish setting up your partner profile to unlock all features and start earning commissions
                      </p>
                      <button
                        onClick={() => setShowOnboarding(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        data-testid="button-start-onboarding"
                      >
                        Start Onboarding Process
                      </button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}