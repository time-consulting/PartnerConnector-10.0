import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out.",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/login");
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.firstName || 'Partner'} 👋</h1>
          <p className="text-slate-400">Ready to grow your earnings today?</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Submit a Deal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 mb-4">Submit a new business deal and start earning</p>
              <Link href="/submit-deal">
                <Button className="w-full bg-orange-500 hover:bg-orange-600">Submit Deal</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Track Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 mb-4">View and track all your submitted deals</p>
              <Link href="/track-deals">
                <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-700">Track Deals</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">View Commissions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 mb-4">Check your commission history and payments</p>
              <Link href="/commissions">
                <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-700">View Commissions</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-300 text-sm">Total Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">0</p>
              <p className="text-slate-400 text-sm mt-2">No deals submitted yet</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-300 text-sm">Total Commissions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-500">£0.00</p>
              <p className="text-slate-400 text-sm mt-2">Earned commissions</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-300 text-sm">Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-teal-500">0</p>
              <p className="text-slate-400 text-sm mt-2">Referrals invited</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
