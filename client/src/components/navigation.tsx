import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  ChevronDownIcon, 
  UsersIcon, 
  TrendingUpIcon, 
  DollarSignIcon, 
  BookOpenIcon,
  ShieldCheckIcon,
  BarChart3Icon,
  HeadphonesIcon,
  FileTextIcon,
  PlayCircleIcon,
  NetworkIcon,
  TargetIcon,
  GraduationCapIcon,
  HelpCircleIcon,
  User,
  Settings,
  CreditCard,
  Bell,
  LogOut,
  Shield,
  MessageSquare,
  Activity
} from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const isActive = (path: string) => location === path;

  const handleDropdownToggle = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const handleDropdownClose = () => {
    setOpenDropdown(null);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link href="/">
                <div className="flex items-center cursor-pointer" data-testid="link-logo">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <NetworkIcon className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">
                    PartnerConnector
                  </h1>
                </div>
              </Link>
            </div>
            
            {!isAuthenticated && (
              <div className="hidden lg:flex items-center space-x-8">
                {/* For Partners Dropdown */}
                <div className="relative">
                  <button
                    className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                    onClick={() => handleDropdownToggle('partners')}
                    data-testid="dropdown-partners"
                  >
                    For Partners
                    <ChevronDownIcon className="ml-1 w-4 h-4" />
                  </button>
                  
                  {openDropdown === 'partners' && (
                    <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 py-6 px-6 z-50">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-gray-900 mb-2">GET STARTED</h3>
                          <div className="space-y-3">
                            <Link href="/partner-onboarding">
                              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <UsersIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">Partner Onboarding</h4>
                                  <p className="text-sm text-gray-600">Learn how to get started and maximize earnings</p>
                                </div>
                              </div>
                            </Link>
                            <Link href="/commission-structure">
                              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                  <DollarSignIcon className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">Commission Structure</h4>
                                  <p className="text-sm text-gray-600">Understand our multi-tier payment system</p>
                                </div>
                              </div>
                            </Link>
                            <Link href="/lead-tracking">
                              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <BarChart3Icon className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">Lead Tracking</h4>
                                  <p className="text-sm text-gray-600">Track your referrals from submission to payout</p>
                                </div>
                              </div>
                            </Link>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4">
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">PARTNER TOOLS</h3>
                          <div className="grid grid-cols-2 gap-3">
                            <Link href="/partner-portal">
                              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                <TrendingUpIcon className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-gray-700">Partner Portal</span>
                              </div>
                            </Link>
                            <Link href="/team-management">
                              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                <UsersIcon className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-gray-700">Team Management</span>
                              </div>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* For Vendors Dropdown */}
                <div className="relative">
                  <button
                    className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                    onClick={() => handleDropdownToggle('vendors')}
                    data-testid="dropdown-vendors"
                  >
                    For Vendors
                    <ChevronDownIcon className="ml-1 w-4 h-4" />
                  </button>
                  
                  {openDropdown === 'vendors' && (
                    <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 py-6 px-6 z-50">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-gray-900 mb-2">PLATFORM FEATURES</h3>
                          <div className="space-y-3">
                            <Link href="/partner-recruitment">
                              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <TargetIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">Partner Recruitment</h4>
                                  <p className="text-sm text-gray-600">Find and onboard high-quality partners</p>
                                </div>
                              </div>
                            </Link>
                            <a href="/program-management" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Program Management</h4>
                                <p className="text-sm text-gray-600">Manage your entire partner ecosystem</p>
                              </div>
                            </a>
                            <a href="/analytics-reporting" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <BarChart3Icon className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Analytics & Reporting</h4>
                                <p className="text-sm text-gray-600">Track performance and optimize programs</p>
                              </div>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Resources Dropdown */}
                <div className="relative">
                  <button
                    className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                    onClick={() => handleDropdownToggle('resources')}
                    data-testid="dropdown-resources"
                  >
                    Resources
                    <ChevronDownIcon className="ml-1 w-4 h-4" />
                  </button>
                  
                  {openDropdown === 'resources' && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-6 px-6 z-50">
                      <div className="grid grid-cols-1 gap-3">
                        <a href="/help-center" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <HeadphonesIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-gray-900">Help Center</h4>
                            <p className="text-sm text-gray-600">Get support and find answers</p>
                          </div>
                        </a>
                        <Link href="/training">
                          <a className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <GraduationCapIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-gray-900">Training Center</h4>
                              <p className="text-sm text-gray-600">Interactive modules and onboarding</p>
                            </div>
                          </a>
                        </Link>
                        <a href="/api-docs" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <FileTextIcon className="w-5 h-5 text-purple-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-gray-900">API Documentation</h4>
                            <p className="text-sm text-gray-600">Developer resources and guides</p>
                          </div>
                        </a>
                        <a href="/webinars" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <PlayCircleIcon className="w-5 h-5 text-red-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-gray-900">Webinars & Events</h4>
                            <p className="text-sm text-gray-600">Live training and networking events</p>
                          </div>
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* About Us Link */}
                <Link href="/about">
                  <a className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                    About Us
                  </a>
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-8">
                  <Link href="/">
                    <a 
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        isActive('/') 
                          ? 'text-blue-600 border-b-2 border-blue-600' 
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                      data-testid="link-dashboard"
                    >
                      Dashboard
                    </a>
                  </Link>
                  <Link href="/leads">
                    <a 
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        isActive('/leads') 
                          ? 'text-blue-600 border-b-2 border-blue-600' 
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                      data-testid="link-leads"
                    >
                      Leads
                    </a>
                  </Link>
                  <Link href="/submit-referral">
                    <a 
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        isActive('/submit-referral') 
                          ? 'text-blue-600 border-b-2 border-blue-600' 
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                      data-testid="link-submit-referral"
                    >
                      Submit Referral
                    </a>
                  </Link>
                  <Link href="/team-management">
                    <a 
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        isActive('/team-management') 
                          ? 'text-blue-600 border-b-2 border-blue-600' 
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                      data-testid="link-team-management"
                    >
                      Team
                    </a>
                  </Link>
                  <Link href="/training">
                    <a 
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        isActive('/training') 
                          ? 'text-blue-600 border-b-2 border-blue-600' 
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                      data-testid="link-training"
                    >
                      Training
                    </a>
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications Bell - moved to left for clear view */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-blue-600 p-2 relative"
                data-testid="button-notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
            )}
            
            {/* Help Icon */}
            <Link href="/help-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-blue-600 p-2"
                data-testid="button-help"
              >
                <HelpCircleIcon className="w-5 h-5" />
              </Button>
            </Link>
            
            {isAuthenticated ? (
              <div className="relative">
                <button
                  className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors gap-2"
                  onClick={() => handleDropdownToggle('account')}
                  data-testid="dropdown-account"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span>{(user as any)?.firstName || 'Account'}</span>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                
                {openDropdown === 'account' && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-6 px-6 z-50">
                    <div className="space-y-4">
                      {/* User Info Section */}
                      <div className="border-b border-gray-200 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{(user as any)?.firstName} {(user as any)?.lastName}</h4>
                            <p className="text-sm text-gray-600">{(user as any)?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* User Settings */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">ACCOUNT SETTINGS</h3>
                        <div className="space-y-2">
                          <Link href="/account/profile">
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                              <Settings className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-700">Personal Information</span>
                            </div>
                          </Link>
                          <Link href="/account/banking">
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                              <CreditCard className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-700">Banking Details</span>
                            </div>
                          </Link>
                          <Link href="/account/feedback">
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                              <MessageSquare className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-700">Feedback & Support</span>
                            </div>
                          </Link>
                        </div>
                      </div>

                      {/* Admin Section - only for d.skeats@gmail.com */}
                      {(user as any)?.email === 'd.skeats@gmail.com' && (
                        <div className="border-t border-gray-200 pt-4">
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">ADMIN PORTAL</h3>
                          <div className="space-y-2">
                            <Link href="/admin">
                              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                <Shield className="w-4 h-4 text-red-600" />
                                <span className="text-sm text-gray-700">System Administration</span>
                              </div>
                            </Link>
                            <Link href="/admin/diagnostics">
                              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                <Activity className="w-4 h-4 text-red-600" />
                                <span className="text-sm text-gray-700">System Diagnostics</span>
                              </div>
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Logout Section */}
                      <div className="border-t border-gray-200 pt-4">
                        <Button 
                          variant="ghost" 
                          onClick={logout}
                          data-testid="button-logout"
                          className="w-full justify-start text-gray-700 hover:bg-gray-50 p-2"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button 
                  variant="ghost"
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-login"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-get-started"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {openDropdown && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden"
          onClick={handleDropdownClose}
        />
      )}

      {/* Click outside to close dropdowns */}
      {openDropdown && (
        <div 
          className="fixed inset-0 z-30 hidden lg:block"
          onClick={handleDropdownClose}
        />
      )}
    </nav>
  );
}