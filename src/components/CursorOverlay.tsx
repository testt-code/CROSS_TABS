import type { User } from '@/types';

type CursorOverlayProps = {
  users: User[];
  currentUserId: string;
};

export const CursorOverlay: React.FC<CursorOverlayProps> = ({
  users,
  currentUserId,
}) => {
  const usersWithCursors = users.filter(
    (user) => user.id !== currentUserId && user.cursor
  );

  if (usersWithCursors.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-100 overflow-hidden">
      {usersWithCursors.map((user) => (
        <div
          key={user.id}
          className="absolute transition-all duration-75 ease-out"
          style={{
            left: user.cursor!.x,
            top: user.cursor!.y,
            transform: 'translate(-2px, -2px)',
          }}
        >
          {/* Cursor pointer */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="drop-shadow-md"
          >
            <path
              d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.85a.5.5 0 0 0-.85.36Z"
              fill={user.color}
              stroke="white"
              strokeWidth="1.5"
            />
          </svg>

          {/* User label */}
          <div
            className="absolute left-4 top-5 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap shadow-sm"
            style={{
              backgroundColor: user.color,
              color: 'white',
            }}
          >
            <span className="mr-1">{user.avatar}</span>
            {user.name}
          </div>
        </div>
      ))}
    </div>
  );
};
