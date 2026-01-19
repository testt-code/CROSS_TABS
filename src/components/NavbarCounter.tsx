import { Minus, Plus, RotateCcw } from 'lucide-react';
import type { CollaborativeActions, CounterState } from '@/types';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from '@/lib/time';

type NavbarCounterProps = {
  counter: CounterState;
  onIncrement: CollaborativeActions['incrementCounter'];
  onDecrement: CollaborativeActions['decrementCounter'];
  onReset: CollaborativeActions['resetCounter'];
};

export const NavbarCounter: React.FC<NavbarCounterProps> = ({
  counter,
  onIncrement,
  onDecrement,
  onReset,
}) => {
  const { value, lastAction } = counter;

  return (
    <div className="flex items-center gap-2">
      {lastAction && (
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
          last modified by:
          <span
            className="size-5 rounded-full flex items-center justify-center text-xs"
            style={{ backgroundColor: lastAction.userColor + '20' }}
          >
            {lastAction.userAvatar}
          </span>
          <span className="max-w-[80px] truncate font-medium" style={{ color: lastAction.userColor }}>
            {lastAction.userName}
          </span>
          <span>{formatDistanceToNow(lastAction.timestamp)}</span>
        </div>
      )}

      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 border">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDecrement}
          aria-label="Decrement counter"
          className="size-7"
        >
          <Minus className="size-3.5" />
        </Button>

        <span className="min-w-[3ch] text-center font-bold tabular-nums text-lg">
          {value}
        </span>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onIncrement}
          aria-label="Increment counter"
          className="size-7"
        >
          <Plus className="size-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onReset}
          aria-label="Reset counter"
          className="size-7 ml-1"
        >
          <RotateCcw className="size-3" />
        </Button>
      </div>
    </div>
  );
};
