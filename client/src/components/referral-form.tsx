import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReferralSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = insertReferralSchema.extend({
  gdprConsent: z.boolean().refine(val => val === true, {
    message: "GDPR consent is required",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface ReferralFormProps {
  businessTypes: any[];
  onSubmit: (data: FormData) => void;
  isSubmitting: boolean;
}

export default function ReferralForm({ businessTypes, onSubmit, isSubmitting }: ReferralFormProps) {
  const [selectedBusinessType, setSelectedBusinessType] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      businessEmail: "",
      businessPhone: "",
      businessAddress: "",
      businessTypeId: "",
      currentProcessor: "",
      monthlyVolume: "",
      currentRate: "",
      notes: "",
      gdprConsent: false,
    },
  });

  const handleSubmit = (data: FormData) => {
    onSubmit(data);
  };

  const selectedType = businessTypes.find(type => type.id === selectedBusinessType);

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                {...form.register("businessName")}
                placeholder="Enter business name"
                data-testid="input-business-name"
              />
              {form.formState.errors.businessName && (
                <p className="text-destructive text-sm mt-1">
                  {form.formState.errors.businessName.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="businessEmail">Business Email *</Label>
              <Input
                id="businessEmail"
                type="email"
                {...form.register("businessEmail")}
                placeholder="business@example.com"
                data-testid="input-business-email"
              />
              {form.formState.errors.businessEmail && (
                <p className="text-destructive text-sm mt-1">
                  {form.formState.errors.businessEmail.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessPhone">Business Phone</Label>
              <Input
                id="businessPhone"
                {...form.register("businessPhone")}
                placeholder="+44 20 1234 5678"
                data-testid="input-business-phone"
              />
            </div>
            
            <div>
              <Label htmlFor="businessType">Business Type *</Label>
              <Select 
                value={selectedBusinessType} 
                onValueChange={(value) => {
                  setSelectedBusinessType(value);
                  form.setValue("businessTypeId", value);
                }}
              >
                <SelectTrigger data-testid="select-business-type">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} - {type.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.businessTypeId && (
                <p className="text-destructive text-sm mt-1">
                  {form.formState.errors.businessTypeId.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="businessAddress">Business Address</Label>
            <Textarea
              id="businessAddress"
              {...form.register("businessAddress")}
              placeholder="Full business address"
              rows={3}
              data-testid="textarea-business-address"
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Processing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Current Payment Processing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentProcessor">Current Processor</Label>
              <Input
                id="currentProcessor"
                {...form.register("currentProcessor")}
                placeholder="e.g., Worldpay, Square, etc."
                data-testid="input-current-processor"
              />
            </div>
            
            <div>
              <Label htmlFor="currentRate">Current Processing Rate (%)</Label>
              <Input
                id="currentRate"
                type="number"
                step="0.01"
                {...form.register("currentRate")}
                placeholder="e.g., 2.5"
                data-testid="input-current-rate"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="monthlyVolume">Monthly Transaction Volume (£)</Label>
            <Input
              id="monthlyVolume"
              type="number"
              {...form.register("monthlyVolume")}
              placeholder="e.g., 50000"
              data-testid="input-monthly-volume"
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Any additional information about the business or current payment setup"
              rows={3}
              data-testid="textarea-notes"
            />
          </div>
        </CardContent>
      </Card>

      {/* Commission Estimate */}
      {selectedType && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Estimated Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-semibold">Base Commission Range:</p>
                <p className="text-muted-foreground text-sm">Based on {selectedType.name} tier</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary" data-testid="text-estimated-commission">
                  £{selectedType.baseCommission}+
                </p>
                <p className="text-sm text-muted-foreground">
                  Plus volume bonuses
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* GDPR Consent */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Privacy & Consent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="gdprConsent"
              checked={form.watch("gdprConsent")}
              onCheckedChange={(checked) => form.setValue("gdprConsent", checked as boolean)}
              data-testid="checkbox-gdpr-consent"
            />
            <Label htmlFor="gdprConsent" className="text-sm leading-5">
              I consent to the processing of the business data provided for the purpose of generating competitive quotes and managing referral commissions. The business owner will be contacted regarding this referral opportunity. I understand this consent can be withdrawn at any time.
            </Label>
          </div>
          {form.formState.errors.gdprConsent && (
            <p className="text-destructive text-sm">
              {form.formState.errors.gdprConsent.message}
            </p>
          )}
          
          <p className="text-xs text-muted-foreground">
            By submitting this referral, you confirm that you have appropriate authority to refer this business and that the business owner will be contacted directly for quote comparison. All data is processed securely in compliance with GDPR regulations.
          </p>
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        className="w-full" 
        size="lg"
        disabled={isSubmitting}
        data-testid="button-submit-referral-form"
      >
        {isSubmitting ? "Submitting..." : "Submit Referral"}
      </Button>
    </form>
  );
}
