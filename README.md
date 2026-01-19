# Cross-Tabs

A real-time collaborative application that enables multiple browser tabs or windows to communicate and synchronize state without a backend server. Built with React and the Broadcast Channel API.

**[Live Demo](https://cross-tabs.vercel.app/)**

## Features

- **Cross-Tab Communication** - Seamless real-time sync between browser tabs/windows using the Broadcast Channel API
- **User Presence** - Live user tracking with avatars, colors, and online status indicators
- **Real-Time Chat** - Global chat with typing indicators, message deletion, and configurable auto-expiration
- **Shared Counter** - Synchronized counter that all connected users can modify
- **Theme Sync** - Light/Dark/System theme preferences synchronized across all tabs
- **Activity Feed** - Live event log tracking joins, leaves, messages, and state changes

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **react-broadcast-sync** for cross-tab communication

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
git clone https://github.com/testt-code/CROSS_TABS.git
cd CROSS_TABS
npm install
```

### Development

```bash
npm run dev
```

Open multiple browser tabs at `http://localhost:5173` to see the cross-tab communication in action.

### Build

```bash
npm run build
npm run preview
```

### Linting

```bash
npm run lint
```

## How It Works

### Broadcast Channel API

The app uses the [Broadcast Channel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API) via `react-broadcast-sync` to enable communication between browser contexts (tabs, windows, iframes) of the same origin without a server.

### Message Types

The system uses a message-based architecture with the following types:

| Category | Messages |
|----------|----------|
| User | `user:join`, `user:leave`, `user:update`, `user:typing`, `user:heartbeat` |
| Chat | `chat:message`, `chat:delete`, `chat:clear` |
| State | `counter:update`, `theme:update`, `activity:event` |
| Sync | `state:request`, `state:sync` |

### State Synchronization Flow

1. **Join** - New user broadcasts join message with profile (name, avatar, color)
2. **State Request** - New user requests current state from existing users
3. **State Sync** - Existing user responds with full state (messages, counter, theme, activity)
4. **Heartbeat** - Users send heartbeat every 5 seconds to signal presence
5. **Timeout** - Users inactive for 30+ seconds are automatically removed

### Key Configuration

```typescript
HEARTBEAT_INTERVAL = 5000ms    // Presence check interval
USER_TIMEOUT = 30000ms         // Remove inactive users after this
ACTIVITY_FEED_LIMIT = 50       // Max events retained
```

## Project Structure

```
src/
├── components/
│   ├── ui/                    # Base UI components
│   ├── Chat*/                 # Chat components
│   ├── User*/                 # User presence components
│   ├── Activity*/             # Activity feed
│   └── Shared*/               # Shared state (counter)
├── hooks/
│   ├── useCollaborativeSession.ts   # Main orchestration hook
│   ├── useTheme.ts                  # Theme management
│   └── useDebounce.ts               # Debounce utility
├── lib/
│   ├── collaborative-session.ts     # ID/color/avatar generation
│   └── time.ts                      # Time formatting
├── constants/
│   └── collaborative-session.ts     # Configuration constants
├── context/
│   └── ThemeContext.ts              # Theme provider
└── types.ts                         # TypeScript definitions
```