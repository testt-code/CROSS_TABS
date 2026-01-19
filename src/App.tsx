import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserPresencePanel } from "@/components/UserPresencePanel"
import { SharedCounter } from "@/components/SharedCounter"
import { ChatPanel } from "@/components/ChatPanel"
import { useCollaborativeSession } from "@/hooks/useCollaborativeSession"
import type { Theme } from "@/types"


type CollaborativeSessionReturn = ReturnType<typeof useCollaborativeSession>;

type DashboardProps = {
  users: CollaborativeSessionReturn['users'];
  currentUser: CollaborativeSessionReturn['currentUser'];
  isConnected: boolean;
  loading: CollaborativeSessionReturn['loading'];
  counter: CollaborativeSessionReturn['counter'];
  incrementCounter: CollaborativeSessionReturn['incrementCounter'];
  decrementCounter: CollaborativeSessionReturn['decrementCounter'];
  resetCounter: CollaborativeSessionReturn['resetCounter'];
  messages: CollaborativeSessionReturn['messages'];
  sendMessage: CollaborativeSessionReturn['sendMessage'];
  deleteMessage: CollaborativeSessionReturn['deleteMessage'];
  markTyping: CollaborativeSessionReturn['markTyping'];
};

const Dashboard: React.FC<DashboardProps> = ({
  users,
  currentUser,
  isConnected,
  loading,
  counter,
  incrementCounter,
  decrementCounter,
  resetCounter,
  messages,
  sendMessage,
  deleteMessage,
  markTyping,
}) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">Cross Tabs</h1>
        <ThemeToggle />
      </header>
      <main className="flex h-[calc(100vh-65px)]">
        <aside className="w-72 border-r shrink-0">
          <UserPresencePanel
            users={users}
            currentUser={currentUser}
            isConnected={isConnected}
            loading={loading.isInitializing}
          />
        </aside>

        <div className="flex-1 p-4 overflow-hidden">
          <p className="text-muted-foreground mb-4">
            Open this page in multiple tabs to see real-time collaboration!
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100%-2rem)]">
            <div className="flex flex-col gap-4">
              <SharedCounter
                counter={counter}
                onIncrement={incrementCounter}
                onDecrement={decrementCounter}
                onReset={resetCounter}
                currentUserId={currentUser.id}
              />
            </div>
            <div className="min-h-[400px] lg:h-full">
              <ChatPanel
                messages={messages}
                users={users}
                currentUserId={currentUser.id}
                onSendMessage={sendMessage}
                onDeleteMessage={deleteMessage}
                onTyping={markTyping}
                loading={loading.isInitializing}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const CollaborativeApp: React.FC = () => {
  const {
    users,
    currentUser,
    isConnected,
    loading,
    counter,
    incrementCounter,
    decrementCounter,
    resetCounter,
    messages,
    sendMessage,
    deleteMessage,
    markTyping,
    theme,
    setTheme,
  } = useCollaborativeSession();

  return (
    <ThemeProvider
      defaultTheme="system"
      storageKey="vite-ui-theme"
      syncedTheme={theme}
      onThemeChange={(newTheme: Theme) => setTheme(newTheme)}
    >
      <Dashboard
        users={users}
        currentUser={currentUser}
        isConnected={isConnected}
        loading={loading}
        counter={counter}
        incrementCounter={incrementCounter}
        decrementCounter={decrementCounter}
        resetCounter={resetCounter}
        messages={messages}
        sendMessage={sendMessage}
        deleteMessage={deleteMessage}
        markTyping={markTyping}
      />
    </ThemeProvider>
  );
};

export const App: React.FC = () => {
  return <CollaborativeApp />;
}