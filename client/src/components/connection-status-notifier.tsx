import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { WifiIcon, RefreshCwIcon } from 'lucide-react';

export default function ConnectionStatusNotifier() {
  useEffect(() => {
    const handleConnectionRestored = () => {
      console.log('Connection restored event received');
      
      toast({
        title: (
          <div className="flex items-center gap-2">
            <WifiIcon className="w-5 h-5 text-green-600" />
            <span>Connection Restored!</span>
          </div>
        ),
        description: (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              You're back online. Your work will now sync automatically.
            </p>
            <Button
              size="sm"
              onClick={() => window.location.reload()}
              className="w-full"
              data-testid="button-refresh-page"
            >
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
          </div>
        ),
        variant: 'default'
      });
    };

    const handleOffline = () => {
      console.log('Connection lost event received');
      
      toast({
        title: "You're Offline",
        description: "Don't worry! Your changes will be saved locally and synced when you reconnect.",
        variant: 'default'
      });
    };

    // Listen for custom connection-restored events
    window.addEventListener('connection-restored', handleConnectionRestored);
    
    // Listen for native offline event
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('connection-restored', handleConnectionRestored);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return null; // This component doesn't render anything
}
