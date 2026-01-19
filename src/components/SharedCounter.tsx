import { Minus, Plus, RotateCcw } from 'lucide-react';
import type { CounterState } from '@/types';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from '@/lib/time';

type SharedCounterProps = {
  counter: CounterState;
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
  currentUserId: string;
};

export const SharedCounter: React.FC<SharedCounterProps> = ({
  counter,
  onIncrement,
  onDecrement,
  onReset,
  currentUserId,
}) => {
  const { value, lastAction } = counter;
  const isCurrentUserAction = lastAction?.userId === currentUserId;

  const getActionText = () => {
    if (!lastAction) return null;
    switch (lastAction.action) {
      case 'increment':
        return 'incremented';
      case 'decrement':
        return 'decremented';
      case 'reset':
        return 'reset';
      case 'set':
        return 'set';
      default:
        return 'changed';
    }
  };

  return (
    <div className="flex flex-col h-full rounded-lg border bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">Shared Counter</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            synced
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <div className="text-6xl font-bold tabular-nums transition-all duration-200">
          {value}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-lg"
            onClick={onDecrement}
            aria-label="Decrement counter"
          >
            <Minus className="size-5" />
          </Button>

          <Button
            variant="outline"
            size="icon-lg"
            onClick={onIncrement}
            aria-label="Increment counter"
          >
            <Plus className="size-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon-lg"
            onClick={onReset}
            aria-label="Reset counter"
            className="ml-2"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </div>

      {lastAction && (
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center gap-3">
            <div
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base"
              style={{ backgroundColor: lastAction.userColor + '20' }}
            >
              <span>{lastAction.userAvatar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className="font-medium text-sm"
                  style={{ color: lastAction.userColor }}
                >
                  {lastAction.userName}
                </span>
                {isCurrentUserAction && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                    You
                  </span>
                )}
                <span className="text-sm text-muted-foreground">
                  {getActionText()} the counter
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(lastAction.timestamp)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
