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
import { CheckCircle, ChevronLeft, ChevronRight, Search, AlertCircle, DollarSign, Building, Mail, Phone, Globe, Save, X, Upload, FileText, Shield, User } from "lucide-react";

// Form schema for the complete stepper
const stepperFormSchema = insertReferralSchema
  .omit({
    referrerId: true, // This will be set automatically on the backend from authenticated user
  })
  .extend({
    contactName: z.string().min(1, "Contact name is required"),
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
    title: "Contact", 
    description: "Basic info", 
    icon: "👤"
  },
  { 
    id: 2, 
    title: "Business", 
    description: "Details", 
    icon: "🏢"
  },
  { 
    id: 3, 
    title: "Review", 
    description: "Submit", 
    icon: "✓"
  },
];

export default function ReferralStepper({ businessTypes, onSubmit, isSubmitting, onDraftSave }: ReferralStepperProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(stepperFormSchema),
    defaultValues: {
      businessName: "",
      contactName: "",
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
        // Step 1: Contact info - business name, contact name, email, phone (at least one), product interest
        isValid = !!(values.businessName && values.contactName && values.businessEmail && values.selectedProducts.length > 0);
        break;
      case 2:
        // Step 2: Business details - business type and monthly volume
        isValid = !!(values.businessTypeId && values.monthlyVolume);
        break;
      case 3:
        // Step 3: Review and consent
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
            <ContactStep 
              form={form}
            />
          )}
          {currentStep === 2 && (
            <BusinessStep 
              form={form}
              businessTypes={businessTypes}
            />
          )}
          {currentStep === 3 && (
            <ReviewConsentStep 
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

// Step 1: Contact Capture (Simple & Clean)
interface ContactStepProps {
  form: any
}

function ContactStep({ form }: ContactStepProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>(form.watch('selectedProducts') || []);

  const productOptions = [
    {
      id: "dojo-card-payments",
      name: "Dojo Card Payments",
      description: "Modern payment processing solutions",
      icon: "💳",
      color: "teal"
    },
    {
      id: "business-funding",
      name: "Business Funding",
      description: "Fast business loans & financing",
      icon: "💰",
      color: "green"
    }
  ];

  const toggleProduct = (productId: string) => {
    const updated = selectedProducts.includes(productId)
      ? selectedProducts.filter(id => id !== productId)
      : [...selectedProducts, productId];
    
    setSelectedProducts(updated);
    form.setValue('selectedProducts', updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Contact Information</h3>
        <p className="text-gray-600">Let's start with the basics</p>
      </div>

      {/* Business Name */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
        <Label htmlFor="businessName" className="text-lg font-semibold text-gray-900 mb-3 block">
          Business Name *
        </Label>
        <Input
          id="businessName"
          {...form.register("businessName")}
          placeholder="e.g., ABC Coffee Shop"
          className="h-14 text-base rounded-xl border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
          data-testid="input-business-name"
          autoComplete="off"
        />
        {form.formState.errors.businessName && (
          <p className="text-red-500 text-sm flex items-center gap-1 mt-2">
            <AlertCircle className="w-4 h-4" />
            {form.formState.errors.businessName.message}
          </p>
        )}
      </div>

      {/* Contact Name */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
        <Label htmlFor="contactName" className="text-lg font-semibold text-gray-900 mb-3 block">
          Contact Name *
        </Label>
        <Input
          id="contactName"
          {...form.register("contactName")}
          placeholder="e.g., John Smith"
          className="h-14 text-base rounded-xl border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
          data-testid="input-contact-name"
          autoComplete="off"
        />
        {form.formState.errors.contactName && (
          <p className="text-red-500 text-sm flex items-center gap-1 mt-2">
            <AlertCircle className="w-4 h-4" />
            {form.formState.errors.contactName.message}
          </p>
        )}
      </div>

      {/* Contact Details Card */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm space-y-5">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-teal-600" />
          Contact Methods
        </h4>
        
        {/* Email */}
        <div>
          <Label htmlFor="businessEmail" className="text-base font-medium text-gray-700 mb-2 block">
            Email Address *
          </Label>
          <Input
            id="businessEmail"
            type="email"
            {...form.register("businessEmail")}
            placeholder="contact@business.com"
            className="h-14 text-base rounded-xl border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
            data-testid="input-business-email"
            autoComplete="off"
          />
          {form.formState.errors.businessEmail && (
            <p className="text-red-500 text-sm flex items-center gap-1 mt-2">
              <AlertCircle className="w-4 h-4" />
              {form.formState.errors.businessEmail.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="businessPhone" className="text-base font-medium text-gray-700 mb-2 block">
            Phone Number
          </Label>
          <Input
            id="businessPhone"
            type="tel"
            {...form.register("businessPhone")}
            placeholder="+44 20 1234 5678"
            className="h-14 text-base rounded-xl border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
            data-testid="input-business-phone"
            autoComplete="off"
          />
        </div>
      </div>

      {/* Product Interest */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
        <Label className="text-lg font-semibold text-gray-900 mb-4 block">
          Product Interest *
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {productOptions.map((product) => (
            <div
              key={product.id}
              onClick={() => toggleProduct(product.id)}
              className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all ${
                selectedProducts.includes(product.id)
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              data-testid={`product-option-${product.id}`}
            >
              {selectedProducts.includes(product.id) && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="w-6 h-6 text-teal-600" />
                </div>
              )}
              <div className="text-3xl mb-2">{product.icon}</div>
              <h5 className="font-semibold text-gray-900 mb-1">{product.name}</h5>
              <p className="text-sm text-gray-600">{product.description}</p>
            </div>
          ))}
        </div>
        {form.formState.errors.selectedProducts && (
          <p className="text-red-500 text-sm flex items-center gap-1 mt-3">
            <AlertCircle className="w-4 h-4" />
            {form.formState.errors.selectedProducts.message}
          </p>
        )}
      </div>
    </div>
  );
}

// Step 2: Business Details Component
interface BusinessStepProps {
  form: any
  businessTypes: any[]
}

function BusinessStep({ form, businessTypes }: BusinessStepProps) {
  const [monthlyVolume, setMonthlyVolume] = useState([
    parseInt(form.watch('monthlyVolume')) || 50000
  ]);

  // Sync initial value to form on mount
  useEffect(() => {
    const currentValue = form.getValues('monthlyVolume');
    if (!currentValue) {
      form.setValue('monthlyVolume', monthlyVolume[0].toString());
    }
  }, []);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Business Details</h3>
        <p className="text-gray-600">Add more information about the business</p>
      </div>

      {/* Business Type */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
        <Label className="text-lg font-semibold text-gray-900 mb-3 block">
          Business Type *
        </Label>
        <Select 
          value={form.watch('businessTypeId')} 
          onValueChange={(value) => form.setValue('businessTypeId', value)}
        >
          <SelectTrigger data-testid="select-business-type" className="h-14 text-base rounded-xl border-gray-300">
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>
          <SelectContent>
            {(businessTypes || []).map((type) => (
              <SelectItem key={type.id} value={type.id}>
                <div className="flex flex-col py-1">
                  <span className="font-medium text-base">{type.name}</span>
                  <span className="text-sm text-gray-500">{type.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.businessTypeId && (
          <p className="text-red-500 text-sm flex items-center gap-1 mt-2">
            <AlertCircle className="w-4 h-4" />
            {form.formState.errors.businessTypeId.message}
          </p>
        )}
      </div>

      {/* Monthly Card Volume */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm space-y-4">
        <Label className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-teal-600" />
          Monthly Card Volume
        </Label>
        
        <div className="bg-teal-50 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">Amount</span>
            <span className="text-2xl font-bold text-teal-600">{formatCurrency(monthlyVolume[0])}</span>
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
          <div className="flex justify-between text-xs text-gray-600 mt-2">
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
          placeholder="Or enter amount manually"
          className="h-14 text-base text-center rounded-xl border-gray-300"
          data-testid="input-monthly-volume"
        />
      </div>

      {/* Business Address */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
        <Label htmlFor="businessAddress" className="text-lg font-semibold text-gray-900 mb-3 block flex items-center gap-2">
          <Building className="w-5 h-5 text-teal-600" />
          Business Address
        </Label>
        <Textarea
          id="businessAddress"
          {...form.register("businessAddress")}
          placeholder="Enter full business address"
          rows={4}
          className="text-base rounded-xl border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
          data-testid="textarea-business-address"
          autoComplete="off"
        />
      </div>

      {/* Optional: Notes */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
        <Label htmlFor="notes" className="text-lg font-semibold text-gray-900 mb-3 block">
          Additional Notes <span className="text-sm font-normal text-gray-500">(Optional)</span>
        </Label>
        <Textarea
          id="notes"
          {...form.register("notes")}
          placeholder="Any additional information about the client or opportunity..."
          rows={3}
          className="text-base rounded-xl border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
          data-testid="textarea-notes"
          autoComplete="off"
        />
      </div>
    </div>
  );
}

// Step 3: Review & Consent Component
function ReviewConsentStep({ form, isSubmitting }: { form: any; isSubmitting: boolean }) {
  const values = form.watch();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Review & Submit</h3>
        <p className="text-gray-600">Check your details and submit your referral</p>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-2xl p-6 border-2 border-teal-100 shadow-sm">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-teal-600" />
          Referral Summary
        </h4>
        
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-teal-100">
            <span className="text-gray-600">Business Name:</span>
            <span className="font-semibold text-gray-900">{values.businessName || '-'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-teal-100">
            <span className="text-gray-600">Contact Name:</span>
            <span className="font-semibold text-gray-900">{values.contactName || '-'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-teal-100">
            <span className="text-gray-600">Email:</span>
            <span className="font-semibold text-gray-900">{values.businessEmail || '-'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-teal-100">
            <span className="text-gray-600">Products:</span>
            <span className="font-semibold text-gray-900">
              {values.selectedProducts?.length > 0 ? values.selectedProducts.join(', ') : '-'}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Monthly Volume:</span>
            <span className="font-semibold text-teal-600">£{parseInt(values.monthlyVolume || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* GDPR Consent */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
        <FormField
          control={form.control}
          name="gdprConsent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-1 h-6 w-6"
                  data-testid="checkbox-gdpr-consent"
                />
              </FormControl>
              <div className="space-y-2 leading-none flex-1">
                <FormLabel className="text-base font-semibold text-gray-900 cursor-pointer">
                  I have client permission to share their details *
                </FormLabel>
                <p className="text-sm text-gray-600">
                  By checking this box, you confirm that you have the client's explicit consent 
                  to share their business information for the purpose of obtaining competitive quotes.
                </p>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </div>

      {/* Ready to Submit */}
      <div className="bg-gradient-to-r from-teal-500 to-green-600 rounded-2xl p-6 text-white text-center">
        <div className="text-4xl mb-3">🎯</div>
        <h4 className="text-xl font-bold mb-2">Ready to Submit!</h4>
        <p className="text-teal-50">
          Your referral will be processed within 24 hours. We'll keep you updated on progress.
        </p>
      </div>
    </div>
  );
}