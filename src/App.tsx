import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"

export const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background text-foreground">
        <header className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold">Cross Tabs</h1>
          <ThemeToggle />
        </header>
        <main className="p-4">
          <p>Welcome to your app with theme support!</p>
        </main>
      </div>
    </ThemeProvider>
  )
}