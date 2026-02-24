import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";
import RechargePage from "./pages/RechargePage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/lobby" component={LobbyPage} />
      <Route path="/game/:tableId" component={GamePage} />
      <Route path="/recharge" component={RechargePage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            toastOptions={{
              style: {
                background: 'rgba(15, 15, 22, 0.95)',
                border: '1px solid rgba(201, 168, 76, 0.3)',
                color: '#F5E6C8',
                fontFamily: 'Rajdhani, sans-serif',
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
