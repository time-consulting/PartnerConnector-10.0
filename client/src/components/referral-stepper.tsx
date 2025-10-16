import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReferralSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { CheckCircle, ChevronLeft, ChevronRight, Search, AlertCircle, DollarSign, Building, Mail, Phone, Globe, Save, X, Upload, FileText, Shield } from "lucide-react";

// Form schema for the complete stepper
const stepperFormSchema = insertReferralSchema
  .omit({
    referrerId: true, // This will be set automatically on the backend from authenticated user
  })
  .extend({
    gdprConsent: z.boolean().refine(val => val === true, {
      message: "GDPR consent is required",
    }),
    selectedProducts: z.array(z.string()).min(1, {
      message: "Please select at least one service",
    }),
  });

type FormData = z.infer<typeof stepperFormSchema>;

interface ReferralStepperProps {
  businessTypes: any[];
  onSubmit: (data: FormData) => void;
  isSubmitting: boolean;
  onDraftSave?: (data: Partial<FormData>) => void;
}

// Step configuration
const steps = [
  { 
    id: 1, 
    title: "Client", 
    description: "Business details", 
    icon: "👤"
  },
  { 
    id: 2, 
    title: "Services", 
    description: "Select products", 
    icon: "🛡️"
  },
  { 
    id: 3, 
    title: "Files & Consent", 
    description: "Upload & submit", 
    icon: "📄"
  },
];

