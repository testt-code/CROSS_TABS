
export type Theme = 'light' | 'dark' | 'system';

export interface CursorPosition {
  x: number;
  y: number;
  elementId?: string;
}

export interface FocusState {
  elementId: string | null;
  elementType: string | null;
}

export interface User {
  id: string;
  name: string;
  color: string;
  avatar: string;
  joinedAt: number;
  isTyping: boolean;
  lastSeen: number;
  cursor?: CursorPosition;
  focus?: FocusState;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  userAvatar: string;
  text: string;
  timestamp: number;
  expirationDate?: number;
}

export interface SendMessageOptions {
  expirationDuration?: number;
}

export type CounterAction = 'increment' | 'decrement' | 'reset' | 'set';

export interface CounterLastAction {
  userId: string;
  userName: string;
  userColor: string;
  userAvatar: string;
  action: CounterAction;
  previousValue: number;
  newValue: number;
  timestamp: number;
}

export interface CounterState {
  value: number;
  lastAction: CounterLastAction | null;
}

export type ActivityType =
  | 'user_joined'
  | 'user_left'
  | 'message_sent'
  | 'counter_changed'
  | 'theme_changed'
  | 'name_changed';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  userColor: string;
  timestamp: number;
  details?: Record<string, unknown>;
}

export interface LoadingStates {
  isInitializing: boolean;
  isSyncing: boolean;
  isSendingMessage: boolean;
}

export interface CollaborativeState {
  users: User[];
  messages: ChatMessage[];
  counter: CounterState;
  theme: Theme;
  activityFeed: ActivityEvent[];
}

export interface CollaborativeActions {
  updateUserName: (name: string) => void;
  updateAvatar: (avatar: string) => void;
  markTyping: (isTyping: boolean) => void;
  updateCursor: (position: CursorPosition | null) => void;
  updateFocus: (focus: FocusState | null) => void;

  sendMessage: (text: string, options?: SendMessageOptions) => void;
  deleteMessage: (messageId: string) => void;
  clearMessages: () => void;

  updateCounter: (value: number) => void;
  incrementCounter: () => void;
  decrementCounter: () => void;
  resetCounter: () => void;

  setTheme: (theme: Theme) => void;

  ping: () => Promise<string[]>;
  clearActivityFeed: () => void;
}

export interface UseCollaborativeSessionOptions {
  channelName?: string;
  userName?: string;
  avatar?: string;
  namespace?: string;
  initialTheme?: Theme;
  activityFeedLimit?: number;
  cursorDebounceMs?: number;
  typingDebounceMs?: number;
}

export interface UseCollaborativeSessionReturn extends CollaborativeState, CollaborativeActions {
  currentUser: User;
  isConnected: boolean;
  error: string | null;
  loading: LoadingStates;
}

export type MessageType =
  | 'user:join'
  | 'user:leave'
  | 'user:update'
  | 'user:typing'
  | 'user:heartbeat'
  | 'user:cursor'
  | 'user:focus'
  | 'chat:message'
  | 'chat:delete'
  | 'chat:clear'
  | 'counter:update'
  | 'theme:update'
  | 'activity:event'
  | 'state:request'
  | 'state:sync';
