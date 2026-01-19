import { useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type RestartIdentityButtonProps = {
  onRestart: () => void;
};

export const RestartIdentityButton: React.FC<RestartIdentityButtonProps> = ({
  onRestart,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  if (showConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setShowConfirm(false)}
        />
        <div className="relative bg-background border rounded-lg shadow-lg max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={() => setShowConfirm(false)}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-amber-500/10">
              <RefreshCw className="size-5 text-amber-500" />
            </div>
            <h3 className="font-semibold text-lg">Reset Identity?</h3>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            This will create a new identity with a different:
          </p>

          <ul className="text-sm text-muted-foreground mb-6 space-y-1 ml-4">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              User ID
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              Username
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              Avatar
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              Color
            </li>
          </ul>

          <p className="text-xs text-amber-600 dark:text-amber-400 mb-6">
            You will appear as a new user to others in the session.
          </p>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onRestart}
            >
              Reset Identity
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setShowConfirm(true)}
      className="gap-1.5 text-xs text-muted-foreground"
    >
      <RefreshCw className="size-3" />
      <span className="hidden sm:inline">New Identity</span>
    </Button>
  );
};
