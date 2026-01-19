import { useState } from "react"
import { Menu, X, Users } from "lucide-react"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserPresencePanel } from "@/components/UserPresencePanel"
import { NavbarCounter } from "@/components/NavbarCounter"
import { ChatPanel } from "@/components/ChatPanel"
import { ActivityFeed } from "@/components/ActivityFeed"
import { RestartIdentityButton } from "@/components/RestartIdentityButton"
import { Button } from "@/components/ui/button"
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
  activityFeed: CollaborativeSessionReturn['activityFeed'];
  resetIdentity: CollaborativeSessionReturn['resetIdentity'];
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
  activityFeed,
  resetIdentity,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const onlineCount = users.length + 1;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-3 sm:p-4 border-b gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
          <h1 className="text-lg sm:text-xl font-bold">Cross Tabs</h1>
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex md:hidden items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
          >
            <Users className="size-3" />
            {onlineCount}
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <NavbarCounter
            counter={counter}
            onIncrement={incrementCounter}
            onDecrement={decrementCounter}
            onReset={resetCounter}
          />
          <RestartIdentityButton onRestart={resetIdentity} />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex h-[calc(100vh-65px)] relative">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed md:relative inset-y-0 left-0 z-50 md:z-0
            w-72 bg-background border-r shrink-0
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            md:transform-none
          `}
        >
          <div className="flex items-center justify-between p-4 border-b md:hidden">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Users</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {onlineCount} online
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-xs text-muted-foreground">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
              >
                <X className="size-5" />
              </Button>
            </div>
          </div>
          <div className="h-[calc(100vh-130px)] md:h-full overflow-hidden">
            <UserPresencePanel
              users={users}
              currentUser={currentUser}
              isConnected={isConnected}
              loading={loading.isInitializing}
              mobileDrawerMode
            />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 p-3 sm:p-4 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            <div className="min-h-[350px] lg:h-full">
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
            <div className="min-h-[300px] lg:h-full">
              <ActivityFeed
                activities={activityFeed}
                currentUserId={currentUser.id}
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
    activityFeed,
    resetIdentity,
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
        activityFeed={activityFeed}
        resetIdentity={resetIdentity}
      />
    </ThemeProvider>
  );
};

export const App: React.FC = () => {
  return <CollaborativeApp />;
}