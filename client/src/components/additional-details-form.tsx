import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { User, Building, CreditCard, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/toast-noop";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const additionalDetailsSchema = z.object({
  // Personal Details
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  
  // Business Details
  tradingName: z.string().min(2, "Trading name is required"),
  legalEntityName: z.string().min(2, "Legal entity name is required"),
  
  // Banking Details
  bankAccountNumber: z.string().min(8, "Account number must be at least 8 digits").max(8, "Account number must be exactly 8 digits"),
  sortCode: z.string().min(6, "Sort code must be 6 digits").max(6, "Sort code must be exactly 6 digits").regex(/^\d+$/, "Sort code must contain only numbers"),
});

type AdditionalDetailsData = z.infer<typeof additionalDetailsSchema>;

interface AdditionalDetailsFormProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  referral: {
    id: string;
    businessName: string;
    businessEmail?: string;
  };
}

export default function AdditionalDetailsForm({ 
  isOpen, 
  onClose, 
  onComplete,
  referral 
}: AdditionalDetailsFormProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<'form' | 'success'>('form');

  const form = useForm<AdditionalDetailsData>({
    resolver: zodResolver(additionalDetailsSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: referral.businessEmail || "",
      phone: "",
      tradingName: referral.businessName || "",
      legalEntityName: "",
      bankAccountNumber: "",
      sortCode: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: AdditionalDetailsData) => {
      const response = await fetch(`/api/referrals/${referral.id}/additional-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit additional details');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setCurrentStep('success');
      toast({
        title: "Details Submitted",
        description: "Thank you! Your additional details have been submitted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "Failed to submit details. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: AdditionalDetailsData) => {
    // Format sort code to include dashes
    const formattedData = {
      ...data,
      sortCode: data.sortCode.replace(/(\d{2})(\d{2})(\d{2})/, '$1-$2-$3'),
    };
    
    submitMutation.mutate(formattedData);
  };

  const handleComplete = () => {
    onComplete();
    onClose();
    setCurrentStep('form'); // Reset for next time
  };

  if (currentStep === 'success') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">All Set!</h3>
            <p className="text-muted-foreground mb-6">
              Your additional details have been submitted successfully. Our team will now process your application and set up your payment solution.
            </p>
            <Button onClick={handleComplete} className="w-full">
              Continue to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Additional Details Required
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            To complete your application, please provide the following details for {referral.businessName}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Personal Details Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-4 h-4" />
                  Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter first name" 
                            {...field}
                            data-testid="input-first-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter last name" 
                            {...field}
                            data-testid="input-last-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="Enter email address" 
                            {...field}
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel"
                            placeholder="Enter phone number" 
                            {...field}
                            data-testid="input-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Business Details Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building className="w-4 h-4" />
                  Business Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="tradingName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trading Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter trading name" 
                          {...field}
                          data-testid="input-trading-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="legalEntityName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Entity Name (Companies House) *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter legal entity name as registered with Companies House" 
                          {...field}
                          data-testid="input-legal-entity-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Separator />

            {/* Banking Details Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="w-4 h-4" />
                  Banking Details
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  For payment processing settlements
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bankAccountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Account Number *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="12345678" 
                            maxLength={8}
                            {...field}
                            data-testid="input-account-number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sortCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sort Code *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123456" 
                            maxLength={6}
                            {...field}
                            onChange={(e) => {
                              // Only allow numbers
                              const value = e.target.value.replace(/\D/g, '');
                              field.onChange(value);
                            }}
                            data-testid="input-sort-code"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Security Note:</strong> Your banking details are encrypted and stored securely. 
                    They will only be used for payment processing settlements.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitMutation.isPending}
                data-testid="button-submit-additional-details"
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Details"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}