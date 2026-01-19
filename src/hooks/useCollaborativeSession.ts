import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useBroadcastChannel } from 'react-broadcast-sync';

import type {
  User,
  ChatMessage,
  ActivityEvent,
  ActivityType,
  LoadingStates,
  Theme,
  CursorPosition,
  FocusState,
  MessageType,
  UseCollaborativeSessionOptions,
  UseCollaborativeSessionReturn,
  CounterState,
  CounterAction,
  CounterLastAction,
  SendMessageOptions,
} from '../types';

import {
  HEARTBEAT_INTERVAL,
  USER_TIMEOUT,
  INITIALIZATION_TIMEOUT,
  DEFAULT_CHANNEL_NAME,
  DEFAULT_NAMESPACE,
  DEFAULT_ACTIVITY_LIMIT,
  DEFAULT_CURSOR_DEBOUNCE_MS,
  DEFAULT_TYPING_DEBOUNCE_MS,
  DEFAULT_DEDUPLICATION_TTL,
  DEFAULT_CLEANING_INTERVAL,
  DEFAULT_BATCHING_DELAY_MS,
  DEFAULT_PING_TIMEOUT,
  EXCLUDED_BATCH_MESSAGE_TYPES,
} from '@/constants/collaborative-session';

import {
  getRandomColor,
  getRandomAvatar,
  generateUserId,
  generateId,
  generateDefaultUserName,
} from '@/lib/collaborative-session';

import { useDebounce } from './useDebounce';

const REGISTERED_MESSAGE_TYPES: MessageType[] = [
  'user:join',
  'user:leave',
  'user:update',
  'user:typing',
  'user:heartbeat',
  'user:cursor',
  'user:focus',
  'chat:message',
  'chat:delete',
  'chat:clear',
  'counter:update',
  'theme:update',
  'activity:event',
  'state:request',
  'state:sync',
];

