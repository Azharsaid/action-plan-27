/** Operational Ledger design reminder: the shell is a Swiss-editorial budget workspace with a dark rail, country ribbon, and ledger-first content. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Router, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { AppShell } from "./components/AppShell";
import { WorkspaceProvider, useWorkspace } from "./contexts/WorkspaceContext";
import Dashboard from "./pages/Dashboard";
import PlanPage from "./pages/PlanPage";
import SharedActivitiesPage from "./pages/SharedActivitiesPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

function AuthenticatedRoutes() {
  const { user, authLoading, firebaseReady } = useWorkspace();
  if (authLoading) return <div className="app-loading"><span className="ledger-loader" />Opening your workspace…</div>;
  if (firebaseReady && !user) return <LoginPage />;
  return <AppShell><Switch><Route path="/" component={Dashboard} /><Route path="/plan" component={PlanPage} /><Route path="/shared" component={SharedActivitiesPage} /><Route path="/admin" component={AdminPage} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></AppShell>;
}

const routerBase = import.meta.env.BASE_URL.replace(/\/$/, "");

function App() {
  return <Router base={routerBase}><ErrorBoundary><TooltipProvider><WorkspaceProvider><AuthenticatedRoutes /><Toaster /></WorkspaceProvider></TooltipProvider></ErrorBoundary></Router>;
}
export default App;
