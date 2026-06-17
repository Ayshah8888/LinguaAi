import { useGetVocabulary } from "@workspace/api-client-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Volume2, Star, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function Vocabulary() {
  const { data: words, isLoading } = useGetVocabulary();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    if (words && currentIndex < words.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150); // slight delay for flip reset
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </div>
    );
  }

  if (!words || words.length === 0) return <div className="text-center py-20 text-muted-foreground">No vocabulary words available.</div>;

  const currentWord = words[currentIndex];
  const isJapanese = currentWord.language.toLowerCase() === 'japanese';

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-display font-bold text-gradient">Vocabulary Review</h1>
        <p className="text-muted-foreground mt-2">Master your words with spaced repetition.</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center relative perspective-1000 w-full max-w-xl mx-auto">
        <div className="flex justify-between items-center w-full mb-4 px-4 text-sm font-medium text-muted-foreground">
          <span>{currentIndex + 1} of {words.length}</span>
          <div className="flex gap-1">
            {currentWord.difficulty !== undefined && (
              <span className="flex items-center gap-1 text-primary">
                Level {currentWord.difficulty}
              </span>
            )}
          </div>
        </div>

        {/* Flashcard */}
        <div 
          className="w-full h-80 relative cursor-pointer group"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className={cn(
            "w-full h-full transition-transform duration-500 transform-style-3d relative",
            isFlipped ? "rotate-y-180" : ""
          )}>
            {/* Front */}
            <Card className="absolute inset-0 backface-hidden p-8 flex flex-col items-center justify-center text-center glass-card border-primary/20 hover:border-primary/50 bg-gradient-to-br from-card to-secondary/20 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
              {currentWord.isMastered && (
                <div className="absolute top-4 right-4">
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                </div>
              )}
              
              <div className="flex-1 flex flex-col items-center justify-center">
                {isJapanese && currentWord.reading && (
                  <p className="text-xl text-muted-foreground mb-2">{currentWord.reading}</p>
                )}
                <h2 className={cn(
                  "text-5xl md:text-6xl font-bold mb-4",
                  isJapanese ? "font-japanese" : "font-display tracking-tight"
                )}>
                  {currentWord.word}
                </h2>
                {currentWord.phonetic && !isJapanese && (
                  <p className="text-lg text-muted-foreground font-mono bg-secondary/50 px-3 py-1 rounded-md">{currentWord.phonetic}</p>
                )}
              </div>
              
              <div className="absolute bottom-6 flex items-center gap-2 text-sm text-muted-foreground bg-secondary/80 px-4 py-2 rounded-full">
                Tap to flip
              </div>
            </Card>

            {/* Back */}
            <Card className="absolute inset-0 backface-hidden rotate-y-180 p-8 flex flex-col items-center justify-center text-center glass-card border-fuchsia-500/20 bg-gradient-to-br from-card to-fuchsia-500/5 shadow-[0_10px_40px_rgba(217,70,239,0.15)]">
              <div className="flex-1 flex flex-col items-center justify-center w-full">
                <h3 className="text-4xl font-display font-bold text-gradient mb-6">{currentWord.translation}</h3>
                
                {currentWord.exampleSentence && (
                  <div className="w-full bg-secondary/30 p-4 rounded-xl border border-border/50 text-left">
                    <p className={cn("text-lg mb-2", isJapanese && "font-japanese")}>{currentWord.exampleSentence}</p>
                    <p className="text-sm text-muted-foreground">{currentWord.exampleTranslation}</p>
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-6 flex gap-4 w-full px-8">
                <Button variant="outline" className="flex-1 border-border/50 bg-secondary/50">Need review</Button>
                <Button className="flex-1 bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(139,92,246,0.3)]">Got it</Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-12 w-full">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-12 h-12 rounded-full bg-secondary/50 border border-border/50 hover:bg-secondary"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <div className="p-4 bg-primary/10 rounded-full border border-primary/20 text-primary cursor-pointer hover:bg-primary/20 transition-colors">
            <Volume2 className="w-6 h-6" />
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-12 h-12 rounded-full bg-secondary/50 border border-border/50 hover:bg-secondary"
            onClick={handleNext}
            disabled={currentIndex === words.length - 1}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}