export function useCollaborativeSession(
  options: UseCollaborativeSessionOptions = {}
): UseCollaborativeSessionReturn {
  const {
    channelName = DEFAULT_CHANNEL_NAME,
    userName = generateDefaultUserName(),
    avatar: initialAvatar,
    namespace = DEFAULT_NAMESPACE,
    initialTheme = 'system',
    activityFeedLimit = DEFAULT_ACTIVITY_LIMIT,
    cursorDebounceMs = DEFAULT_CURSOR_DEBOUNCE_MS,
    typingDebounceMs = DEFAULT_TYPING_DEBOUNCE_MS,
  } = options;

  // Generate stable user ID for this session (persisted in sessionStorage to survive reloads)
  const [userId] = useState(() => {
    const storageKey = `collaborative-session-user-id-${channelName}`;
    const existingId = sessionStorage.getItem(storageKey);
    if (existingId) {
      return existingId;
    }
    const newId = generateUserId();
    sessionStorage.setItem(storageKey, newId);
    return newId;
  });

  const [userColor] = useState(() => {
    const storageKey = `collaborative-session-user-color-${channelName}`;
    const existingColor = sessionStorage.getItem(storageKey);
    if (existingColor) {
      return existingColor;
    }
    const newColor = getRandomColor();
    sessionStorage.setItem(storageKey, newColor);
    return newColor;
  });

  const [userAvatar, setUserAvatar] = useState(() => {
    if (initialAvatar) return initialAvatar;
    const storageKey = `collaborative-session-user-avatar-${channelName}`;
    const existingAvatar = sessionStorage.getItem(storageKey);
    if (existingAvatar) {
      return existingAvatar;
    }
    const newAvatar = getRandomAvatar();
    sessionStorage.setItem(storageKey, newAvatar);
    return newAvatar;
  });

  // Local state
  const [currentUserName, setCurrentUserName] = useState(userName);
  const [users, setUsers] = useState<User[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [counter, setCounter] = useState<CounterState>({ value: 0, lastAction: null });
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition | null>(null);
  const [focusState, setFocusState] = useState<FocusState | null>(null);

  // Loading states
  const [loading, setLoading] = useState<LoadingStates>({
    isInitializing: true,
    isSyncing: false,
    isSendingMessage: false,
  });

  // Track if we've received initial state
  const hasReceivedInitialState = useRef(false);
  const initializationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set up broadcast channel
  const {
    messages,
    postMessage,
    clearReceivedMessages,
    ping: broadcastPing,
    error,
  } = useBroadcastChannel(channelName, {
    sourceName: userId,
    namespace,
    registeredTypes: REGISTERED_MESSAGE_TYPES,
    deduplicationTTL: DEFAULT_DEDUPLICATION_TTL,
    cleaningInterval: DEFAULT_CLEANING_INTERVAL,
    batchingDelayMs: DEFAULT_BATCHING_DELAY_MS,
    excludedBatchMessageTypes: [...EXCLUDED_BATCH_MESSAGE_TYPES],
  });

  // Current user object
  const currentUser: User = useMemo(() => ({
    id: userId,
    name: currentUserName,
    color: userColor,
    avatar: userAvatar,
    joinedAt: Date.now(),
    isTyping,
    lastSeen: Date.now(),
    cursor: cursorPosition || undefined,
    focus: focusState || undefined,
  }), [userId, currentUserName, userColor, userAvatar, isTyping, cursorPosition, focusState]);

  // ============================================================================
  // Activity Feed Helper
  // ============================================================================

  const addActivity = useCallback((
    type: ActivityType,
    actorId: string,
    actorName: string,
    actorColor: string,
    details?: Record<string, unknown>
  ) => {
    const event: ActivityEvent = {
      id: generateId(),
      type,
      userId: actorId,
      userName: actorName,
      userColor: actorColor,
      timestamp: Date.now(),
      details,
    };

    setActivityFeed((prev) => {
      const updated = [event, ...prev];
      return updated.slice(0, activityFeedLimit);
    });

    // Broadcast activity to other tabs
    postMessage('activity:event', event);
  }, [activityFeedLimit, postMessage]);

  // ============================================================================
  // Message Handlers
  // ============================================================================

  useEffect(() => {
    if (messages.length === 0) return;

    messages.forEach((msg) => {
      // Skip messages from self
      if (msg.source === userId) return;

      const { type, message: payload } = msg;

      switch (type as MessageType) {
        case 'user:join': {
          const newUser: User = payload;
          setUsers((prev) => {
            if (prev.some((u) => u.id === newUser.id)) {
              return prev.map((u) =>
                u.id === newUser.id ? { ...u, lastSeen: Date.now() } : u
              );
            }
            return [...prev, { ...newUser, lastSeen: Date.now() }];
          });
          postMessage('user:join', currentUser);
          break;
        }

        case 'user:leave': {
          const { userId: leavingUserId } = payload;
          setUsers((prev) => prev.filter((u) => u.id !== leavingUserId));
          break;
        }

        case 'user:update': {
          const updatedUser: Partial<User> & { id: string } = payload;
          setUsers((prev) =>
            prev.map((u) =>
              u.id === updatedUser.id
                ? { ...u, ...updatedUser, lastSeen: Date.now() }
                : u
            )
          );
          break;
        }

        case 'user:typing': {
          const { userId: typingUserId, isTyping: typing } = payload;
          setUsers((prev) =>
            prev.map((u) =>
              u.id === typingUserId
                ? { ...u, isTyping: typing, lastSeen: Date.now() }
                : u
            )
          );
          break;
        }

        case 'user:cursor': {
          const { userId: cursorUserId, cursor } = payload;
          setUsers((prev) =>
            prev.map((u) =>
              u.id === cursorUserId
                ? { ...u, cursor, lastSeen: Date.now() }
                : u
            )
          );
          break;
        }

        case 'user:focus': {
          const { userId: focusUserId, focus } = payload;
          setUsers((prev) =>
            prev.map((u) =>
              u.id === focusUserId
                ? { ...u, focus, lastSeen: Date.now() }
                : u
            )
          );
          break;
        }

        case 'user:heartbeat': {
          const { userId: heartbeatUserId, user } = payload;
          setUsers((prev) => {
            const existing = prev.find((u) => u.id === heartbeatUserId);
            if (existing) {
              return prev.map((u) =>
                u.id === heartbeatUserId
                  ? { ...u, ...user, lastSeen: Date.now() }
                  : u
              );
            }
            return [...prev, { ...user, lastSeen: Date.now() }];
          });
          break;
        }

        case 'chat:message': {
          const chatMsg: ChatMessage = payload;
          setChatMessages((prev) => {
            if (prev.some((m) => m.id === chatMsg.id)) return prev;
            return [...prev, chatMsg];
          });
          break;
        }

        case 'chat:delete': {
          const { messageId } = payload;
          setChatMessages((prev) => prev.filter((m) => m.id !== messageId));
          break;
        }

        case 'chat:clear': {
          setChatMessages([]);
          break;
        }

        case 'counter:update': {
          const counterState: CounterState = payload;
          setCounter(counterState);
          break;
        }

        case 'theme:update': {
          const { theme: newTheme } = payload;
          setThemeState(newTheme);
          break;
        }

        case 'activity:event': {
          const event: ActivityEvent = payload;
          setActivityFeed((prev) => {
            if (prev.some((e) => e.id === event.id)) return prev;
            const updated = [event, ...prev];
            return updated.slice(0, activityFeedLimit);
          });
          break;
        }

        case 'state:request': {
          setLoading((prev) => ({ ...prev, isSyncing: true }));
          postMessage('state:sync', {
            users: users.map((u) => ({ ...u })),
            messages: chatMessages,
            counter,
            theme,
            activityFeed,
            from: userId,
          });
          setLoading((prev) => ({ ...prev, isSyncing: false }));
          break;
        }

        case 'state:sync': {
          const {
            users: syncedUsers,
            messages: syncedMessages,
            counter: syncedCounter,
            theme: syncedTheme,
            activityFeed: syncedActivity,
          } = payload;

          hasReceivedInitialState.current = true;

          setUsers((prev) => {
            const existingIds = new Set(prev.map((u) => u.id));
            const newUsers = (syncedUsers as User[]).filter(
              (u) => !existingIds.has(u.id) && u.id !== userId
            );
            return [...prev, ...newUsers];
          });

          setChatMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMessages = (syncedMessages as ChatMessage[]).filter(
              (m) => !existingIds.has(m.id)
            );
            return [...prev, ...newMessages].sort((a, b) => a.timestamp - b.timestamp);
          });

          if (counter.lastAction === null && syncedCounter !== undefined) {
            setCounter(syncedCounter as CounterState);
          }

          if (syncedTheme) {
            setThemeState(syncedTheme);
          }

          if (syncedActivity) {
            setActivityFeed((prev) => {
              const existingIds = new Set(prev.map((e) => e.id));
              const newEvents = (syncedActivity as ActivityEvent[]).filter(
                (e) => !existingIds.has(e.id)
              );
              const merged = [...newEvents, ...prev];
              merged.sort((a, b) => b.timestamp - a.timestamp);
              return merged.slice(0, activityFeedLimit);
            });
          }

          setLoading((prev) => ({ ...prev, isInitializing: false, isSyncing: false }));
          break;
        }
      }
    });

    clearReceivedMessages();
  }, [messages, userId, currentUser, postMessage, clearReceivedMessages, users, chatMessages, counter, theme, activityFeed, activityFeedLimit]);

  // ============================================================================
  // Presence Management
  // ============================================================================

  // Announce presence on mount and request state
  useEffect(() => {
    postMessage('user:join', currentUser);
    postMessage('state:request', { userId });

    addActivity('user_joined', userId, currentUserName, userColor);

    initializationTimeout.current = setTimeout(() => {
      if (!hasReceivedInitialState.current) {
        setLoading((prev) => ({ ...prev, isInitializing: false }));
      }
    }, INITIALIZATION_TIMEOUT);

    return () => {
      postMessage('user:leave', { userId });
      if (initializationTimeout.current) {
        clearTimeout(initializationTimeout.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Heartbeat to maintain presence
  useEffect(() => {
    const interval = setInterval(() => {
      postMessage('user:heartbeat', { userId, user: currentUser });
    }, HEARTBEAT_INTERVAL);

    return () => clearInterval(interval);
  }, [postMessage, userId, currentUser]);

  // Clean up inactive users
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setUsers((prev) => {
        const activeUsers = prev.filter((u) => now - u.lastSeen < USER_TIMEOUT);
        const timedOutUsers = prev.filter((u) => now - u.lastSeen >= USER_TIMEOUT);
        timedOutUsers.forEach((u) => {
          const event: ActivityEvent = {
            id: generateId(),
            type: 'user_left',
            userId: u.id,
            userName: u.name,
            userColor: u.color,
            timestamp: Date.now(),
          };
          setActivityFeed((prevFeed) => [event, ...prevFeed].slice(0, activityFeedLimit));
        });
        return activeUsers;
      });
    }, HEARTBEAT_INTERVAL);

    return () => clearInterval(interval);
  }, [activityFeedLimit]);

  // Clean up expired messages
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setChatMessages((prev) => {
        const validMessages = prev.filter(
          (m) => !m.expirationDate || m.expirationDate > now
        );
        return validMessages.length !== prev.length ? validMessages : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ============================================================================
  // Debounced Actions
  // ============================================================================

  const debouncedPostCursor = useDebounce(
    (cursor: CursorPosition | null) => {
      postMessage('user:cursor', { userId, cursor });
    },
    cursorDebounceMs
  );

  const debouncedPostTyping = useDebounce(
    (typing: boolean) => {
      postMessage('user:typing', { userId, isTyping: typing });
    },
    typingDebounceMs
  );

  // ============================================================================
  // Actions
  // ============================================================================

  const updateUserName = useCallback((name: string) => {
    const oldName = currentUserName;
    setCurrentUserName(name);
    postMessage('user:update', { id: userId, name });
    addActivity('name_changed', userId, name, userColor, { oldName, newName: name });
  }, [postMessage, userId, currentUserName, userColor, addActivity]);

  const updateAvatar = useCallback((avatar: string) => {
    setUserAvatar(avatar);
    sessionStorage.setItem(`collaborative-session-user-avatar-${channelName}`, avatar);
    postMessage('user:update', { id: userId, avatar });
  }, [postMessage, userId, channelName]);

  const markTyping = useCallback((typing: boolean) => {
    setIsTyping(typing);
    debouncedPostTyping(typing);
  }, [debouncedPostTyping]);

  const updateCursor = useCallback((position: CursorPosition | null) => {
    setCursorPosition(position);
    debouncedPostCursor(position);
  }, [debouncedPostCursor]);

  const updateFocus = useCallback((focus: FocusState | null) => {
    setFocusState(focus);
    postMessage('user:focus', { userId, focus });
  }, [postMessage, userId]);

  const sendMessage = useCallback((text: string, options?: SendMessageOptions) => {
    if (!text.trim()) return;

    setLoading((prev) => ({ ...prev, isSendingMessage: true }));

    const now = Date.now();
    const chatMsg: ChatMessage = {
      id: generateId(),
      userId,
      userName: currentUserName,
      userColor,
      userAvatar,
      text: text.trim(),
      timestamp: now,
      expirationDate: options?.expirationDuration
        ? now + options.expirationDuration
        : undefined,
    };

    setChatMessages((prev) => [...prev, chatMsg]);
    postMessage('chat:message', chatMsg);
    markTyping(false);
    addActivity('message_sent', userId, currentUserName, userColor, { preview: text.slice(0, 50) });

    setLoading((prev) => ({ ...prev, isSendingMessage: false }));
  }, [postMessage, userId, currentUserName, userColor, userAvatar, markTyping, addActivity]);

  const deleteMessage = useCallback((messageId: string) => {
    setChatMessages((prev) => prev.filter((m) => m.id !== messageId));
    postMessage('chat:delete', { messageId });
  }, [postMessage]);

  const clearMessages = useCallback(() => {
    setChatMessages([]);
    postMessage('chat:clear', {});
  }, [postMessage]);

  const createCounterState = useCallback((
    newValue: number,
    previousValue: number,
    action: CounterAction
  ): CounterState => {
    const lastAction: CounterLastAction = {
      userId,
      userName: currentUserName,
      userColor,
      userAvatar,
      action,
      previousValue,
      newValue,
      timestamp: Date.now(),
    };
    return { value: newValue, lastAction };
  }, [userId, currentUserName, userColor, userAvatar]);

  const updateCounter = useCallback((value: number) => {
    const oldValue = counter.value;
    const newCounterState = createCounterState(value, oldValue, 'set');
    setCounter(newCounterState);
    postMessage('counter:update', newCounterState);
    addActivity('counter_changed', userId, currentUserName, userColor, { oldValue, newValue: value });
  }, [postMessage, counter.value, userId, currentUserName, userColor, addActivity, createCounterState]);

  const incrementCounter = useCallback(() => {
    setCounter((prev) => {
      const newValue = prev.value + 1;
      const newCounterState = createCounterState(newValue, prev.value, 'increment');
      postMessage('counter:update', newCounterState);
      addActivity('counter_changed', userId, currentUserName, userColor, { oldValue: prev.value, newValue });
      return newCounterState;
    });
  }, [postMessage, userId, currentUserName, userColor, addActivity, createCounterState]);

  const decrementCounter = useCallback(() => {
    setCounter((prev) => {
      const newValue = prev.value - 1;
      const newCounterState = createCounterState(newValue, prev.value, 'decrement');
      postMessage('counter:update', newCounterState);
      addActivity('counter_changed', userId, currentUserName, userColor, { oldValue: prev.value, newValue });
      return newCounterState;
    });
  }, [postMessage, userId, currentUserName, userColor, addActivity, createCounterState]);

  const resetCounter = useCallback(() => {
    const oldValue = counter.value;
    const newCounterState = createCounterState(0, oldValue, 'reset');
    setCounter(newCounterState);
    postMessage('counter:update', newCounterState);
    addActivity('counter_changed', userId, currentUserName, userColor, { oldValue, newValue: 0 });
  }, [postMessage, counter.value, userId, currentUserName, userColor, addActivity, createCounterState]);

  const setTheme = useCallback((newTheme: Theme) => {
    const oldTheme = theme;
    setThemeState(newTheme);
    postMessage('theme:update', { theme: newTheme });
    addActivity('theme_changed', userId, currentUserName, userColor, { oldTheme, newTheme });
  }, [postMessage, theme, userId, currentUserName, userColor, addActivity]);

  const ping = useCallback(async () => {
    return broadcastPing(DEFAULT_PING_TIMEOUT);
  }, [broadcastPing]);

  const clearActivityFeed = useCallback(() => {
    setActivityFeed([]);
  }, []);

  // ============================================================================
  // Return Value
  // ============================================================================

  return {
    // State
    users,
    messages: chatMessages,
    counter,
    theme,
    activityFeed,
    currentUser,
    isConnected: !error,
    error,
    loading,

    // User actions
    updateUserName,
    updateAvatar,
    markTyping,
    updateCursor,
    updateFocus,

    // Chat actions
    sendMessage,
    deleteMessage,
    clearMessages,

    // Counter actions
    updateCounter,
    incrementCounter,
    decrementCounter,
    resetCounter,

    // Theme actions
    setTheme,

    // Utility
    ping,
    clearActivityFeed,
  };
}
