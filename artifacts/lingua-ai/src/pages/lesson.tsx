import { useParams, useLocation } from "wouter";
import { useGetLesson, useGetExercises, useSubmitExercise } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { ArrowLeft, Check, X, Zap, ArrowRight, Volume2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LessonView() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const lessonId = parseInt(id || "0");
  
  const { data: lesson, isLoading: isLoadingLesson } = useGetLesson(lessonId, {
    query: { enabled: !!lessonId, queryKey: ['lesson', lessonId] }
  });
  
  const { data: exercises, isLoading: isLoadingExercises } = useGetExercises({ lessonId });
  const submitExercise = useSubmitExercise();

  const [currentStep, setCurrentStep] = useState(-1); // -1 is intro, 0+ are exercises
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = (exercises?.length || 0);
  const progress = currentStep < 0 ? 0 : ((currentStep) / totalSteps) * 100;

  if (isLoadingLesson || isLoadingExercises) {
    return (
      <div className="max-w-3xl mx-auto py-12 space-y-8">
        <Skeleton className="h-8 w-full max-w-md" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!lesson) return <div>Lesson not found</div>;

  const currentExercise = currentStep >= 0 && exercises ? exercises[currentStep] : null;

  const handleNext = () => {
    setSelectedOption(null);
    setFeedback(null);
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Finished
      setLocation(`/learn/${lesson.language}/${lesson.level}`);
    }
  };

  const handleSubmit = async () => {
    if (!currentExercise || !selectedOption) return;
    
    setIsSubmitting(true);
    try {
      const res = await submitExercise.mutateAsync({
        id: currentExercise.id,
        data: { answer: selectedOption }
      });
      setFeedback(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto min-h-[80vh] flex flex-col animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between mb-8 sticky top-0 bg-background/80 backdrop-blur-xl z-50 py-4 border-b border-border/50">
        <button 
          onClick={() => setLocation(`/learn/${lesson.language}/${lesson.level}`)}
          className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 px-8">
          <Progress value={progress} className="h-3 rounded-full bg-secondary" />
        </div>
        <div className="flex items-center gap-2 font-bold text-yellow-500">
          <Zap className="w-5 h-5 fill-yellow-500" /> {lesson.xp}
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center py-8">
        {currentStep === -1 ? (
          <div className="space-y-8 text-center">
            <div className="inline-block p-4 bg-primary/10 rounded-full mb-4 ring-1 ring-primary/20 neon-glow">
              <BookOpen className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient pb-2">{lesson.title}</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {lesson.content}
            </p>
            <div className="pt-8">
              <Button size="lg" className="w-full max-w-sm text-lg h-14 rounded-2xl bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(139,92,246,0.4)]" onClick={() => setCurrentStep(0)}>
                Start Lesson <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        ) : currentExercise ? (
          <div className="space-y-8 w-full max-w-2xl mx-auto">
            <h2 className="text-3xl font-display font-bold tracking-tight">
              {currentExercise.question}
            </h2>
            
            {currentExercise.audioUrl && (
              <div className="inline-flex items-center justify-center p-4 bg-secondary rounded-full cursor-pointer hover:bg-secondary/80 transition-colors text-primary">
                <Volume2 className="w-6 h-6" />
              </div>
            )}

            <div className="grid gap-4 mt-8">
              {currentExercise.options?.map((option, idx) => {
                const isSelected = selectedOption === option;
                const isCorrect = feedback?.isCorrect && selectedOption === option;
                const isWrong = feedback && !feedback.isCorrect && selectedOption === option;
                const isActualCorrect = feedback && !feedback.isCorrect && option === feedback.correctAnswer;

                return (
                  <Card 
                    key={idx}
                    onClick={() => !feedback && setSelectedOption(option)}
                    className={cn(
                      "p-5 text-lg font-medium cursor-pointer transition-all duration-200 border-2",
                      !feedback && !isSelected && "hover:bg-secondary hover:border-border glass-card",
                      !feedback && isSelected && "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(139,92,246,0.2)]",
                      isCorrect && "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
                      isWrong && "border-red-500 bg-red-500/10 text-red-400",
                      isActualCorrect && "border-emerald-500/50 bg-emerald-500/5 text-emerald-400"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(lesson.language === 'japanese' && "font-japanese")}>{option}</span>
                      {isCorrect && <Check className="w-6 h-6 text-emerald-500" />}
                      {isWrong && <X className="w-6 h-6 text-red-500" />}
                    </div>
                  </Card>
                );
              })}
            </div>

            {feedback && (
              <div className={cn(
                "p-6 rounded-2xl animate-in slide-in-from-bottom-4 border",
                feedback.isCorrect 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200" 
                  : "bg-red-500/10 border-red-500/30 text-red-200"
              )}>
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-2 rounded-full",
                    feedback.isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                  )}>
                    {feedback.isCorrect ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className={cn(
                      "text-xl font-bold mb-1",
                      feedback.isCorrect ? "text-emerald-400" : "text-red-400"
                    )}>
                      {feedback.isCorrect ? "Excellent!" : "Not quite right"}
                    </h3>
                    <p className="text-sm opacity-90">{feedback.feedback}</p>
                    {feedback.explanation && (
                      <p className="mt-2 text-sm opacity-80">{feedback.explanation}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {currentStep >= 0 && (
        <div className="py-6 mt-auto border-t border-border/50 sticky bottom-0 bg-background/80 backdrop-blur-xl z-50 flex justify-between items-center">
          <Button variant="ghost" className="text-muted-foreground" onClick={() => setLocation(`/learn/${lesson.language}/${lesson.level}`)}>
            Quit
          </Button>
          {!feedback ? (
            <Button 
              size="lg" 
              onClick={handleSubmit} 
              disabled={!selectedOption || isSubmitting}
              className="w-40 rounded-xl font-bold bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? "Checking..." : "Check"}
            </Button>
          ) : (
            <Button 
              size="lg" 
              onClick={handleNext}
              className={cn(
                "w-40 rounded-xl font-bold",
                feedback.isCorrect 
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                  : "bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              )}
            >
              {currentStep < totalSteps - 1 ? "Continue" : "Finish"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
