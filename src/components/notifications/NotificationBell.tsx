"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getDemoNotifications, markDemoNotificationsAsRead } from "@/lib/demoDB";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedId: string | null;
  relatedType: string | null;
  actionUrl: string | null;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
    
    // Poll for new notifications every 30 seconds (disabled as per request)
    // const interval = setInterval(loadNotifications, 30000);
    
    // return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      if (localStorage.getItem('auth-user')?.includes('demo-student-123')) {
        const demoNotifications = await getDemoNotifications();
        setNotifications(demoNotifications.map((notification) => ({
          ...notification,
          type: notification.type.toUpperCase(),
          relatedId: null,
          relatedType: null,
          actionUrl: null,
          createdAt: new Date(notification.createdAt).toISOString(),
        })));
        setUnreadCount(demoNotifications.filter((notification) => !notification.isRead).length);
        return;
      }

      const response = await fetch('/api/notifications?limit=10', {
        credentials: 'include', // Include HTTP-only cookies
      });
      
      if (!response.ok) {
        console.error('Notifications API error:', response.status);
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      if (localStorage.getItem('auth-user')?.includes('demo-student-123')) {
        await markDemoNotificationsAsRead(notificationId);
        await loadNotifications();
        return;
      }

      await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      });
      
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      if (localStorage.getItem('auth-user')?.includes('demo-student-123')) {
        await markDemoNotificationsAsRead();
        await loadNotifications();
        toast({ title: "Success", description: "All notifications marked as read" });
        return;
      }

      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "All notifications marked as read",
        });
        loadNotifications();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Navigate to action URL if available
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type: string) => {
    // Return appropriate icon or color based on notification type
    const typeColors: Record<string, string> = {
      SESSION_REQUEST: "text-blue-600",
      SESSION_APPROVED: "text-green-600",
      SESSION_REJECTED: "text-red-600",
      SESSION_RESCHEDULED: "text-orange-600",
      SESSION_REMINDER: "text-purple-600",
      SESSION_CANCELLED: "text-gray-600",
      CRISIS_ALERT: "text-red-600",
      GENERAL: "text-gray-600",
    };
    
    return typeColors[type] || typeColors.GENERAL;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 md:w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              disabled={loading}
              className="h-auto py-1 px-2 text-xs"
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`cursor-pointer p-3 ${
                  !notification.isRead ? 'bg-muted/50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3 w-full">
                  <div className={`mt-1 ${getNotificationIcon(notification.type)}`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="mt-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-center justify-center cursor-pointer"
              onClick={() => {
                // Trigger navigation to notifications tab in dashboard
                window.dispatchEvent(
                  new CustomEvent('dashboard:navigate', {
                    detail: { tab: 'notifications' }
                  })
                );
              }}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
