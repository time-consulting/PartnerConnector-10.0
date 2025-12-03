import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  DollarSign, 
  Settings,
  LogOut,
  ChevronRight,
  Zap,
  Target,
  MessageSquare,
  Contact,
  Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  onExpandChange?: (expanded: boolean) => void;
}

export default function Sidebar({ onExpandChange }: SidebarProps = {}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const handleMouseEnter = () => {
    setIsExpanded(true);
    onExpandChange?.(true);
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
    onExpandChange?.(false);
  };

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      toast({
        title: "Logged out successfully",
        description: "See you soon!",
      });
      setLocation('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: FileText, label: "Submit Deal", path: "/submit-deal" },
    { icon: Target, label: "Track Deals", path: "/track-deals" },
    { icon: MessageSquare, label: "Quotes", path: "/quotes" },
    { icon: Users, label: "Team", path: "/team-management" },
    { icon: DollarSign, label: "Commissions", path: "/commissions" },
    { icon: Contact, label: "Contacts", path: "/contacts" },
    { icon: Lightbulb, label: "Opportunities", path: "/opportunities" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-40 ${
        isExpanded ? "w-64" : "w-20"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary via-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            {isExpanded && (
              <span className="text-lg font-bold text-foreground whitespace-nowrap">
                PartnerConnector
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.path)
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
                data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
                {isExpanded && isActive(item.path) && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isExpanded && (
              <span className="text-sm font-medium whitespace-nowrap">
                Logout
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
