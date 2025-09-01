import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-card shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-bold text-primary cursor-pointer" data-testid="link-logo">
                  ReferralConnect
                </h1>
              </Link>
            </div>
            
            {isAuthenticated && (
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-8">
                  <Link href="/">
                    <a 
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        isActive('/') 
                          ? 'text-primary' 
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                      data-testid="link-dashboard"
                    >
                      Dashboard
                    </a>
                  </Link>
                  <Link href="/submit-referral">
                    <a 
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        isActive('/submit-referral') 
                          ? 'text-primary' 
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                      data-testid="link-submit-referral"
                    >
                      Submit Referral
                    </a>
                  </Link>
                  <Link href="/learning-portal">
                    <a 
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        isActive('/learning-portal') 
                          ? 'text-primary' 
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                      data-testid="link-learning"
                    >
                      Learning Portal
                    </a>
                  </Link>
                  <Link href="/upload-bills">
                    <a 
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        isActive('/upload-bills') 
                          ? 'text-primary' 
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                      data-testid="link-upload-bills"
                    >
                      Upload Bills
                    </a>
                  </Link>
                  {(user as any)?.isAdmin && (
                    <Link href="/admin">
                      <a 
                        className={`px-3 py-2 text-sm font-medium transition-colors ${
                          isActive('/admin') 
                            ? 'text-primary' 
                            : 'text-muted-foreground hover:text-primary'
                        }`}
                        data-testid="link-admin"
                      >
                        Admin Portal
                      </a>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground" data-testid="text-user-greeting">
                  Hi, {(user as any)?.firstName || 'Professional'}
                </span>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = "/api/logout"}
                  data-testid="button-logout"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-login"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-get-started"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
