import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserPresencePanel } from "@/components/UserPresencePanel"
import { SharedCounter } from "@/components/SharedCounter"
import { useCollaborativeSession } from "@/hooks/useCollaborativeSession"

const Dashboard: React.FC = () => {
  const {
    users,
    currentUser,
    isConnected,
    loading,
    counter,
    incrementCounter,
    decrementCounter,
    resetCounter,
  } = useCollaborativeSession();

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

        <div className="flex-1 p-4">
          <p className="text-muted-foreground mb-6">
            Open this page in multiple tabs to see real-time collaboration!
          </p>
          <div className="max-w-md">
            <SharedCounter
              counter={counter}
              onIncrement={incrementCounter}
              onDecrement={decrementCounter}
              onReset={resetCounter}
              currentUserId={currentUser.id}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Dashboard />
    </ThemeProvider>
  )
}