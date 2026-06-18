import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import { useAuth } from "@workspace/replit-auth-web";

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
import AiTutor from "@/pages/ai-tutor";
import SpacedRepetition from "@/pages/spaced-repetition";
import Leaderboard from "@/pages/leaderboard";
import VoicePractice from "@/pages/voice-practice";
import OfflineLessons from "@/pages/offline";
import Notifications from "@/pages/notifications";

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
        <Route path="/spaced-repetition" component={SpacedRepetition} />
        <Route path="/practice" component={Practice} />
        <Route path="/voice" component={VoicePractice} />
        <Route path="/progress" component={Progress} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/japanese" component={JapaneseHub} />
        <Route path="/tutor" component={AiTutor} />
        <Route path="/offline" component={OfflineLessons} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/test/:language/:level" component={LevelTest} />
        <Route path="/certificate/:language/:level" component={Certificate} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function AppContent() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
            <span className="text-2xl">📚</span>
          </div>
          <div className="space-y-2 text-center">
            <div className="h-2 w-32 bg-secondary rounded-full animate-pulse mx-auto" />
            <div className="h-2 w-24 bg-secondary/60 rounded-full animate-pulse mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
