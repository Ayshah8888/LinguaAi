import { useGetLanguages, useGetLevels } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { BookOpen, Headphones, PenTool, LayoutTemplate, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LearnHub() {
  const { data: languages, isLoading: isLoadingLangs } = useGetLanguages();
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-display font-bold tracking-tight text-gradient mb-2">Learning Hub</h1>
        <p className="text-muted-foreground">Select a language and dive into your curriculum.</p>
      </header>

      <Tabs defaultValue="english" className="w-full">
        <TabsList className="bg-secondary/50 border border-border p-1 w-full max-w-md grid grid-cols-2">
          {languages?.map((lang) => (
            <TabsTrigger 
              key={lang.id} 
              value={lang.name.toLowerCase()}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
            >
              {lang.name}
            </TabsTrigger>
          ))}
          {isLoadingLangs && (
             <>
               <Skeleton className="h-8 w-full" />
               <Skeleton className="h-8 w-full" />
             </>
          )}
        </TabsList>

        <div className="mt-8">
          <LanguageLevelView language="english" />
          <LanguageLevelView language="japanese" />
        </div>
      </Tabs>
    </div>
  );
}

function LanguageLevelView({ language }: { language: string }) {
  const { data: levels, isLoading } = useGetLevels({ language });

  const getLevelColor = (code: string) => {
    switch (code) {
      case 'A1': return 'border-orange-500/50 bg-orange-500/10 text-orange-400';
      case 'A2': return 'border-zinc-400/50 bg-zinc-400/10 text-zinc-300';
      case 'B1': return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400';
      case 'B2': return 'border-cyan-400/50 bg-cyan-400/10 text-cyan-300';
      case 'C1': return 'border-blue-400/50 bg-blue-400/10 text-blue-300';
      case 'C2': return 'border-purple-500/50 bg-purple-500/10 text-purple-400';
      default: return 'border-border bg-secondary text-foreground';
    }
  };

  return (
    <TabsContent value={language} className="space-y-8 m-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)
        ) : (
          levels?.map((level) => (
            <Link key={level.id} href={`/learn/${language}/${level.code}`}>
              <Card className="p-6 glass-card hover:border-primary/50 transition-all duration-300 cursor-pointer group h-full flex flex-col relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("px-3 py-1 rounded-lg font-bold text-sm border", getLevelColor(level.code))}>
                      {level.code}
                    </div>
                    <div className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                      {level.totalLessons} Lessons
                    </div>
                  </div>
                  
                  <h3 className="font-display font-semibold text-xl mb-2 group-hover:text-primary transition-colors">{level.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{level.description}</p>
                </div>
                
                <div className="relative z-10 mt-auto">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-primary">
                      {Math.round(((level.completedLessons || 0) / (level.totalLessons || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${Math.round(((level.completedLessons || 0) / (level.totalLessons || 1)) * 100)}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all">
                    Start Learning <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </TabsContent>
  );
}