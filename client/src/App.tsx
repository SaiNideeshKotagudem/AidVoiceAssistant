import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";

import Home from "@/pages/home";
import Guide from "@/pages/guide";
import Translate from "@/pages/translate";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

import { useAccessibility } from "@/hooks/use-accessibility";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/guide" component={Guide} />
      <Route path="/translate" component={Translate} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { accessibilitySettings } = useAccessibility();

  useEffect(() => {
    // Apply accessibility settings to document
    if (accessibilitySettings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    if (accessibilitySettings.largeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
  }, [accessibilitySettings]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;