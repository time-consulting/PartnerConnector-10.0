import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReferralSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CheckCircle, ChevronLeft, ChevronRight, AlertCircle, DollarSign, Building, User, CreditCard, TrendingUp } from "lucide-react";

// Form schema for the complete stepper
const stepperFormSchema = insertReferralSchema
  .omit({
    referrerId: true,
  })
  .extend({
    contactName: z.string().min(1, "Contact name is required"),
    gdprConsent: z.boolean().refine(val => val === true, {
      message: "You must have client permission to proceed",
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
}

// Step configuration - New 3-stage flow
const steps = [
  { id: 1, title: "Client Info", icon: User },
  { id: 2, title: "Services", icon: CreditCard },
  { id: 3, title: "Upload & Submit", icon: TrendingUp },
];

// Product options
const productOptions = [
  { id: 'card-payments', name: 'Card Payments', icon: '💳', description: 'Accept card payments with competitive rates' },
  { id: 'business-funding', name: 'Business Funding', icon: '💰', description: 'Access flexible funding solutions' },
  { id: 'open-banking', name: 'Open Banking', icon: '🏦', description: 'Modern payment solutions' },
  { id: 'epos-systems', name: 'EPOS Systems', icon: '📱', description: 'Point of sale technology' },
];

export default function ReferralStepper({ businessTypes, onSubmit, isSubmitting }: ReferralStepperProps) {
  const [currentStep, setCurrentStep] = useState(1);

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
      monthlyVolume: "50000",
      currentRate: "",
      cardMachineQuantity: 1,
      selectedProducts: [],
      notes: "",
      gdprConsent: false,
    },
    mode: "onChange"
  });

  const selectedProducts = form.watch('selectedProducts') || [];
  const [monthlyVolume, setMonthlyVolume] = useState([50000]);

  // Sync initial monthly volume
  useEffect(() => {
    const currentValue = form.getValues('monthlyVolume');
    if (!currentValue || currentValue === "0") {
      form.setValue('monthlyVolume', "50000");
    }
  }, []);

  const validateCurrentStep = async () => {
    const values = form.getValues();
    
    switch (currentStep) {
      case 1:
        return !!(values.businessName && values.contactName && values.businessEmail);
      case 2:
        return !!(values.selectedProducts.length > 0 && values.businessTypeId && values.monthlyVolume);
      case 3:
        return values.gdprConsent;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    
    if (isValid) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      form.trigger();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      const data = form.getValues();
      onSubmit(data);
    }
  };

  const toggleProduct = (productId: string) => {
    const current = form.getValues('selectedProducts') || [];
    if (current.includes(productId)) {
      form.setValue('selectedProducts', current.filter(p => p !== productId));
    } else {
      form.setValue('selectedProducts', [...current, productId]);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Form {...form}>
      <div className="w-full">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                      isCompleted ? 'bg-teal-600 text-white' :
                      isActive ? 'bg-teal-500 text-white' :
                      'bg-gray-200 text-gray-400'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-6 h-6" /> : <StepIcon className="w-6 h-6" />}
                    </div>
                    <span className={`text-sm font-medium ${isActive ? 'text-teal-600' : 'text-gray-600'}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 mx-2 rounded ${
                      currentStep > step.id ? 'bg-teal-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 1: Client Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Client Information</h3>
              <p className="text-gray-600">Tell us about your client</p>
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

            {/* Email & Phone in Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
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

              <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
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
          </div>
        )}

        {/* Step 2: Services */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Services Needed</h3>
              <p className="text-gray-600">What services does the client need?</p>
            </div>

            {/* Product Selection */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
              <Label className="text-lg font-semibold text-gray-900 mb-4 block">
                Select Services *
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

            {/* Optional Notes */}
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
        )}

        {/* Step 3: Upload & Submit */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Review & Submit</h3>
              <p className="text-gray-600">Review your details and submit</p>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-2xl p-6 border-2 border-teal-100 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-teal-600" />
                Referral Summary
              </h4>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-teal-100">
                  <span className="text-gray-600">Business:</span>
                  <span className="font-semibold text-gray-900">{form.watch('businessName') || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-teal-100">
                  <span className="text-gray-600">Contact:</span>
                  <span className="font-semibold text-gray-900">{form.watch('contactName') || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-teal-100">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold text-gray-900">{form.watch('businessEmail') || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-teal-100">
                  <span className="text-gray-600">Services:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedProducts.length > 0 ? selectedProducts.join(', ') : '-'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Monthly Volume:</span>
                  <span className="font-semibold text-teal-600">
                    {formatCurrency(parseInt(form.watch('monthlyVolume') || '0'))}
                  </span>
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

            {/* Ready Banner */}
            <div className="bg-gradient-to-r from-teal-500 to-green-600 rounded-2xl p-6 text-white text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="text-xl font-bold mb-2">Ready to Submit!</h4>
              <p className="text-teal-50">
                Your referral will be processed within 24 hours. You'll be able to upload bills after submission.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-8 border-t mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="h-12 px-6 rounded-xl"
            data-testid="button-previous"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button
              type="button"
              onClick={handleNext}
              className="h-12 px-8 bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
              data-testid="button-next"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !form.watch('gdprConsent')}
              className="h-12 px-8 bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white rounded-xl"
              data-testid="button-submit"
            >
              {isSubmitting ? "Submitting..." : "Submit Referral"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </Form>
  );
}
