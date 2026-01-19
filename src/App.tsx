import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserPresencePanel } from "@/components/UserPresencePanel"
import { useCollaborativeSession } from "@/hooks/useCollaborativeSession"

const Dashboard: React.FC = () => {
  const {
    users,
    currentUser,
    isConnected,
    loading,
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
          <p className="text-muted-foreground">
            Open this page in multiple tabs to see real-time user presence!
          </p>
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