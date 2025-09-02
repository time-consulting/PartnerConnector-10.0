import { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Quote, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Notification {
  id: string;
  type: "quote_ready" | "quote_approved" | "commission_paid" | "status_update";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  referralId?: string;
  businessName?: string;
}

interface NotificationCenterProps {
  onQuoteClick?: (referralId: string) => void;
}

export default function NotificationCenter({ onQuoteClick }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Mock notifications for now - in real app this would come from backend
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    retry: false,
    // Mock data for demonstration
    queryFn: () => Promise.resolve([
      {
        id: "1",
        type: "quote_ready",
        title: "Quote Ready",
        message: "A custom quote is ready for Tech Solutions Ltd",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        referralId: "123",
        businessName: "Tech Solutions Ltd"
      },
      {
        id: "2", 
        type: "status_update",
        title: "Status Update",
        message: "ABC Restaurant has approved their quote",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        read: false,
        referralId: "456",
        businessName: "ABC Restaurant"
      },
      {
        id: "3",
        type: "commission_paid",
        title: "Commission Paid",
        message: "£2,500 commission paid for Marketing Co referral",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true,
        referralId: "789",
        businessName: "Marketing Co"
      }
    ])
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "quote_ready":
        return <Quote className="w-4 h-4 text-blue-600" />;
      case "quote_approved":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "commission_paid":
        return <CreditCard className="w-4 h-4 text-green-600" />;
      case "status_update":
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "quote_ready":
        return "border-l-blue-500";
      case "quote_approved":
        return "border-l-green-500";
      case "commission_paid":
        return "border-l-green-500";
      case "status_update":
        return "border-l-orange-500";
      default:
        return "border-l-gray-500";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === "quote_ready" && notification.referralId && onQuoteClick) {
      onQuoteClick(notification.referralId);
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <DropdownMenuItem disabled className="py-8 text-center text-muted-foreground">
            No notifications yet
          </DropdownMenuItem>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-4 cursor-pointer border-l-4 ${getNotificationColor(notification.type)} ${
                  !notification.read ? "bg-blue-50 dark:bg-blue-950" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
                data-testid={`notification-${notification.id}`}
              >
                <div className="flex items-start gap-3 w-full">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">
                        {notification.title}
                      </p>
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    {notification.businessName && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {notification.businessName}
                      </p>
                    )}
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-primary cursor-pointer">
              Mark all as read
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}