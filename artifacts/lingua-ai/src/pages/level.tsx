import { useParams } from "wouter";
import { useGetLessons, useGetLevels } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { BookOpen, Headphones, PenTool, LayoutTemplate, PlayCircle, CheckCircle2, BookA, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { GetLessonsSkill } from "@workspace/api-client-react";

export default function LevelDetail() {
  const { language, level } = useParams();
  const [activeSkill, setActiveSkill] = useState<GetLessonsSkill | undefined>(undefined);
  
  const { data: lessons, isLoading: isLoadingLessons } = useGetLessons({ 
    language, 
    level,
    ...(activeSkill ? { skill: activeSkill } : {})
  });
  
  const { data: levels } = useGetLevels({ language });
  const currentLevelInfo = levels?.find(l => l.code === level);

  const skills = [
    { id: undefined, label: "All Skills", icon: BookOpen },
    { id: GetLessonsSkill.reading, label: "Reading", icon: BookOpen },
    { id: GetLessonsSkill.listening, label: "Listening", icon: Headphones },
    { id: GetLessonsSkill.writing, label: "Writing", icon: PenTool },
    { id: GetLessonsSkill.grammar, label: "Grammar", icon: LayoutTemplate },
    { id: GetLessonsSkill.vocabulary, label: "Vocabulary", icon: BookA },
  ];

  const getSkillIcon = (skillName: string) => {
    switch (skillName.toLowerCase()) {
      case 'reading': return <BookOpen className="w-4 h-4" />;
      case 'listening': return <Headphones className="w-4 h-4" />;
      case 'writing': return <PenTool className="w-4 h-4" />;
      case 'grammar': return <LayoutTemplate className="w-4 h-4" />;
      case 'vocabulary': return <BookA className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getSkillColor = (skillName: string) => {
    switch (skillName.toLowerCase()) {
      case 'reading': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'listening': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'writing': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'grammar': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'vocabulary': return 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <Link href="/learn">
            <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Learn</span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="capitalize">{language}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-primary font-medium">{level}</span>
        </div>
        <h1 className="text-4xl font-display font-bold tracking-tight mb-2">
          {currentLevelInfo?.name || `Level ${level}`}
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          {currentLevelInfo?.description || `Master the ${level} curriculum for ${language}.`}
        </p>
      </header>

      {/* Skills Filter */}
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => {
          const Icon = skill.icon;
          return (
            <button
              key={skill.id || 'all'}
              onClick={() => setActiveSkill(skill.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border",
                activeSkill === skill.id
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                  : "bg-secondary/50 text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {skill.label}
            </button>
          );
        })}
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingLessons ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)
        ) : lessons?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No lessons found for this category yet.
          </div>
        ) : (
          lessons?.map((lesson) => (
            <Link key={lesson.id} href={`/lesson/${lesson.id}`}>
              <Card className={cn(
                "p-5 glass-card transition-all duration-300 cursor-pointer group h-full flex flex-col relative overflow-hidden",
                lesson.isCompleted ? "border-primary/30 bg-primary/5" : "hover:border-primary/50"
              )}>
                {lesson.isCompleted && (
                  <div className="absolute top-0 right-0 p-2">
                    <CheckCircle2 className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <Badge variant="outline" className={cn("capitalize px-2 py-1 font-medium", getSkillColor(lesson.skill))}>
                    <span className="flex items-center gap-1.5">
                      {getSkillIcon(lesson.skill)}
                      {lesson.skill}
                    </span>
                  </Badge>
                  <div className="flex items-center gap-1 text-xs font-semibold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20">
                    <Zap className="w-3 h-3 fill-yellow-500" /> {lesson.xp} XP
                  </div>
                </div>
                
                <h3 className={cn(
                  "font-display font-semibold text-lg mb-2 group-hover:text-primary transition-colors",
                  language === 'japanese' && "font-japanese"
                )}>
                  {lesson.title}
                </h3>
                
                {lesson.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {lesson.description}
                  </p>
                )}
                
                <div className="mt-auto flex items-center justify-between text-sm text-muted-foreground border-t border-border/50 pt-3 relative z-10">
                  <span>{lesson.duration} mins</span>
                  <div className="flex items-center gap-1 font-medium group-hover:text-primary transition-colors">
                    <PlayCircle className="w-4 h-4" /> Start
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}