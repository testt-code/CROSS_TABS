import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Timer } from 'lucide-react';
import type { ChatMessage as ChatMessageType, User, SendMessageOptions } from '@/types';
import { Button } from '@/components/ui/button';
import { ChatMessage } from './ChatMessage';

type ChatPanelProps = {
  messages: ChatMessageType[];
  users: User[];
  currentUserId: string;
  onSendMessage: (text: string, options?: SendMessageOptions) => void;
  onDeleteMessage: (messageId: string) => void;
  onTyping: (isTyping: boolean) => void;
  loading?: boolean;
};

const EXPIRATION_OPTIONS = [
  { label: 'No expiration', value: 0 },
  { label: '30 seconds', value: 30 * 1000 },
  { label: '1 minute', value: 60 * 1000 },
  { label: '5 minutes', value: 5 * 60 * 1000 },
];

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  users,
  currentUserId,
  onSendMessage,
  onDeleteMessage,
  onTyping,
  loading = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [expirationDuration, setExpirationDuration] = useState(0);
  const [showExpirationMenu, setShowExpirationMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const typingUsers = users.filter((u) => u.isTyping && u.id !== currentUserId);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.trim()) {
      onTyping(true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    } else {
      onTyping(false);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const options: SendMessageOptions | undefined = expirationDuration > 0
      ? { expirationDuration }
      : undefined;

    onSendMessage(inputValue.trim(), options);
    setInputValue('');
    onTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedExpiration = EXPIRATION_OPTIONS.find((opt) => opt.value === expirationDuration);

  return (
    <div className="flex flex-col h-full rounded-lg border bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">Global Chat</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {messages.length} messages
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isOwnMessage={message.userId === currentUserId}
              onDelete={onDeleteMessage}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {typingUsers.length > 0 && (
        <div className="px-4 py-2 border-t bg-muted/30">
          <span className="text-xs text-muted-foreground animate-pulse">
            {typingUsers.map((u) => u.name).join(', ')}{' '}
            {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </span>
        </div>
      )}

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <div className="flex-1 flex">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Shift+Enter for new line)"
              className="flex-1 w-full px-3 py-2 pr-10 text-sm rounded-md border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={2}
            />
          </div>
          <div className="flex flex-col gap-1 items-center justify-center">
            <div className="relative">
              <Button
                variant={expirationDuration > 0 ? 'secondary' : 'ghost'}
                size="icon-sm"
                onClick={() => setShowExpirationMenu(!showExpirationMenu)}
                className={expirationDuration > 0 ? 'text-amber-600 dark:text-amber-400' : ''}
                aria-label="Set message expiration"
                title={selectedExpiration?.label}
              >
                <Timer className="size-4" />
              </Button>
              {showExpirationMenu && (
                <div className="absolute bottom-full right-0 mb-1 w-36 rounded-md border bg-popover p-1 shadow-md z-10">
                  {EXPIRATION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setExpirationDuration(option.value);
                        setShowExpirationMenu(false);
                      }}
                      className={`
                        w-full text-left px-2 py-1.5 text-sm rounded-sm transition-colors
                        ${expirationDuration === option.value
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-accent hover:text-accent-foreground'
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              size="icon-sm"
              aria-label="Send message"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
        {expirationDuration > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            Message will expire after {selectedExpiration?.label.toLowerCase()}
          </p>
        )}
      </div>
    </div>
  );
};
