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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CheckCircle, ChevronLeft, ChevronRight, Search, AlertCircle, DollarSign, Building, Mail, Phone, Globe, Save, X, Upload, FileText } from "lucide-react";

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
      <div className="w-full max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Submit New Lead</h2>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600">Progress</div>
            <div className="relative w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
            <div className="text-sm font-medium text-gray-900">
              {Math.round(calculateProgress())}%
            </div>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-between relative">
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
                      ? 'bg-green-600 border-green-600 text-white' 
                      : isCurrent 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : isClickable
                      ? 'bg-white border-gray-300 text-gray-600 hover:border-blue-300'
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
                    isCurrent ? 'text-blue-600' : 'text-gray-900'
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
                    completedSteps.includes(step.id) ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
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
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentStep === 1}
          data-testid="button-previous"
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>

        <div className="flex space-x-3">
          {currentStep < steps.length ? (
            <Button 
              onClick={handleNext}
              data-testid="button-next"
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              data-testid="button-submit"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Referral"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step 1: Client Information Component
interface ClientStepProps {
  form: any;
  businessTypes: any[];
  onDraftSave?: (data: any) => void;
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

  // Simulate business lookup (replace with actual API call)
  const handleBusinessLookup = async (businessName: string) => {
    if (!businessName || businessName.length < 3) {
      setBusinessLookupResults([]);
      return;
    }

    setIsLookingUp(true);
    // Simulate API delay
    setTimeout(() => {
      const mockResults = [
        { 
          name: businessName + " Ltd",
          address: "123 Business St, London, SW1A 1AA",
          website: "www." + businessName.toLowerCase().replace(/\s/g, "") + ".co.uk",
          type: "Limited Company"
        },
        {
          name: businessName + " Trading",
          address: "456 Trade Ave, Manchester, M1 1AA", 
          website: "www." + businessName.toLowerCase().replace(/\s/g, "") + "trading.com",
          type: "Sole Trader"
        }
      ];
      setBusinessLookupResults(mockResults);
      setIsLookingUp(false);
    }, 800);
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
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Client Information</h3>
        <p className="text-gray-600">Tell us about your potential client</p>
        <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-blue-600 bg-blue-50 rounded-lg px-4 py-2 w-fit mx-auto">
          <AlertCircle className="w-4 h-4" />
          <span>We'll auto-check duplicates to keep your pipeline clean</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Business Name with Auto-lookup */}
          <div className="space-y-3">
            <Label htmlFor="businessName" className="text-base font-semibold flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              Business Name *
            </Label>
            <div className="relative">
              <Input
                id="businessName"
                {...form.register("businessName", {
                  onChange: (e) => handleBusinessLookup(e.target.value)
                })}
                placeholder="Start typing business name..."
                className="pr-10"
                data-testid="input-business-name"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              
              {/* Lookup Results */}
              {businessLookupResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {businessLookupResults.map((result, index) => (
                    <div 
                      key={index}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => {
                        form.setValue('businessName', result.name);
                        form.setValue('businessAddress', result.address);
                        setBusinessLookupResults([]);
                      }}
                    >
                      <div className="font-medium text-gray-900">{result.name}</div>
                      <div className="text-sm text-gray-600">{result.address}</div>
                      <div className="text-xs text-blue-600 mt-1">{result.type}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {form.formState.errors.businessName && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {form.formState.errors.businessName.message}
              </p>
            )}
          </div>

          {/* Contact Email with Duplicate Check */}
          <div className="space-y-3">
            <Label htmlFor="businessEmail" className="text-base font-semibold flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              Contact Email *
            </Label>
            <Input
              id="businessEmail"
              type="email"
              {...form.register("businessEmail", {
                onChange: (e) => handleEmailCheck(e.target.value)
              })}
              placeholder="contact@business.com"
              className={showDuplicateWarning ? "border-orange-300 focus:ring-orange-500" : ""}
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
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [selectedFundingPurpose, setSelectedFundingPurpose] = useState("");
  const [selectedTermPreference, setSelectedTermPreference] = useState("");
  const [selectedUrgency, setSelectedUrgency] = useState("");

  const services = [
    {
      id: "card-payments",
      title: "Card Payments",
      description: "Payment processing solutions",
      commission: "£150-£5,000",
      icon: "💳",
      color: "blue"
    },
    {
      id: "business-funding",
      title: "Business Funding", 
      description: "Merchant cash advance",
      commission: "£1,000-£25,000",
      icon: "💰",
      color: "green"
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

  const isPaymentsSelected = selectedServices.includes('card-payments');
  const isFundingSelected = selectedServices.includes('business-funding');

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Services</h3>
        <p className="text-gray-600">Choose the services your client needs</p>
        <button
          onClick={() => setShowCommissionModal(true)}
          className="mt-4 text-blue-600 hover:text-blue-700 underline text-sm font-medium"
          data-testid="link-commission-modal"
        >
          How commission is calculated →
        </button>
      </div>

      {/* Service Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => {
          const isSelected = selectedServices.includes(service.id);
          
          return (
            <Card 
              key={service.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                isSelected 
                  ? `ring-2 ring-${service.color}-500 bg-${service.color}-50 border-${service.color}-200`
                  : 'hover:shadow-md border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleServiceToggle(service.id)}
              data-testid={`card-service-${service.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`text-3xl ${isSelected ? 'scale-110' : ''} transition-transform`}>
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{service.title}</h4>
                      <Checkbox 
                        checked={isSelected}
                        className="ml-2"
                        data-testid={`checkbox-service-${service.id}`}
                      />
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                    <Badge 
                      variant="secondary" 
                      className={`${isSelected ? `bg-${service.color}-100 text-${service.color}-700` : ''}`}
                    >
                      Commission: {service.commission}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Conditional Fields */}
      {(isPaymentsSelected || isFundingSelected) && (
        <div className="space-y-6 mt-8">
          {/* Card Payments Fields */}
          {isPaymentsSelected && (
            <Card>
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  💳 Card Payments Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="currentProcessor" className="text-base font-medium">
                      Current Processor
                    </Label>
                    <Input
                      id="currentProcessor"
                      {...form.register("currentProcessor")}
                      placeholder="e.g., Worldpay, Square, etc."
                      data-testid="input-current-processor"
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currentRate" className="text-base font-medium">
                      Current Processing Rate (%) 
                      <span className="text-sm font-normal text-gray-500 ml-1">(Optional)</span>
                    </Label>
                    <Input
                      id="currentRate"
                      type="number"
                      step="0.01"
                      {...form.register("currentRate")}
                      placeholder="e.g., 2.5"
                      data-testid="input-current-rate"
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium">Switch Timeline</Label>
                    <Select defaultValue="asap">
                      <SelectTrigger className="mt-2" data-testid="select-switch-timeline">
                        <SelectValue placeholder="When do they want to switch?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asap">ASAP</SelectItem>
                        <SelectItem value="within-month">Within a month</SelectItem>
                        <SelectItem value="contract-end">When contract ends</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="cardMachineQuantity" className="text-base font-medium">
                      Number of Card Machines
                    </Label>
                    <Input
                      id="cardMachineQuantity"
                      type="number"
                      {...form.register("cardMachineQuantity")}
                      min={1}
                      defaultValue={1}
                      data-testid="input-card-machine-quantity"
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Business Funding Fields */}
          {isFundingSelected && (
            <Card>
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  💰 Business Funding Details
                </h4>
                
                <div className="space-y-6">
                  {/* Funding Purpose */}
                  <div>
                    <Label className="text-base font-medium">Purpose of Funding</Label>
                    <Select 
                      value={selectedFundingPurpose}
                      onValueChange={setSelectedFundingPurpose}
                    >
                      <SelectTrigger className="mt-2" data-testid="select-funding-purpose">
                        <SelectValue placeholder="What will the funding be used for?" />
                      </SelectTrigger>
                      <SelectContent>
                        {fundingPurposes.map((purpose) => (
                          <SelectItem key={purpose} value={purpose}>
                            {purpose}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Term Preference Chips */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">Term Preference</Label>
                    <div className="flex flex-wrap gap-2">
                      {termPreferences.map((term) => (
                        <button
                          key={term.id}
                          type="button"
                          onClick={() => setSelectedTermPreference(term.id)}
                          className={`px-4 py-2 rounded-full border transition-all ${
                            selectedTermPreference === term.id
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                          data-testid={`chip-term-${term.id}`}
                        >
                          {term.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Urgency Level */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">Urgency Level</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {urgencyLevels.map((urgency) => (
                        <button
                          key={urgency.id}
                          type="button"
                          onClick={() => setSelectedUrgency(urgency.id)}
                          className={`p-3 rounded-lg border transition-all text-center ${
                            selectedUrgency === urgency.id
                              ? `bg-${urgency.color}-100 border-${urgency.color}-300 text-${urgency.color}-700`
                              : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                          data-testid={`button-urgency-${urgency.id}`}
                        >
                          <div className="text-sm font-medium">{urgency.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Commission Modal */}
      {showCommissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">How Commission is Calculated</h3>
                <button
                  onClick={() => setShowCommissionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  data-testid="button-close-commission-modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-blue-600 mb-3">💳 Card Payments Commission</h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Basic Setup:</span>
                      <span className="font-medium">£150</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Volume £0-10K/month:</span>
                      <span className="font-medium">£500</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Volume £10K-50K/month:</span>
                      <span className="font-medium">£1,500</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Volume £50K+/month:</span>
                      <span className="font-medium">£5,000</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-green-600 mb-3">💰 Business Funding Commission</h4>
                <div className="bg-green-50 rounded-lg p-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Funding £1K-10K:</span>
                      <span className="font-medium">£1,000</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Funding £10K-50K:</span>
                      <span className="font-medium">£5,000</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Funding £50K-100K:</span>
                      <span className="font-medium">£10,000</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Funding £100K+:</span>
                      <span className="font-medium">£25,000</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> Commission is paid upon successful client onboarding. 
                  Additional bonuses available for high-volume partners and milestone achievements.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Messages */}
      {form.formState.errors.selectedProducts && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {form.formState.errors.selectedProducts.message}
          </p>
        </div>
      )}
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
    </Form>
  );
}