import { useGetProgress } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Target, Zap, Flame, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function ProgressPage() {
  const { data: progress, isLoading } = useGetProgress();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  // Placeholder data if API returns empty
  const currentProgress = progress || {
    language: 'English',
    level: 'B1',
    totalXp: 12450,
    lessonsCompleted: 42,
    currentStreak: 12,
    wordsLearned: 350,
    readingScore: 75,
    listeningScore: 60,
    writingScore: 85
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-gradient mb-2">Your Progress</h1>
          <p className="text-muted-foreground">Track your journey to fluency.</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Current Level</div>
          <div className="text-2xl font-bold font-display text-primary">{currentProgress.level} {currentProgress.language}</div>
        </div>
      </header>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 glass-card border-primary/20 bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden">
          <Zap className="w-24 h-24 absolute -right-4 -bottom-4 text-primary/10" />
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">Total XP</h3>
            <div className="text-5xl font-display font-bold text-foreground">
              {currentProgress.totalXp.toLocaleString()}
            </div>
          </div>
        </Card>
        
        <Card className="p-6 glass-card border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-transparent relative overflow-hidden">
          <Flame className="w-24 h-24 absolute -right-4 -bottom-4 text-orange-500/10" />
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-orange-500 mb-2 uppercase tracking-wider">Day Streak</h3>
            <div className="text-5xl font-display font-bold text-foreground">
              {currentProgress.currentStreak}
            </div>
          </div>
        </Card>
        
        <Card className="p-6 glass-card border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent relative overflow-hidden">
          <Trophy className="w-24 h-24 absolute -right-4 -bottom-4 text-emerald-500/10" />
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-emerald-500 mb-2 uppercase tracking-wider">Lessons</h3>
            <div className="text-5xl font-display font-bold text-foreground">
              {currentProgress.lessonsCompleted}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-border/50">
        {/* Skill breakdown */}
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" /> Skill Breakdown
          </h2>
          <Card className="p-8 glass-card space-y-8 border-border/50">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-medium text-lg">Reading</span>
                <span className="font-bold text-blue-400">{currentProgress.readingScore || 0}%</span>
              </div>
              <Progress value={currentProgress.readingScore || 0} className="h-3 [&>div]:bg-blue-500 bg-secondary" />
            </div>
            
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-medium text-lg">Listening</span>
                <span className="font-bold text-purple-400">{currentProgress.listeningScore || 0}%</span>
              </div>
              <Progress value={currentProgress.listeningScore || 0} className="h-3 [&>div]:bg-purple-500 bg-secondary" />
            </div>
            
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-medium text-lg">Writing</span>
                <span className="font-bold text-emerald-400">{currentProgress.writingScore || 0}%</span>
              </div>
              <Progress value={currentProgress.writingScore || 0} className="h-3 [&>div]:bg-emerald-500 bg-secondary" />
            </div>
          </Card>
        </div>

        {/* Achievements */}
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-500" /> Achievements
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 glass-card border-yellow-500/30 bg-yellow-500/5 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-3">
                <Flame className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="font-bold mb-1">7 Day Streak</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </Card>
            
            <Card className="p-4 glass-card border-blue-500/30 bg-blue-500/5 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                <Award className="w-6 h-6 text-blue-400" />
              </div>
              <div className="font-bold mb-1">First Steps</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </Card>
            
            <Card className="p-4 glass-card border-border bg-secondary/20 text-center flex flex-col items-center justify-center opacity-60 grayscale">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Flame className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="font-bold mb-1">30 Day Streak</div>
              <div className="text-xs text-muted-foreground">Locked</div>
            </Card>
            
            <Card className="p-4 glass-card border-border bg-secondary/20 text-center flex flex-col items-center justify-center opacity-60 grayscale">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Trophy className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="font-bold mb-1">Vocabulary Master</div>
              <div className="text-xs text-muted-foreground">Locked</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}