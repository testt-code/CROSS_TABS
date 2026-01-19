import {
  UserPlus,
  UserMinus,
  MessageSquare,
  Hash,
  Palette,
  Pencil,
  Activity,
} from 'lucide-react';
import type { ActivityEvent, ActivityType } from '@/types';
import { formatDistanceToNow } from '@/lib/time';

type ActivityFeedProps = {
  activities: ActivityEvent[];
  currentUserId: string;
};

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'user_joined':
      return <UserPlus className="size-3.5 text-green-500" />;
    case 'user_left':
      return <UserMinus className="size-3.5 text-red-500" />;
    case 'message_sent':
      return <MessageSquare className="size-3.5 text-blue-500" />;
    case 'counter_changed':
      return <Hash className="size-3.5 text-purple-500" />;
    case 'theme_changed':
      return <Palette className="size-3.5 text-amber-500" />;
    case 'name_changed':
      return <Pencil className="size-3.5 text-cyan-500" />;
    default:
      return <Activity className="size-3.5 text-muted-foreground" />;
  }
};

const getActivityText = (event: ActivityEvent): string => {
  switch (event.type) {
    case 'user_joined':
      return 'joined the session';
    case 'user_left':
      return 'left the session';
    case 'message_sent': {
      const preview = event.details?.preview as string | undefined;
      return preview ? `sent: "${preview.slice(0, 30)}${preview.length > 30 ? '...' : ''}"` : 'sent a message';
    }
    case 'counter_changed': {
      const oldValue = event.details?.oldValue as number | undefined;
      const newValue = event.details?.newValue as number | undefined;
      if (oldValue !== undefined && newValue !== undefined) {
        const diff = newValue - oldValue;
        if (diff > 0) return `incremented counter (+${diff})`;
        if (diff < 0) return `decremented counter (${diff})`;
        return 'reset counter to 0';
      }
      return 'changed the counter';
    }
    case 'theme_changed': {
      const newTheme = event.details?.newTheme as string | undefined;
      return newTheme ? `changed theme to ${newTheme}` : 'changed the theme';
    }
    case 'name_changed': {
      const newName = event.details?.newName as string | undefined;
      return newName ? `changed name to "${newName}"` : 'changed their name';
    }
    default:
      return 'performed an action';
  }
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  currentUserId,
}) => {
  return (
    <div className="flex flex-col h-full rounded-lg border bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">Activity</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {activities.length} events
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {activities.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            No activity yet
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((event) => {
              const isCurrentUser = event.userId === currentUserId;
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="shrink-0 mt-0.5">
                    {getActivityIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-tight">
                      <span
                        className="font-medium"
                        style={{ color: event.userColor }}
                      >
                        {event.userName}
                      </span>
                      {isCurrentUser && (
                        <span className="text-xs ml-1 px-1 py-0.5 rounded bg-primary/20 text-primary">
                          You
                        </span>
                      )}
                      <span className="text-muted-foreground ml-1">
                        {getActivityText(event)}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(event.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
