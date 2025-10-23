import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  profession?: string;
  company?: string;
  clientBaseSize?: string;
  gdprConsent?: boolean;
  marketingConsent?: boolean;
  partnerId?: string;
  teamRole?: string;
  isAdmin?: boolean;
  hasCompletedOnboarding?: boolean;
  referralCode?: string;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const logout = () => {
    // Clear all cached data
    queryClient.clear();
    // Redirect to logout endpoint
    window.location.href = "/api/logout";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
