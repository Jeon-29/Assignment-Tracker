import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type NotificationType =
  | 'vote'
  | 'proposal'
  | 'activity'
  | 'attendance'
  | 'announcement'
  | 'certificate';

export type NotificationRole = 'member' | 'admin' | 'coordinator';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedId?: string; // ID of related proposal, activity, certificate, etc.
  actionUrl?: string; // exact page to open when the notification is clicked
  actionLabel?: string;
  targetRoles?: NotificationRole[]; // leave blank when notification should be visible to all roles
  targetUserIds?: string[]; // use this for personal notifications, such as proposal owner updates
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
const STORAGE_KEY = 'uya-connect-notifications';

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000).toISOString();

const initialNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'activity',
    title: 'New Activity Posted',
    message: 'Community Service Day has been added to the activity list for May 2026.',
    timestamp: minutesAgo(12),
    read: false,
    relatedId: 'act-1',
    actionUrl: '/activities?activityId=act-1&action=view',
    actionLabel: 'View activity',
    targetRoles: ['member', 'admin', 'coordinator'],
  },
  {
    id: 'notif-2',
    type: 'attendance',
    title: 'Attendance QR Open',
    message: 'Attendance validation is open for Tech Workshop: Web Development.',
    timestamp: minutesAgo(35),
    read: false,
    relatedId: 'act-3',
    actionUrl: '/activities?activityId=act-3&action=scan',
    actionLabel: 'Scan QR',
    targetRoles: ['member'],
  },
  {
    id: 'notif-3',
    type: 'vote',
    title: 'Anonymous Vote Received',
    message: 'A member voted on your proposal "CleanUp Drive in Carmona City." Voter names are hidden for privacy.',
    timestamp: minutesAgo(50),
    read: false,
    relatedId: 'prop-4',
    actionUrl: '/proposals?proposalId=prop-4',
    actionLabel: 'View my proposal',
    targetUserIds: ['3'],
  },
  {
    id: 'notif-4',
    type: 'proposal',
    title: 'Proposal Approved',
    message: 'Your proposal "Photography Contest" was approved. Open the proposal details to review the result.',
    timestamp: minutesAgo(75),
    read: false,
    relatedId: 'prop-5',
    actionUrl: '/proposals?proposalId=prop-5',
    actionLabel: 'View status',
    targetUserIds: ['6'],
  },
  {
    id: 'notif-5',
    type: 'proposal',
    title: 'Proposal Needs Review',
    message: 'CleanUp Drive in Carmona City received a new vote. Review the updated voting progress and feedback.',
    timestamp: minutesAgo(95),
    read: true,
    relatedId: 'prop-4',
    actionUrl: '/proposals?proposalId=prop-4',
    actionLabel: 'Review proposal',
    targetRoles: ['admin', 'coordinator'],
  },
  {
    id: 'notif-6',
    type: 'announcement',
    title: 'New Announcement',
    message: 'Please check the latest UYA reminders before joining upcoming activities.',
    timestamp: minutesAgo(160),
    read: true,
    actionUrl: '/announcements',
    actionLabel: 'Read announcement',
    targetRoles: ['member', 'admin', 'coordinator'],
  },
]

function loadStoredNotifications() {
  try {
    const storedNotifications = window.localStorage.getItem(STORAGE_KEY);
    if (!storedNotifications) return initialNotifications;

    const parsedNotifications = JSON.parse(storedNotifications);
    if (!Array.isArray(parsedNotifications)) return initialNotifications;

    // Keep the user's read/deleted state, but add new demo notifications after updates.
    const storedIds = new Set(parsedNotifications.map((notification: Notification) => notification.id));
    const newSeedNotifications = initialNotifications.filter(
      notification => !storedIds.has(notification.id),
    );

    return [...newSeedNotifications, ...parsedNotifications];
  } catch {
    return initialNotifications;
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(loadStoredNotifications);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications((currentNotifications) => [newNotification, ...currentNotifications]);
  };

  const markAsRead = (id: string) => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({ ...notification, read: true })),
    );
  };

  const clearNotification = (id: string) => {
    setNotifications((currentNotifications) =>
      currentNotifications.filter((notification) => notification.id !== id),
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
