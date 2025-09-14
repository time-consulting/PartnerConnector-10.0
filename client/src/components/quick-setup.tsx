import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, CreditCard, Clock, Star } from "lucide-react";
import { useToast } from "@/hooks/toast-disabled";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface QuickSetupData {
  firstName: string;
  lastName: string;
  phone: string;
  companyName: string;
  hasNoCompany: boolean;
  role: string;
  country: string;
}

interface QuickSetupProps {
  onComplete: (data: QuickSetupData) => void;
  onDefer?: () => void;
  initialData?: Partial<QuickSetupData>;
}

interface FieldState {
  value: string;
  saved: boolean;
  saving: boolean;
  error?: string;
}

const ROLE_OPTIONS = [
  { value: "accountant", label: "Accountant" },
  { value: "consultant", label: "Consultant" },
  { value: "advisor", label: "Advisor" },
  { value: "other", label: "Other" }
];

const COUNTRY_OPTIONS = [
  { value: "gb", label: "United Kingdom" },
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "au", label: "Australia" },
  { value: "ie", label: "Ireland" },
  { value: "other", label: "Other" }
];

export default function QuickSetup({ onComplete, onDefer, initialData }: QuickSetupProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPayoutBanner, setShowPayoutBanner] = useState(true);
  
  const [formData, setFormData] = useState<QuickSetupData>({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    phone: initialData?.phone || "",
    companyName: initialData?.companyName || "",
    hasNoCompany: initialData?.hasNoCompany || false,
    role: initialData?.role || "",
    country: initialData?.country || "gb",
  });

  const [fieldStates, setFieldStates] = useState<Record<string, FieldState>>({
    firstName: { value: "", saved: false, saving: false },
    lastName: { value: "", saved: false, saving: false },
    phone: { value: "", saved: false, saving: false },
    companyName: { value: "", saved: false, saving: false },
    role: { value: "", saved: false, saving: false },
    country: { value: "", saved: false, saving: false },
  });

  // Auto-save mutation
  const saveFieldMutation = useMutation({
    mutationFn: async ({ field, value }: { field: string; value: string }) => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const response = await fetch(`/api/auth/user`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save field');
      }
      
      return response.json();
    },
    onSuccess: (_, { field }) => {
      setFieldStates(prev => ({
        ...prev,
        [field]: { ...prev[field], saved: true, saving: false, error: undefined }
      }));
      
      // Auto-hide saved indicator after 2 seconds
      setTimeout(() => {
        setFieldStates(prev => ({
          ...prev,
          [field]: { ...prev[field], saved: false }
        }));
      }, 2000);
    },
    onError: (error, { field }) => {
      setFieldStates(prev => ({
        ...prev,
        [field]: { ...prev[field], saving: false, error: 'Save failed' }
      }));
    }
  });

  // Save complete profile mutation with backend analytics
  const saveProfileMutation = useMutation({
    mutationFn: async (data: QuickSetupData) => {
      // First save the profile data
      const profileResponse = await fetch(`/api/auth/user`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          company: data.hasNoCompany ? null : data.companyName,
          profession: data.role,
          country: data.country,
          profileCompleted: true
        })
      });
      
      if (!profileResponse.ok) {
        throw new Error('Failed to save profile');
      }
      
      // Then track the profile completion analytics
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'profile_completed',
            data: { currentXp: 0 } // Will be added to in backend
          })
        });
      } catch (analyticsError) {
        console.warn('Analytics tracking failed:', analyticsError);
      }
      
      return profileResponse.json();
    },
    onSuccess: () => {
      // Invalidate user query to refresh data including new XP
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      // Track completion locally for immediate UI updates
      localStorage.setItem('profile_submitted', Date.now().toString());
      
      // Show exact toast copy from specification
      toast({
        title: "Nice—profile set! +25 XP",
        description: "Let's show you around the platform.",
      });
      
      onComplete(formData);
    }
  });

  const handleBlur = useCallback((field: keyof QuickSetupData, value: string) => {
    if (!value.trim()) return;
    
    setFieldStates(prev => ({
      ...prev,
      [field]: { ...prev[field], saving: true, saved: false }
    }));
    
    saveFieldMutation.mutate({ field, value });
  }, [saveFieldMutation]);

  const updateField = (field: keyof QuickSetupData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFieldStates(prev => ({
      ...prev,
      [field]: { ...prev[field], value: value.toString() }
    }));
  };

  const isFormValid = () => {
    return formData.firstName.trim() && 
           formData.lastName.trim() && 
           formData.phone.trim();
  };

  const handleSubmit = () => {
    if (!isFormValid()) {
      toast({
        title: "Please complete required fields",
        description: "First name, last name, and phone are required.",
        variant: "destructive",
      });
      return;
    }

    saveProfileMutation.mutate(formData);
  };

  const handlePayoutLater = () => {
    setShowPayoutBanner(false);
    if (onDefer) onDefer();
  };

  return (
    <div className="max-w-2xl mx-auto p-6" data-testid="quick-setup">
      <Card className="shadow-lg border-2 border-blue-100">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">
            Quick Setup
          </CardTitle>
          <p className="text-sm text-gray-600">
            Just the basics to get started. Everything else is optional.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Required Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name *
                </Label>
                <div className="relative">
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    onBlur={(e) => handleBlur('firstName', e.target.value)}
                    placeholder="Enter first name"
                    className="pr-8"
                    data-testid="input-first-name"
                  />
                  {fieldStates.firstName?.saving && (
                    <div className="absolute right-2 top-2">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                    </div>
                  )}
                  {fieldStates.firstName?.saved && (
                    <div className="absolute right-2 top-2 text-green-600">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name *
                </Label>
                <div className="relative">
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    onBlur={(e) => handleBlur('lastName', e.target.value)}
                    placeholder="Enter last name"
                    className="pr-8"
                    data-testid="input-last-name"
                  />
                  {fieldStates.lastName?.saving && (
                    <div className="absolute right-2 top-2">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                    </div>
                  )}
                  {fieldStates.lastName?.saved && (
                    <div className="absolute right-2 top-2 text-green-600">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone *
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    onBlur={(e) => handleBlur('phone', e.target.value)}
                    placeholder="+44 7XXX XXX XXX"
                    className="pr-8"
                    data-testid="input-phone"
                  />
                  {fieldStates.phone?.saving && (
                    <div className="absolute right-2 top-2">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                    </div>
                  )}
                  {fieldStates.phone?.saved && (
                    <div className="absolute right-2 top-2 text-green-600">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Optional Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium text-gray-600">
                  Company Name
                </Label>
                <div className="relative">
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    onBlur={(e) => handleBlur('companyName', e.target.value)}
                    placeholder="Your company name"
                    disabled={formData.hasNoCompany}
                    className="pr-8"
                    data-testid="input-company-name"
                  />
                  {fieldStates.companyName?.saved && (
                    <div className="absolute right-2 top-2 text-green-600">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasNoCompany"
                    checked={formData.hasNoCompany}
                    onCheckedChange={(checked) => {
                      updateField('hasNoCompany', !!checked);
                      if (checked) updateField('companyName', '');
                    }}
                    data-testid="checkbox-no-company"
                  />
                  <Label htmlFor="hasNoCompany" className="text-xs text-gray-500">
                    No company yet
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Role</Label>
                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((option) => (
                    <Badge
                      key={option.value}
                      variant={formData.role === option.value ? "default" : "outline"}
                      className="cursor-pointer transition-colors hover:bg-blue-100"
                      onClick={() => {
                        updateField('role', option.value);
                        handleBlur('role', option.value);
                      }}
                      data-testid={`badge-role-${option.value}`}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
                {fieldStates.role?.saved && (
                  <div className="flex items-center text-green-600 text-xs">
                    <Check className="h-3 w-3 mr-1" />
                    Saved ✓
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Country</Label>
                <Select 
                  value={formData.country} 
                  onValueChange={(value) => {
                    updateField('country', value);
                    handleBlur('country', value);
                  }}
                >
                  <SelectTrigger data-testid="select-country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldStates.country?.saved && (
                  <div className="flex items-center text-green-600 text-xs">
                    <Check className="h-3 w-3 mr-1" />
                    Saved ✓
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payout Banner */}
          {showPayoutBanner && (
            <Alert className="border-orange-200 bg-orange-50">
              <CreditCard className="h-4 w-4 text-orange-600" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-sm text-orange-800">
                  Add payout details to get paid faster.
                </span>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 px-3 text-xs border-orange-300 text-orange-700 hover:bg-orange-100"
                    data-testid="button-add-payout"
                  >
                    Add now
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handlePayoutLater}
                    className="h-7 px-3 text-xs text-orange-600 hover:bg-orange-100"
                    data-testid="button-payout-later"
                  >
                    Later
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid() || saveProfileMutation.isPending}
              className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              data-testid="button-save-continue"
            >
              {saveProfileMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Save & continue
                </div>
              )}
            </Button>
          </div>

          {/* Progress indicator */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              {isFormValid() ? '✓ Ready to save' : 'Complete required fields to continue'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper hook for managing quick setup state
export function useQuickSetup() {
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    const profileSubmitted = localStorage.getItem('profile_submitted');
    setSetupCompleted(!!profileSubmitted);
    
    // Show setup for new users who haven't completed profile
    setShowSetup(!profileSubmitted);
  }, []);

  const completeSetup = () => {
    setShowSetup(false);
    setSetupCompleted(true);
  };

  return {
    setupCompleted,
    showSetup,
    completeSetup,
  };
}