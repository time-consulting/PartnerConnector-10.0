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
  Loader2,
  Zap
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

        if (result.user.hasCompletedOnboarding) {
          setLocation('/dashboard');
        } else {
          setLocation('/onboarding');
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || "Invalid email or password";
      
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
        toast({
          title: "Account Locked",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-slate-950">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 backdrop-blur-sm bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
                  <Zap className="w-6 h-6 text-white" fill="white" />
                </div>
                <span className="text-xl font-bold text-foreground">PartnerConnector</span>
              </div>
            </Link>
            <Button variant="ghost" asChild data-testid="button-back-home" className="hover:bg-accent">
              <Link href="/">
                <span className="text-muted-foreground hover:text-foreground">Back to Home</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="min-h-screen flex">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-md w-full">
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" data-testid="badge-secure">
                <Shield className="w-3 h-3 mr-1" />
                Secure Login
              </Badge>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3">
                Welcome Back
              </h1>
              <p className="text-muted-foreground text-lg">
                Sign in to access your partner dashboard
              </p>
            </div>

            <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-card/95">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl">Sign In</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Enter your credentials to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      disabled={isLoading}
                      data-testid="input-email"
                      className="h-11 bg-input border-border focus:ring-primary focus:border-primary"
                      {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-foreground">Password</Label>
                      <Link href="/forgot-password">
                        <button
                          type="button"
                          className="text-sm text-indigo-400 hover:text-indigo-300 underline transition-colors"
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
                        className="h-11 bg-input border-border focus:ring-primary focus:border-primary pr-10"
                        {...form.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        data-testid="button-toggle-password"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.formState.errors.password && (
                      <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all font-semibold"
                    disabled={isLoading}
                    data-testid="button-submit-login"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                <Separator className="my-6 bg-border" />

                {/* Create New Account */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3">Don't have an account?</p>
                  <Button 
                    variant="outline"
                    className="w-full h-12 border-2 border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500 transition-all"
                    asChild
                    data-testid="button-create-account"
                  >
                    <Link href="/signup">
                      Create New Account
                    </Link>
                  </Button>
                </div>

                <Separator className="my-6 bg-border" />

                {/* Security Notice */}
                <div className="bg-accent/50 rounded-lg p-4 border border-border/50">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-muted-foreground">
                      <p className="font-semibold text-foreground mb-1">100% Secure & Private</p>
                      <p>Your data is protected with enterprise-grade encryption.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <div className="text-center mt-6">
              <p className="text-xs text-muted-foreground">
                Need help?{' '}
                <a 
                  href="mailto:support@partnerconnector.co.uk"
                  className="text-indigo-400 hover:text-indigo-300 underline transition-colors"
                  data-testid="link-support"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Benefits */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 items-center justify-center px-8 relative overflow-hidden">
          {/* Gradient Overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          
          <div className="max-w-md text-white relative z-10">
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Your Partner Dashboard Awaits
            </h2>
            <p className="text-indigo-100 mb-10 text-lg">
              Access your earnings, track deals, and manage your growing partner network.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-lg">60% Commission Rate</h3>
                  <p className="text-indigo-100 text-sm leading-relaxed">Earn industry-leading commissions on every successful deal</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-lg">Build Your Team</h3>
                  <p className="text-indigo-100 text-sm leading-relaxed">Earn additional income from your team's successful connections</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-lg">Track Your Success</h3>
                  <p className="text-indigo-100 text-sm leading-relaxed">Real-time dashboard to monitor your earnings and performance</p>
                </div>
              </div>
            </div>

            <Separator className="my-10 bg-white/20" />

            {/* Social Proof */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-400 border-2 border-white"></div>
                </div>
                <span className="text-sm font-semibold">1,000+ Active Partners</span>
              </div>
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                ))}
                <span className="text-sm ml-2 font-medium">4.9/5 Partner Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
