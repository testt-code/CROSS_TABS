import type { User } from '@/types';
import { formatDistanceToNow } from '@/lib/time';

type UserCardProps = {
  user: User;
  isCurrentUser?: boolean;
  showStatus?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({ user, isCurrentUser = false, showStatus = true }) => {
  const lastSeenText = formatDistanceToNow(user.lastSeen);

  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-lg transition-all duration-200
        ${isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50 hover:bg-muted'}
      `}
    >
      <div
        className="relative shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl"
        style={{ backgroundColor: user.color + '20' }}
      >
        <span>{user.avatar}</span>
        {showStatus && (
          <span
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background bg-green-500"
            title="Online"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="font-medium truncate"
            style={{ color: user.color }}
          >
            {user.name}
          </span>
          {isCurrentUser && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">
              You
            </span>
          )}
          {user.isTyping && (
            <span className="text-xs text-muted-foreground animate-pulse">
              typing...
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {isCurrentUser ? 'Active now' : `Last seen ${lastSeenText}`}
        </p>
      </div>
    </div>
  );
}
