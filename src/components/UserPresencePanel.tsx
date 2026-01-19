import { useEffect, useRef, useState } from 'react';
import type { User } from '@/types';
import { UserCard } from './UserCard';

type UserPresencePanelProps = {
  users: User[];
  currentUser: User;
  isConnected: boolean;
  loading?: boolean;
  mobileDrawerMode?: boolean;
}

type UserNotification = {
  id: string;
  user: User;
  type: 'joined' | 'left';
  timestamp: number;
}

const NOTIFICATION_DURATION = 3000;

export const UserPresencePanel: React.FC<UserPresencePanelProps> = ({
  users,
  currentUser,
  isConnected,
  loading = false,
  mobileDrawerMode = false,
}) => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const prevUsersRef = useRef<Map<string, User>>(new Map());

  useEffect(() => {
    const prevUsers = prevUsersRef.current;
    const currentUserIds = new Set(users.map((u) => u.id));
    const prevUserIds = new Set(prevUsers.keys());

    users.forEach((user) => {
      if (!prevUserIds.has(user.id) && user.id !== currentUser.id) {
        const notification: UserNotification = {
          id: `${user.id}-${Date.now()}`,
          user,
          type: 'joined',
          timestamp: Date.now(),
        };
        setNotifications((prev) => [...prev, notification]);
      }
    });

    prevUsers.forEach((user, userId) => {
      if (!currentUserIds.has(userId) && userId !== currentUser.id) {
        const notification: UserNotification = {
          id: `${userId}-${Date.now()}`,
          user,
          type: 'left',
          timestamp: Date.now(),
        };
        setNotifications((prev) => [...prev, notification]);
      }
    });

    prevUsersRef.current = new Map(users.map((u) => [u.id, u]));
  }, [users, currentUser.id]);

  useEffect(() => {
    if (notifications.length === 0) return;

    const timer = setTimeout(() => {
      setNotifications((prev) => {
        const now = Date.now();
        return prev.filter((n) => now - n.timestamp < NOTIFICATION_DURATION);
      });
    }, NOTIFICATION_DURATION);

    return () => clearTimeout(timer);
  }, [notifications]);

  const allUsers = [currentUser, ...users.filter((u) => u.id !== currentUser.id)];
  const onlineCount = allUsers.length;

  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-center justify-between p-4 border-b ${mobileDrawerMode ? 'hidden md:flex' : ''}`}>
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">Users</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {onlineCount} online
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-xs text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="p-2 space-y-1">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`
                text-xs px-3 py-2 rounded-md animate-in fade-in slide-in-from-top-2 duration-300
                ${
                  notification.type === 'joined'
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400'
                }
              `}
            >
              <span className="font-medium">{notification.user.name}</span>
              {notification.type === 'joined' ? ' joined' : ' left'}
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          allUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              isCurrentUser={user.id === currentUser.id}
            />
          ))
        )}
      </div>

      {users.some((u) => u.isTyping) && (
        <div className="p-3 border-t text-xs text-muted-foreground">
          <span className="animate-pulse">
            {users
              .filter((u) => u.isTyping)
              .map((u) => u.name)
              .join(', ')}{' '}
            {users.filter((u) => u.isTyping).length === 1 ? 'is' : 'are'} typing...
          </span>
        </div>
      )}
    </div>
  );
};