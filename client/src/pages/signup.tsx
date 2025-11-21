import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  CheckCircle,
  Users,
  TrendingUp,
  DollarSign,
  Star,
  Eye,
  EyeOff,
  Loader2,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  dealCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      dealCode: "",
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      form.setValue('dealsCode', refCode);
      console.log('[SIGNUP] Referral code detected:', refCode);
    }
  }, [form]);

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const payload: any = {
        email: data.email,
        password: data.password,
      };

      // Include deals code if present
      if (data.dealsCode && data.dealsCode.trim()) {
        payload.dealsCode = data.dealsCode.trim().toUpperCase();
        console.log('[SIGNUP] Including deals code:', payload.dealsCode);
      }

      const response = await apiRequest('POST', '/api/auth/register', payload);
      const result = await response.json();

      if (result.success) {
        toast({
          title: "Account created!",
          description: "Welcome to PartnerConnector. Let's complete your profile.",
        });

        // Always go to onboarding after signup
        setLocation('/onboarding');
      }
    } catch (error: any) {
      const message = error.message || "Unable to create account";
      setErrorMessage(message);
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const dealsCodeValue = form.watch('dealsCode');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">PartnerConnector</span>
              </div>
            </Link>
            <Button variant="ghost" asChild data-testid="button-back-home">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="min-h-screen flex">
        {/* Left Side - Signup Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              {dealsCodeValue ? (
                <Badge className="mb-4 bg-gradient-to-r from-teal-600 to-green-600 text-white" data-testid="badge-invited">
                  <Sparkles className="w-3 h-3 mr-1" />
                  You've Been Invited!
                </Badge>
              ) : (
                <Badge className="mb-4 bg-green-100 text-green-700" data-testid="badge-secure">
                  <Shield className="w-3 h-3 mr-1" />
                  Secure Sign Up
                </Badge>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Create Your Account
              </h1>
              <p className="text-gray-600">
                {dealsCodeValue 
                  ? "Join via deals and start earning commissions"
                  : "Start earning commissions today"
                }
              </p>
            </div>

            {dealsCodeValue && (
              <div className="mb-6 p-4 bg-teal-50 rounded-lg border-2 border-teal-200" data-testid="deals-code-display">
                <p className="text-sm text-gray-600 mb-1">Joining with Referral Code</p>
                <p className="text-xl font-bold text-teal-600 font-mono" data-testid="text-deals-code">{dealsCodeValue}</p>
              </div>
            )}

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                  Create your account to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Error Alert */}
                  {errorMessage && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4" data-testid="alert-error">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">!</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-red-900 mb-1">Registration Failed</p>
                          <p className="text-sm text-red-700" data-testid="text-error-message">{errorMessage}</p>
                          {errorMessage.includes("Email already registered") && (
                            <p className="text-sm text-red-600 mt-2">
                              Already have an account?{' '}
                              <Link href="/login" className="font-semibold underline hover:text-red-800" data-testid="link-login-from-error">
                                Sign in here
                              </Link>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      disabled={isLoading}
                      data-testid="input-email"
                      {...form.register("email")}
                      onChange={(e) => {
                        form.register("email").onChange(e);
                        setErrorMessage(null);
                      }}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        disabled={isLoading}
                        data-testid="input-password"
                        {...form.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        data-testid="button-toggle-password"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.formState.errors.password && (
                      <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
                    )}
                    <p className="text-xs text-gray-500">Must be at least 8 characters</p>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        disabled={isLoading}
                        data-testid="input-confirm-password"
                        {...form.register("confirmPassword")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        data-testid="button-toggle-confirm-password"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  {/* Referral Code (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="dealsCode" className="flex items-center gap-2">
                      Referral Code 
                      <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                    </Label>
                    <Input
                      id="dealsCode"
                      type="text"
                      placeholder="e.g., ADMIN001 or PC-001.1"
                      disabled={isLoading}
                      className="font-mono uppercase"
                      data-testid="input-deals-code"
                      {...form.register("dealsCode")}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        form.setValue('dealsCode', value);
                      }}
                    />
                    {form.formState.errors.dealsCode && (
                      <p className="text-sm text-red-600">{form.formState.errors.dealsCode.message}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Have a deals code? Enter it to join a partner's team
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    disabled={isLoading}
                    data-testid="button-submit-signup"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>

                <Separator className="my-6" />

                {/* What Happens Next */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium text-gray-900 mb-2">What happens next?</p>
                      <ol className="space-y-1 text-xs">
                        <li>1. Complete quick onboarding (6 simple questions)</li>
                        <li>2. Get your unique deals code</li>
                        <li>3. Start referring clients and earning!</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="text-xs text-gray-700">
                      <p className="font-medium text-gray-900 mb-1">100% Secure & Private</p>
                      <p>Your data is protected with enterprise-grade encryption.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Already Have Account */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer underline" 
                  data-testid="link-login"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Benefits */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-purple-600 items-center justify-center px-8">
          <div className="max-w-md text-white">
            <h2 className="text-3xl font-bold mb-6">
              Start Earning Today
            </h2>
            <p className="text-blue-100 mb-8">
              Join thousands of professionals earning substantial commissions through strategic partnerships.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">60% Commission Rate</h3>
                  <p className="text-blue-100 text-sm">Earn industry-leading commissions on every successful deals</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Build Your Team</h3>
                  <p className="text-blue-100 text-sm">Earn additional income from your team's successful connections</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Track Your Success</h3>
                  <p className="text-blue-100 text-sm">Real-time dashboard to monitor your earnings and performance</p>
                </div>
              </div>
            </div>

            <Separator className="my-8 bg-white/20" />

            {/* Social Proof */}
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-white/30 border-2 border-white/50"></div>
                  <div className="w-8 h-8 rounded-full bg-white/30 border-2 border-white/50"></div>
                  <div className="w-8 h-8 rounded-full bg-white/30 border-2 border-white/50"></div>
                </div>
                <span className="text-sm font-medium">1,000+ Active Partners</span>
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm ml-2">4.9/5 Partner Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
