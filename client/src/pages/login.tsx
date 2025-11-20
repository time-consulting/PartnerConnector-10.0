import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  Loader2
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/login', data);
      const result = await response.json();

      if (result.success) {
        toast({
          title: "Welcome back!",
          description: "Logging you in...",
        });

        // Check if user has completed onboarding
        if (result.user.hasCompletedOnboarding) {
          setLocation('/dashboard');
        } else {
          setLocation('/onboarding');
        }
      }
    } catch (error: any) {
      // Show clear error message with helpful actions
      const errorMessage = error.message || "Invalid email or password";
      
      // Check if email verification is required
      if (error.message && error.message.includes('verify your email')) {
        toast({
          title: "Email Verification Required",
          description: (
            <div className="space-y-2">
              <p>{errorMessage}</p>
              <Button
                variant="link"
                className="p-0 h-auto text-white hover:text-white/80"
                onClick={() => setLocation('/resend-verification')}
              >
                Resend verification email
              </Button>
            </div>
          ),
          variant: "destructive",
        });
      } else if (error.message && error.message.includes('locked')) {
        // Account is locked
        toast({
          title: "Account Locked",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        // Generic error
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

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
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <Badge className="mb-4 bg-green-100 text-green-700" data-testid="badge-secure">
                <Shield className="w-3 h-3 mr-1" />
                Secure Login
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Welcome Back
              </h1>
              <p className="text-gray-600">
                Sign in to access your partner dashboard
              </p>
            </div>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/forgot-password">
                        <button
                          type="button"
                          className="text-sm text-blue-600 hover:text-blue-500 underline"
                          data-testid="link-forgot-password"
                        >
                          Forgot password?
                        </button>
                      </Link>
                    </div>
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
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    disabled={isLoading}
                    data-testid="button-submit-login"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                <Separator className="my-6" />

                {/* Create New Account */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">Don't have an account?</p>
                  <Button 
                    variant="outline"
                    className="w-full h-12 border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                    asChild
                    data-testid="button-create-account"
                  >
                    <Link href="/signup">
                      Create New Account
                    </Link>
                  </Button>
                </div>

                <Separator className="my-6" />

                {/* Security Notice */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
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

            {/* Support */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                Need help?{' '}
                <a 
                  href="mailto:support@partnerconnector.co.uk"
                  className="text-blue-600 hover:text-blue-500 underline"
                  data-testid="link-support"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Benefits */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-purple-600 items-center justify-center px-8">
          <div className="max-w-md text-white">
            <h2 className="text-3xl font-bold mb-6">
              Your Partner Dashboard Awaits
            </h2>
            <p className="text-blue-100 mb-8">
              Access your earnings, track deal, and manage your growing partner network.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">60% Commission Rate</h3>
                  <p className="text-blue-100 text-sm">Earn industry-leading commissions on every successful deal</p>
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
