import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/ui/loading";
import NotFound from "@/pages/not-found";
import Unauthorized from "@/pages/unauthorized";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Inventory from "@/pages/inventory";
import Customers from "@/pages/customers";
import Billing from "@/pages/billing";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/inventory" component={Unauthorized} />
          <Route path="/customers" component={Unauthorized} />
          <Route path="/billing" component={Unauthorized} />
          <Route path="/reports" component={Unauthorized} />
          <Route path="/settings" component={Unauthorized} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/customers" component={Customers} />
          <Route path="/billing" component={Billing} />
          <Route path="/reports" component={Reports} />
          <Route path="/settings" component={Settings} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

import { ThemeProvider } from "./hooks/useTheme";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
