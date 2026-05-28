import React, { useState, useRef, useEffect } from 'react';
import {
  Award,
  Bell,
  CalendarDays,
  CheckCheck,
  ClipboardCheck,
  Lightbulb,
  Megaphone,
  User as UserIcon,
  Vote,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Notification, NotificationType, useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export function Navbar() {
  const { currentUser } = useAuth();
  const { notifications, markAsRead, markAllAsRead, clearNotification } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const visibleNotifications = notifications.filter((notification) => {
    if (!currentUser) return false;
    if (currentUser.mockAccountType === 'blank-clean') return false;

    const isTargetedToUser =
      notification.targetUserIds?.length && notification.targetUserIds.includes(currentUser.id);

    const isTargetedToRole =
      notification.targetRoles?.length && notification.targetRoles.includes(currentUser.role);

    // Notifications without a specific user or role target are treated as general notifications.
    const isGeneralNotification = !notification.targetUserIds?.length && !notification.targetRoles?.length;

    return Boolean(isTargetedToUser || isTargetedToRole || isGeneralNotification);
  });

  const visibleUnreadCount = visibleNotifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'vote':
        return Vote;
      case 'proposal':
        return Lightbulb;
      case 'activity':
        return CalendarDays;
      case 'attendance':
        return ClipboardCheck;
      case 'announcement':
        return Megaphone;
      case 'certificate':
        return Award;
      default:
        return Bell;
    }
  };

  const getNotificationRoute = (notification: Notification) => {
    if (notification.actionUrl) return notification.actionUrl;

    switch (notification.type) {
      case 'vote':
      case 'proposal':
        return currentUser?.role === 'admin' || currentUser?.role === 'coordinator'
          ? '/proposals/manage'
          : '/proposals';
      case 'activity':
        return notification.relatedId
          ? `/activities?activityId=${notification.relatedId}&action=view`
          : '/activities';
      case 'attendance':
        return notification.relatedId
          ? `/activities?activityId=${notification.relatedId}&action=scan`
          : '/attendance';
      case 'announcement':
        return '/announcements';
      case 'certificate':
        return '/certificates';
      default:
        return '/dashboard';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    navigate(getNotificationRoute(notification));
    setShowNotifications(false);
  };

  const handleMarkAllVisibleAsRead = () => {
    visibleNotifications
      .filter((notification) => !notification.read)
      .forEach((notification) => markAsRead(notification.id));
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <header className="bg-gradient-to-r from-card via-card to-primary/5 border-b border-border px-6 py-4 sticky top-0 z-20 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="lg:ml-0 ml-12">
          <h2 className="text-lg">
            Welcome back, {currentUser?.name || 'User'}!
          </h2>
          <p className="text-sm text-muted-foreground capitalize">
            {currentUser?.role || 'Member'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-primary/10 rounded-lg transition-colors border border-transparent hover:border-border"
              aria-label="Open notifications"
            >
              <Bell className="w-5 h-5 text-foreground" />
              {visibleUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-primary text-primary-foreground rounded-full text-[11px] flex items-center justify-center shadow-sm">
                  {visibleUnreadCount > 9 ? '9+' : visibleUnreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-[420px] bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
                <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-foreground">Notifications</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {visibleUnreadCount > 0
                          ? `${visibleUnreadCount} unread notification${visibleUnreadCount > 1 ? 's' : ''}`
                          : 'You are all caught up'}
                      </p>
                    </div>

                    {visibleUnreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllVisibleAsRead}
                        className="text-xs text-primary hover:underline flex items-center gap-1 whitespace-nowrap"
                      >
                        <CheckCheck className="w-3 h-3" />
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-[420px] overflow-y-auto">
                  {visibleNotifications.length > 0 ? (
                    visibleNotifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type);

                      return (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer ${
                            !notification.read ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5 border border-primary/10">
                              <Icon className="w-5 h-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                    {notification.message}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    clearNotification(notification.id);
                                  }}
                                  className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
                                  aria-label="Remove notification"
                                >
                                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                                </button>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 mt-3">
                                {!notification.read && (
                                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium">
                                    Unread
                                  </span>
                                )}
                                {notification.actionLabel && (
                                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px]">
                                    {notification.actionLabel}
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-sm text-muted-foreground">No notifications yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground shadow-md">
              <UserIcon className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