export default function ReferralStepper({ businessTypes, onSubmit, isSubmitting, onDraftSave }: ReferralStepperProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(stepperFormSchema),
    defaultValues: {
      businessName: "",
      businessEmail: "",
      businessPhone: "",
      businessAddress: "",
      businessTypeId: "",
      currentProcessor: "",
      monthlyVolume: "",
      currentRate: "",
      cardMachineQuantity: 1,
      selectedProducts: [],
      notes: "",
      gdprConsent: false,
    },
    mode: "onChange"
  });

  const watchedData = form.watch();

  // Auto-save draft every 5 seconds
  useEffect(() => {
    if (onDraftSave) {
      const interval = setInterval(() => {
        const data = form.getValues();
        onDraftSave(data);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [form, onDraftSave]);

  const validateCurrentStep = async () => {
    const values = form.getValues();
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = !!(values.businessName && values.businessEmail);
        break;
      case 2:
        isValid = values.selectedProducts.length > 0;
        break;
      case 3:
        isValid = values.gdprConsent;
        break;
      default:
        isValid = false;
    }

    return isValid;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    
    if (isValid) {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      // Trigger validation to show errors
      form.trigger();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = async (stepNumber: number) => {
    // Allow going back to completed steps or the next step
    if (stepNumber <= currentStep || completedSteps.includes(stepNumber - 1)) {
      setCurrentStep(stepNumber);
    }
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      const data = form.getValues();
      onSubmit(data);
    }
  };

  const calculateProgress = () => {
    return ((completedSteps.length + (currentStep > completedSteps.length ? 0.5 : 0)) / steps.length) * 100;
  };

  return (
    <Form {...form}>
      <div className="w-full max-w-4xl mx-auto px-4">
      {/* Mobile-First Progress Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-0">Submit New Lead</h2>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600 hidden sm:block">Progress</div>
            <div className="relative w-20 sm:w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-teal-500 to-green-600 transition-all duration-300"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
            <div className="text-sm font-medium text-gray-900">
              {Math.round(calculateProgress())}%
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Step Navigation */}
        <div className="hidden sm:flex items-center justify-between relative">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            const isClickable = step.id <= currentStep || completedSteps.includes(step.id - 1);

            return (
              <div key={step.id} className="flex-1 flex items-center">
                {/* Step Circle */}
                <div 
                  className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all cursor-pointer ${
                    isCompleted 
                      ? 'bg-teal-600 border-teal-600 text-white' 
                      : isCurrent 
                      ? 'bg-teal-500 border-teal-500 text-white' 
                      : isClickable
                      ? 'bg-white border-gray-300 text-gray-600 hover:border-teal-300'
                      : 'bg-gray-100 border-gray-200 text-gray-400'
                  }`}
                  onClick={() => isClickable && handleStepClick(step.id)}
                  data-testid={`step-circle-${step.id}`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="text-lg font-semibold">{step.id}</span>
                  )}
                </div>

                {/* Step Details */}
                <div className="ml-4 flex-1">
                  <div className={`text-sm font-medium ${
                    isCurrent ? 'text-teal-600' : 'text-gray-900'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {step.description}
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-full mx-4 ${
                    completedSteps.includes(step.id) ? 'bg-teal-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Simple Step Indicator */}
        <div className="sm:hidden">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-teal-500 text-white rounded-xl flex items-center justify-center font-semibold">
                  {steps[currentStep - 1]?.icon || currentStep}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{steps[currentStep - 1]?.title}</div>
                  <div className="text-sm text-gray-500">{steps[currentStep - 1]?.description}</div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-500">
                {currentStep} of {steps.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Content - Mobile-First Clear Boxing */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-8">
          {currentStep === 1 && (
            <ClientStep 
              form={form} 
              businessTypes={businessTypes}
              onDraftSave={onDraftSave}
            />
          )}
          {currentStep === 2 && (
            <ServicesStep 
              form={form}
            />
          )}
          {currentStep === 3 && (
            <FilesConsentStep 
              form={form}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>

      {/* Navigation Buttons - Mobile-First with Dojo Styling */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 pt-4 pb-safe mt-6 -mx-4 px-4 z-10 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center">
          {/* Previous Button */}
          <div className="order-2 sm:order-1">
            {currentStep > 1 && (
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                data-testid="button-previous"
                className="flex items-center justify-center space-x-2 w-full sm:w-auto h-12 sm:h-auto"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>
            )}
          </div>
          
          {/* Next/Submit Button - Prominent on Mobile */}
          <div className="order-1 sm:order-2">
            {currentStep < steps.length ? (
              <Button 
                onClick={handleNext}
                data-testid="button-next"
                className="flex items-center justify-center space-x-2 w-full sm:w-auto h-14 sm:h-auto text-lg sm:text-base font-semibold bg-gradient-to-r from-teal-500 to-green-600 hover:from-teal-600 hover:to-green-700 shadow-lg rounded-xl"
              >
                <span>Continue to {steps[currentStep] ? steps[currentStep].title : 'Next Step'}</span>
                <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                data-testid="button-submit"
                className="flex items-center justify-center space-x-2 w-full sm:w-auto h-16 sm:h-auto text-lg sm:text-base font-bold bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 shadow-xl transform hover:scale-105 transition-all duration-200 rounded-xl"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>🎯 Submit Referral</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        
        {/* Mobile Progress Indicator */}
        <div className="mt-4 sm:hidden">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <span>Step {currentStep} of {steps.length}</span>
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index + 1 <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </Form>
  );
}

// Step 1: Client Information Component
interface ClientStepProps {
  form: any
  businessTypes: any[]
  onDraftSave?: (data: any) => void
}

function ClientStep({ form, businessTypes, onDraftSave }: ClientStepProps) {
  const [businessLookupResults, setBusinessLookupResults] = useState<any[]>([]);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [monthlyVolume, setMonthlyVolume] = useState([50000]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  const watchedData = form.watch();

  // Handle manual draft save
  const handleSaveDraft = () => {
    if (onDraftSave) {
      const data = form.getValues();
      onDraftSave(data);
      setLastSaveTime(new Date());
    }
  };

  // Search user's existing businesses from portal
  const handleBusinessLookup = async (businessName: string) => {
    if (!businessName || businessName.length < 2) {
      setBusinessLookupResults([]);
      return;
    }

    setIsLookingUp(true);
    try {
      const response = await fetch(`/api/businesses/search?q=${encodeURIComponent(businessName)}`);
      if (response.ok) {
        const results = await response.json();
        setBusinessLookupResults(results);
      } else {
        setBusinessLookupResults([]);
      }
    } catch (error) {
      console.error('Error searching businesses:', error);
      setBusinessLookupResults([]);
    } finally {
      setIsLookingUp(false);
    }
  };

  // Handle email duplicate check (simulate)
  const handleEmailCheck = async (email: string) => {
    if (!email || !email.includes('@')) return;
    
    // Simulate duplicate check
    setTimeout(() => {
      const commonDomains = ['gmail.com', 'outlook.com', 'yahoo.com'];
      const domain = email.split('@')[1];
      if (commonDomains.includes(domain)) {
        setShowDuplicateWarning(false);
      } else {
        // Simulate 10% chance of duplicate
        setShowDuplicateWarning(Math.random() < 0.1);
      }
    }, 500);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const selectedBusinessType = businessTypes?.find(type => type.id === form.watch('businessTypeId'));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Client Information</h3>
        <p className="text-gray-600 text-sm sm:text-base">Tell us about your potential client</p>
        <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-teal-700 bg-teal-50 rounded-xl px-4 py-3 w-fit mx-auto border border-teal-100">
          <AlertCircle className="w-4 h-4" />
          <span>We'll auto-check duplicates to keep your pipeline clean</span>
        </div>
      </div>

      <div className="flex flex-col space-y-4 sm:space-y-6">
        {/* Business Details Box */}
        <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-teal-600" />
            Business Details
          </h4>
          <div className="space-y-4">
            {/* Business Name with Auto-lookup */}
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-sm font-medium text-gray-700">
                Business Name *
              </Label>
              <div className="relative">
                <Input
                  id="businessName"
                  {...form.register("businessName", {
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleBusinessLookup(e.target.value)
                  })}
                  placeholder="Start typing business name..."
                  className="pr-10 h-12 rounded-xl border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  data-testid="input-business-name"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                
                {/* Lookup Results */}
                {businessLookupResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                    {businessLookupResults.map((result, index) => (
                      <div 
                        key={index}
                        className="p-3 hover:bg-teal-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        onClick={() => {
                          form.setValue('businessName', result.businessName);
                          if (result.contactEmail) {
                            form.setValue('businessEmail', result.contactEmail);
                          }
                          if (result.contactPhone) {
                            form.setValue('businessPhone', result.contactPhone);
                          }
                          setBusinessLookupResults([]);
                        }}
                      >
                        <div className="font-medium text-gray-900">{result.businessName}</div>
                        {result.contactName && (
                          <div className="text-sm text-gray-600">{result.contactName}</div>
                        )}
                        {(result.contactEmail || result.contactPhone) && (
                          <div className="text-xs text-teal-600 mt-1">
                            {result.contactEmail || result.contactPhone}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {form.formState.errors.businessName && (
                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                  <AlertCircle className="w-4 h-4" />
                  {form.formState.errors.businessName.message}
                </p>
              )}
            </div>

            {/* Contact Email with Duplicate Check */}
            <div className="space-y-2">
              <Label htmlFor="businessEmail" className="text-sm font-medium text-gray-700">
                Contact Email *
              </Label>
              <Input
                id="businessEmail"
                type="email"
                {...form.register("businessEmail", {
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleEmailCheck(e.target.value)
                })}
                placeholder="contact@business.com"
                className={`h-12 rounded-xl border-gray-200 focus:border-teal-500 focus:ring-teal-500 ${showDuplicateWarning ? "border-orange-300 focus:ring-orange-500" : ""}`}
                data-testid="input-business-email"
              />
            {showDuplicateWarning && (
              <div className="text-orange-600 text-sm flex items-center gap-2 bg-orange-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>Similar email found in system. Please verify this is a new lead.</span>
              </div>
            )}
            {form.formState.errors.businessEmail && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {form.formState.errors.businessEmail.message}
              </p>
            )}
          </div>

          {/* Contact Phone */}
          <div className="space-y-3">
            <Label htmlFor="businessPhone" className="text-base font-semibold flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              Contact Phone
            </Label>
            <Input
              id="businessPhone"
              {...form.register("businessPhone")}
              placeholder="+44 20 1234 5678"
              data-testid="input-business-phone"
            />
          </div>

          {/* Website (Optional) */}
          <div className="space-y-3">
            <Label htmlFor="website" className="text-base font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              Website <span className="text-sm font-normal text-gray-500">(Optional)</span>
            </Label>
            <Input
              id="website"
              placeholder="https://www.business.com"
              data-testid="input-website"
            />
          </div>
        </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Business Type */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Business Type *</Label>
            <Select 
              value={form.watch('businessTypeId')} 
              onValueChange={(value) => form.setValue('businessTypeId', value)}
            >
              <SelectTrigger data-testid="select-business-type" className="h-12">
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {(businessTypes || []).map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{type.name}</span>
                      <span className="text-sm text-gray-500">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.businessTypeId && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {form.formState.errors.businessTypeId.message}
              </p>
            )}
          </div>

          {/* Monthly Card Volume Slider */}
          <div className="space-y-4">
            <Label className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              Monthly Card Volume
            </Label>
            <div className="space-y-4">
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="text-lg font-bold text-blue-600">{formatCurrency(monthlyVolume[0])}</span>
                </div>
                <Slider
                  value={monthlyVolume}
                  onValueChange={(value) => {
                    setMonthlyVolume(value);
                    form.setValue('monthlyVolume', value[0].toString());
                  }}
                  max={500000}
                  min={1000}
                  step={1000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>£1K</span>
                  <span>£500K</span>
                </div>
              </div>
              <Input
                type="number"
                value={monthlyVolume[0]}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setMonthlyVolume([value]);
                  form.setValue('monthlyVolume', value.toString());
                }}
                placeholder="Enter amount manually"
                className="text-center"
                data-testid="input-monthly-volume"
              />
            </div>
          </div>

          {/* Funding Amount (Optional) */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              Funding Amount Required <span className="text-sm font-normal text-gray-500">(Optional)</span>
            </Label>
            <Input
              type="number"
              placeholder="Enter funding amount"
              data-testid="input-funding-amount"
            />
          </div>

          {/* Business Address */}
          <div className="space-y-3">
            <Label htmlFor="businessAddress" className="text-base font-semibold">Business Address</Label>
            <Textarea
              id="businessAddress"
              {...form.register("businessAddress")}
              placeholder="Full business address"
              rows={3}
              data-testid="textarea-business-address"
            />
          </div>
        </div>
      </div>

      {/* Draft Save Section */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-2">
          <Save className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {lastSaveTime 
              ? `Last saved ${lastSaveTime.toLocaleTimeString()}`
              : "Auto-saving every 5 seconds"
            }
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSaveDraft}
          data-testid="button-save-draft"
        >
          Save Draft
        </Button>
      </div>
    </div>
  );
}

// Step 2: Services Selection Component
function ServicesStep({ form }: { form: any }) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Sync local state with form values on mount
  useEffect(() => {
    const formProducts = form.getValues('selectedProducts') || [];
    setSelectedServices(formProducts);
  }, [form]);

  const services = [
    {
      id: "card-payments",
      title: "Card Payments",
      description: "Payment processing solutions",
      commission: "£150-£5,000",
      icon: "💳"
    },
    {
      id: "business-funding",
      title: "Business Funding", 
      description: "Merchant cash advance",
      commission: "£1,000-£25,000",
      icon: "💰"
    }
  ];

  const termPreferences = [
    { id: "3-6-months", label: "3-6 months" },
    { id: "6-12-months", label: "6-12 months" },
    { id: "12-24-months", label: "12-24 months" },
    { id: "24-plus-months", label: "24+ months" }
  ];

  const urgencyLevels = [
    { id: "asap", label: "ASAP", color: "red" },
    { id: "within-week", label: "Within a week", color: "orange" },
    { id: "within-month", label: "Within a month", color: "yellow" },
    { id: "flexible", label: "Flexible", color: "green" }
  ];

  const fundingPurposes = [
    "Stock purchase",
    "Equipment upgrade", 
    "Marketing campaign",
    "Seasonal cashflow",
    "Expansion",
    "Debt consolidation",
    "Other"
  ];

  const handleServiceToggle = (serviceId: string) => {
    const newSelected = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId];
    
    setSelectedServices(newSelected);
    form.setValue('selectedProducts', newSelected);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Select Services</h3>
        <p className="text-gray-600 text-sm sm:text-base">Choose the services your client needs</p>
        <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-teal-700 bg-teal-50 rounded-xl px-4 py-3 w-fit mx-auto border border-teal-100">
          <DollarSign className="w-4 h-4" />
          <span>Commission earnings: £150 - £25,000</span>
        </div>
      </div>

      {/* Service Selection - Mobile-First Stack */}
      <div className="space-y-4">
        {services.map((service) => {
          const isSelected = selectedServices.includes(service.id);
          
          return (
            <div 
              key={service.id}
              className={`bg-white border-2 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:shadow-md ${
                isSelected 
                  ? 'border-teal-500 bg-teal-50 shadow-lg' 
                  : 'border-gray-200 hover:border-teal-300'
              }`}
              onClick={() => handleServiceToggle(service.id)}
              data-testid={`toggle-service-${service.id}`}
            >
              <div className="flex items-center space-x-4">
                <div className={`text-2xl ${isSelected ? 'scale-110' : ''} transition-transform`}>
                  {service.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{service.title}</h4>
                      <p className="text-gray-600 text-sm">{service.description}</p>
                      <p className="text-teal-600 text-sm font-medium">{service.commission}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected 
                        ? 'bg-teal-500 border-teal-500' 
                        : 'border-gray-300'
                    }`}>
                      {isSelected && <div className="w-3 h-3 bg-white rounded-full" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Step 3: Files & Consent Component
function FilesConsentStep({ form, isSubmitting }: { form: any; isSubmitting: boolean }) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string[]>([]);
  const [referralCode, setReferralCode] = useState(`REF${Date.now().toString().slice(-6)}`);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileUpload(files);
  };

  const handleFileUpload = async (files: File[]) => {
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      
      if (!validTypes.includes(file.type)) {
        alert(`File ${file.name} is not a supported format. Please upload PDF, JPG, PNG, CSV, or Excel files.`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    
    // Simulate file upload and processing
    setTimeout(() => {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      setUploadSuccess(prev => [...prev, ...validFiles.map(f => f.name)]);
      setIsUploading(false);
    }, 2000);
  };

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles(files => files.filter(f => f !== fileToRemove));
    setUploadSuccess(success => success.filter(name => name !== fileToRemove.name));
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) return '📄';
    if (file.type.includes('image')) return '🖼️';
    if (file.type.includes('spreadsheet') || file.name.includes('.xlsx')) return '📊';
    if (file.type.includes('csv')) return '📈';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Files & Consent</h3>
        <p className="text-gray-600">Upload supporting documents and complete the referral</p>
      </div>

      {/* File Upload Area */}
      <Card>
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Supporting Documents
            <span className="text-sm font-normal text-gray-500 ml-2">(Optional but recommended)</span>
          </h4>
          
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="space-y-3">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-600">Processing files...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop your files here, or 
                    <label className="text-blue-600 hover:text-blue-700 cursor-pointer underline ml-1">
                      browse
                      <input
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.csv,.xlsx"
                        data-testid="input-file-upload"
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF, JPG, PNG, CSV, or Excel files up to 10MB each
                  </p>
                </div>
                
                <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                  💡 <strong>Tip:</strong> Uploading current payment processing bills increases your win rate by 22%
                </div>
              </div>
            )}
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6 space-y-3">
              <h5 className="font-medium text-gray-900">Uploaded Files ({uploadedFiles.length})</h5>
              {uploadedFiles.map((file, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileIcon(file)}</span>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <span>{formatFileSize(file.size)}</span>
                        {uploadSuccess.includes(file.name) && (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span>Processed successfully</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(file)}
                    className="text-red-500 hover:text-red-700 p-1"
                    data-testid={`button-remove-file-${index}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optional Notes */}
      <Card>
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Additional Notes
            <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span>
          </h4>
          
          <Textarea
            {...form.register("notes")}
            placeholder="Any additional information about this client that might help with the application... (e.g., specific requirements, timeline concerns, previous discussions)"
            rows={4}
            className="w-full"
            data-testid="textarea-notes"
          />
          
          <div className="mt-3 text-xs text-gray-500 bg-blue-50 rounded-lg p-3">
            💡 <strong>Pro tip:</strong> Adding context about client needs and timeline helps our underwriters 
            process applications 40% faster
          </div>
        </CardContent>
      </Card>

      {/* Referral Code */}
      <Card>
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Referral Code</h4>
          <div className="flex items-center space-x-3">
            <Input
              value={referralCode}
              readOnly
              className="bg-gray-50 cursor-not-allowed flex-1"
              data-testid="input-referral-code"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => navigator.clipboard?.writeText(referralCode)}
              data-testid="button-copy-referral-code"
            >
              Copy
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            This unique code will be used to track your referral through the process
          </p>
        </CardContent>
      </Card>

      {/* GDPR Consent */}
      <Card className="border-2 border-blue-100">
        <CardContent className="p-6">
          <FormField
            control={form.control}
            name="gdprConsent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1"
                    data-testid="checkbox-gdpr-consent"
                  />
                </FormControl>
                <div className="space-y-1 leading-none flex-1">
                  <FormLabel className="text-base font-medium cursor-pointer">
                    I have client permission to share their details for quotes *
                  </FormLabel>
                  <p className="text-sm text-gray-600 mt-2">
                    By checking this box, you confirm that you have the client's explicit consent 
                    to share their business information with our funding partners for the purpose 
                    of obtaining competitive quotes. This ensures compliance with GDPR and data protection regulations.
                  </p>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Final Submit Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="text-center space-y-4">
          <div className="text-4xl">🎯</div>
          <div>
            <h4 className="text-lg font-bold text-gray-900">Ready to Submit!</h4>
            <p className="text-gray-600">
              Your referral will be processed within 24 hours. We'll keep you updated on progress.
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Secure Processing</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>24h Response</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}