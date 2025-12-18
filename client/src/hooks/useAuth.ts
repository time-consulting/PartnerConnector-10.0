import { useQuery } from "@tanstack/react-query";
import { queryClient, getQueryFn } from "@/lib/queryClient";

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
  dealCode?: string;
}

export function useAuth() {
  const { data: user, isLoading, isFetching } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn<User | null>({ on401: "returnNull" }),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes - prevents refetching on navigation
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const logout = () => {
    // Clear all cached data
    queryClient.clear();
    // Redirect to logout endpoint
    window.location.href = "/api/auth/logout";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
