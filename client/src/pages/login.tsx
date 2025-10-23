import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Shield,
  CheckCircle,
  Users,
  TrendingUp,
  DollarSign,
  Star,
  ArrowRight
} from "lucide-react";
import { Link } from "wouter";

export default function Login() {
  const handleEmailSignup = () => {
    // Redirect to Replit Auth - Email option will be prominently displayed
    window.location.href = '/api/login';
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
            <Button variant="ghost" onClick={() => window.location.href = '/'} data-testid="button-back-home">
              Back to Home
            </Button>
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
                Secure Sign Up
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Create Your Account
              </h1>
              <p className="text-gray-600">
                Quick and easy sign-up using your email
              </p>
            </div>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Get Started in 30 Seconds</CardTitle>
                <CardDescription>
                  Sign up with your email to start earning commissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main Email Signup Button */}
                <Button 
                  onClick={handleEmailSignup}
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  data-testid="button-email-signup"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Continue with Email
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Separator />

                {/* What Happens Next */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium text-gray-900 mb-2">What happens next?</p>
                      <ol className="space-y-2 text-xs">
                        <li className="flex items-start gap-2">
                          <span className="font-semibold text-blue-600 min-w-[1.5rem]">1.</span>
                          <span>Enter your email address</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-semibold text-blue-600 min-w-[1.5rem]">2.</span>
                          <span>Create a secure password</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-semibold text-blue-600 min-w-[1.5rem]">3.</span>
                          <span>Complete quick onboarding (6 simple questions)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-semibold text-blue-600 min-w-[1.5rem]">4.</span>
                          <span>Start referring clients and earning!</span>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="text-xs text-gray-700">
                      <p className="font-medium text-gray-900 mb-1">100% Secure & Private</p>
                      <p>Your data is protected with enterprise-grade encryption. We never share your information with third parties.</p>
                    </div>
                  </div>
                </div>

                {/* Alternative Methods Notice */}
                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500">
                    Multiple sign-in options available including Google, GitHub, and Apple
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Already Have Account */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button 
                  onClick={handleEmailSignup}
                  className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer underline" 
                  data-testid="link-signin"
                >
                  Sign in here
                </button>
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
