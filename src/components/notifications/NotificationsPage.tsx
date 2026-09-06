"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  Trash2,
  Filter,
  RefreshCw,
  AlertCircle,
  Info,
  CheckCheck,
} from "lucide-react";
import { getDemoNotifications, markDemoNotificationsAsRead } from "@/lib/demoDB";

interface Notification {
  id: string;
  type: 'SESSION_APPROVED' | 'SESSION_REJECTED' | 'SESSION_REMINDER' | 'SESSION_CANCELLED' | 'SESSION_COMPLETED' | 'SESSION_RESCHEDULED' | 'GENERAL';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
  relatedType?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      if (localStorage.getItem('auth-user')?.includes('demo-student-123')) {
        const demoNotifications = await getDemoNotifications();
        setNotifications(demoNotifications.map((notification) => ({
          ...notification,
          type: notification.type.toUpperCase() as Notification['type'],
          createdAt: new Date(notification.createdAt).toISOString(),
        })));
        return;
      }
      
      const response = await fetch('/api/notifications', {
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setNotifications(data.data.notifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      if (localStorage.getItem('auth-user')?.includes('demo-student-123')) {
        await markDemoNotificationsAsRead(notificationId);
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
        return;
      }

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (localStorage.getItem('auth-user')?.includes('demo-student-123')) {
        await markDemoNotificationsAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast({ title: "Success", description: "All notifications marked as read" });
        return;
      }

      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast({
          title: "Success",
          description: "All notifications marked as read",
        });
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        toast({
          title: "Success",
          description: "Notification deleted",
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SESSION_APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'SESSION_REJECTED':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'SESSION_REMINDER':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'SESSION_CANCELLED':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'SESSION_COMPLETED':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'SESSION_RESCHEDULED':
        return <Calendar className="h-5 w-5 text-purple-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    const variants: { [key: string]: any } = {
      SESSION_APPROVED: "default",
      SESSION_REJECTED: "destructive",
      SESSION_REMINDER: "secondary",
      SESSION_CANCELLED: "outline",
      SESSION_COMPLETED: "default",
      SESSION_RESCHEDULED: "secondary",
      GENERAL: "secondary",
    };

    const labels: { [key: string]: string } = {
      SESSION_APPROVED: "Approved",
      SESSION_REJECTED: "Rejected",
      SESSION_REMINDER: "Reminder",
      SESSION_CANCELLED: "Cancelled",
      SESSION_COMPLETED: "Completed",
      SESSION_RESCHEDULED: "Rescheduled",
      GENERAL: "Info",
    };

    return (
      <Badge variant={variants[type] || "secondary"}>
        {labels[type] || type}
      </Badge>
    );
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-6 w-6" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount} New
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Stay updated with your session bookings and important updates
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadNotifications}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="read">
            Read ({notifications.length - unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-gray-500">Loading notifications...</p>
                </div>
              </CardContent>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No {filter !== 'all' ? filter : ''} notifications
                  </h3>
                  <p className="text-gray-500">
                    {filter === 'unread' 
                      ? "You're all caught up! No unread notifications."
                      : filter === 'read'
                      ? "No read notifications yet."
                      : "You don't have any notifications yet."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all ${
                  !notification.isRead 
                    ? 'border-l-4 border-l-primary bg-blue-50/50' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 flex-1">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          {getNotificationBadge(notification.type)}
                          {!notification.isRead && (
                            <Badge variant="secondary" className="text-xs">
                              NEW
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-700">{notification.message}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
