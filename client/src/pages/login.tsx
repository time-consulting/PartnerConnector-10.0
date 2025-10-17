import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Chrome,
  Github,
  Smartphone,
  LogIn,
  ArrowRight,
  Shield,
  CheckCircle,
  Users,
  TrendingUp,
  DollarSign,
  Star
} from "lucide-react";
import { Link } from "wouter";

export default function Login() {
  const handleLogin = () => {
    // Redirect to Replit Auth which supports all these methods
    window.location.href = '/login';
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
            <Link href="/">
              <Button variant="ghost" data-testid="button-back-home">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="min-h-screen flex">
        {/* Left Side - Login Options */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <Badge className="mb-4 bg-green-100 text-green-700" data-testid="badge-secure">
                <Shield className="w-3 h-3 mr-1" />
                Secure Authentication
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Welcome Back
              </h1>
              <p className="text-gray-600">
                Choose your preferred method to sign in
              </p>
            </div>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Sign In Options</CardTitle>
                <CardDescription>
                  Access your partnership dashboard with any of these methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Primary Login Button */}
                <div className="space-y-3">
                  {/* Google Sign In */}
                  <Button 
                    onClick={handleLogin}
                    className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
                    data-testid="button-google-signin"
                  >
                    <Chrome className="w-5 h-5 mr-3 text-blue-500" />
                    Continue with Google
                  </Button>

                  {/* Email Sign In */}
                  <Button 
                    onClick={handleLogin}
                    className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
                    data-testid="button-email-signin"
                  >
                    <Mail className="w-5 h-5 mr-3 text-purple-500" />
                    Continue with Email
                  </Button>

                  <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                      OR
                    </span>
                  </div>

                  {/* Other Options */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={handleLogin}
                      variant="outline"
                      className="h-10"
                      data-testid="button-github-signin"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </Button>
                    <Button 
                      onClick={handleLogin}
                      variant="outline"
                      className="h-10"
                      data-testid="button-apple-signin"
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Apple
                    </Button>
                  </div>

                  {/* Main Sign In Button */}
                  <Button 
                    onClick={handleLogin}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    data-testid="button-all-signin"
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    View All Sign In Options
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-xs text-gray-600">
                      <p className="font-medium text-gray-900 mb-1">Secure & Private</p>
                      <p>Your login credentials are protected with enterprise-grade security. We never store passwords directly.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup">
                  <a className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer" data-testid="link-signup">
                    Sign up for free
                  </a>
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
                  <p className="text-blue-100 text-sm">Earn industry-leading commissions on every successful referral</p>
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