import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
import LearnHub from "@/pages/learn";
import LevelDetail from "@/pages/level";
import LessonView from "@/pages/lesson";
import Vocabulary from "@/pages/vocabulary";
import Practice from "@/pages/practice";
import Progress from "@/pages/progress";
import JapaneseHub from "@/pages/japanese";
import LevelTest from "@/pages/level-test";
import Certificate from "@/pages/certificate";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/learn" component={LearnHub} />
        <Route path="/learn/:language/:level" component={LevelDetail} />
        <Route path="/lesson/:id" component={LessonView} />
        <Route path="/vocabulary" component={Vocabulary} />
        <Route path="/practice" component={Practice} />
        <Route path="/progress" component={Progress} />
        <Route path="/japanese" component={JapaneseHub} />
        <Route path="/test/:language/:level" component={LevelTest} />
        <Route path="/certificate/:language/:level" component={Certificate} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;