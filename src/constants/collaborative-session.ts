export const COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e',
] as const;

export const AVATARS = [
    '👤', '😀', '😎', '🤓', '🧑‍💻', '👨‍💻', '👩‍💻', '🦊', '🐱', '🐶',
    '🐼', '🦁', '🐯', '🐨', '🐸', '🦄', '🐙', '🦋', '🌟', '🔥',
] as const;

export const HEARTBEAT_INTERVAL = 5000;

export const USER_TIMEOUT = HEARTBEAT_INTERVAL * 2.5;

export const INITIALIZATION_TIMEOUT = 1000;

export const DEFAULT_CHANNEL_NAME = 'collaborative-session';
export const DEFAULT_NAMESPACE = 'collab';
export const DEFAULT_ACTIVITY_LIMIT = 50;
export const DEFAULT_CURSOR_DEBOUNCE_MS = 50;
export const DEFAULT_TYPING_DEBOUNCE_MS = 300;
export const DEFAULT_DEDUPLICATION_TTL = 1000;
export const DEFAULT_CLEANING_INTERVAL = 2000;
export const DEFAULT_BATCHING_DELAY_MS = 20;
export const DEFAULT_PING_TIMEOUT = 500;

export const EXCLUDED_BATCH_MESSAGE_TYPES = ['user:cursor', 'user:typing'] as const;