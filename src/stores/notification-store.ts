import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // in ms, 0 = persistent
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
  txHash?: string; // Link to transaction
};

export type NotificationState = {
  notifications: Notification[];
  maxNotifications: number;
};

export type NotificationActions = {
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  clearByType: (type: NotificationType) => void;
  getNotificationsByType: (type: NotificationType) => Notification[];
};

type NotificationStore = NotificationState & NotificationActions;

const initialState: NotificationState = {
  notifications: [],
  maxNotifications: 5,
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  ...initialState,
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      timestamp: new Date(),
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(
        0,
        state.maxNotifications,
      ),
    }));

    // Auto-remove after duration if specified. Scheduled outside `set` so the
    // reducer stays pure and StrictMode double-invocation doesn't stack timers.
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(newNotification.id);
      }, notification.duration);
    }
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearNotifications: () => set({ notifications: [] }),
  clearByType: (type) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.type !== type),
    })),
  getNotificationsByType: (type) => {
    return get().notifications.filter((n) => n.type === type);
  },
}));
