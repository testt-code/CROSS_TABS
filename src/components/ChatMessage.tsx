import { useState, useEffect } from 'react';
import { Trash2, Clock } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/types';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from '@/lib/time';

type ChatMessageProps = {
  message: ChatMessageType;
  isOwnMessage: boolean;
  onDelete: (messageId: string) => void;
};

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isOwnMessage,
  onDelete,
}) => {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    if (!message.expirationDate) return;

    const updateTimeLeft = () => {
      const remaining = message.expirationDate! - Date.now();

      if (remaining <= 0) {
        setTimeLeft(null);
        return;
      }

      const seconds = Math.ceil(remaining / 1000);
      if (seconds < 60) {
        setTimeLeft(`${seconds}s`);
      } else {
        const minutes = Math.ceil(seconds / 60);
        setTimeLeft(`${minutes}m`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [message.expirationDate]);

  return (
    <div
      className={`
        group flex gap-3 p-3 rounded-lg transition-all duration-200
        ${isOwnMessage ? 'bg-primary/10' : 'bg-muted/50'}
      `}
    >
      <div
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base"
        style={{ backgroundColor: message.userColor + '20' }}
      >
        <span>{message.userAvatar}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="font-medium text-sm"
            style={{ color: message.userColor }}
          >
            {message.userName}
          </span>
          {isOwnMessage && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">
              You
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(message.timestamp)}
          </span>
          {message.expirationDate && timeLeft && (
            <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <Clock className="size-3" />
              {timeLeft}
            </span>
          )}
        </div>
        <p className="text-sm mt-1 break-words whitespace-pre-wrap">
          {message.text}
        </p>
      </div>

      {isOwnMessage && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(message.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-destructive"
          aria-label="Delete message"
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  );
};
