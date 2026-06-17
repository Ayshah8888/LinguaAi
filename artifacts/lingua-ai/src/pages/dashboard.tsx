import { useGetDashboardSummary, useGetLearningStreak } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Target, BookOpen, Star, ArrowRight, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: streak, isLoading: isLoadingStreak } = useGetLearningStreak();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-gradient">Welcome back, John</h1>
          <p className="text-muted-foreground mt-2">You're on a roll. Keep up the momentum.</p>
        </div>
        
        {/* Daily Goal Badge */}
        <div className="flex items-center gap-3 bg-secondary/50 border border-border px-4 py-2 rounded-2xl">
          <div className="bg-primary/20 p-2 rounded-full">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">DAILY GOAL</p>
            <p className="text-sm font-semibold">
              {streak?.todayXp || 0} / {streak?.dailyGoalXp || 50} XP
            </p>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Streak Card */}
        <Card className="p-6 glass-card border-orange-500/20 bg-orange-500/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex flex-col h-full relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-orange-200">Current Streak</span>
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            {isLoadingStreak ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-display font-bold text-orange-400">{streak?.currentStreak || 0}</span>
                <span className="text-sm text-orange-500/70">days</span>
              </div>
            )}
          </div>
        </Card>

        {/* XP Card */}
        <Card className="p-6 glass-card border-primary/20 bg-primary/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex flex-col h-full relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-primary/70">Total XP</span>
              <Zap className="w-5 h-5 text-primary" />
            </div>
            {isLoadingSummary ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-display font-bold text-primary">{summary?.totalXp?.toLocaleString() || 0}</span>
                <span className="text-sm text-primary/70">XP</span>
              </div>
            )}
          </div>
        </Card>

        {/* Lessons Completed */}
        <Card className="p-6 glass-card border-blue-500/20 bg-blue-500/5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-blue-200">Lessons Done</span>
            <BookOpen className="w-5 h-5 text-blue-500" />
          </div>
          {isLoadingSummary ? (
            <Skeleton className="h-10 w-16" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-display font-bold text-blue-400">{summary?.lessonsCompleted || 0}</span>
            </div>
          )}
        </Card>

        {/* Words Learned */}
        <Card className="p-6 glass-card border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-emerald-200">Words Mastered</span>
            <Star className="w-5 h-5 text-emerald-500" />
          </div>
          {isLoadingSummary ? (
            <Skeleton className="h-10 w-16" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-display font-bold text-emerald-400">{summary?.wordsLearned || 0}</span>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Learning Path */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-display font-semibold">Continue Learning</h2>
          
          {isLoadingSummary ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          ) : (
            <div className="space-y-4">
              {summary?.activeLearning?.map((lang) => (
                <Card key={lang.language} className="p-6 glass-card border-border/50 hover:border-primary/50 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-secondary border border-white/10 flex items-center justify-center text-xl font-bold uppercase overflow-hidden relative">
                        {lang.language === 'japanese' ? '🇯🇵' : '🇺🇸'}
                        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]"></div>
                        <span className="relative z-10 text-white drop-shadow-md">{lang.language.substring(0,2)}</span>
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-lg capitalize">{lang.language}</h3>
                        <p className="text-sm text-muted-foreground">Level {lang.level} • {lang.xp} XP earned</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 max-w-xs w-full">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-primary">{Math.round(lang.progress)}%</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-fuchsia-500 rounded-full relative"
                          style={{ width: `${lang.progress}%` }}
                        >
                          <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 blur-[2px]"></div>
                        </div>
                      </div>
                    </div>
                    
                    <Link href={`/learn/${lang.language}/${lang.level}`}>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer">
                        Resume <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  </div>
                </Card>
              ))}
              
              {(!summary?.activeLearning || summary.activeLearning.length === 0) && (
                <Card className="p-8 text-center glass-card border-dashed">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready to start?</h3>
                  <p className="text-muted-foreground mb-6">Choose a language and begin your journey.</p>
                  <Link href="/learn">
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium cursor-pointer">
                      Browse Languages
                    </div>
                  </Link>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Daily Challenge */}
        <div className="space-y-6">
          <h2 className="text-xl font-display font-semibold">Daily Challenge</h2>
          <Card className="p-6 glass-card border-fuchsia-500/20 bg-gradient-to-b from-fuchsia-500/10 to-transparent">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 flex items-center justify-center mb-6 border border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.3)]">
              <Star className="w-6 h-6 text-fuchsia-400" />
            </div>
            <h3 className="font-display font-semibold text-xl mb-2">Master 5 New Words</h3>
            <p className="text-sm text-muted-foreground mb-6">Learn 5 new vocabulary words today to earn a special badge and 50 bonus XP.</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Progress</span>
                <span className="text-fuchsia-400">0 / 5</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-fuchsia-500 rounded-full w-0"></div>
              </div>
            </div>
            
            <Link href="/vocabulary">
              <div className="w-full py-3 rounded-xl bg-fuchsia-500 text-white font-medium text-center hover:bg-fuchsia-600 transition-colors shadow-[0_0_15px_rgba(217,70,239,0.3)] cursor-pointer">
                Start Challenge
              </div>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}