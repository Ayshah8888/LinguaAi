import { useState } from "react";
import { useEvaluateWriting } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PenTool, CheckCircle2, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function Practice() {
  const evaluateWriting = useEvaluateWriting();
  const [text, setText] = useState("");
  const [prompt, setPrompt] = useState("Describe your typical weekend in detail.");
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    try {
      const res = await evaluateWriting.mutateAsync({
        data: {
          text,
          prompt,
          language: "english",
          level: "B1"
        }
      });
      setResult(res);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-display font-bold text-gradient flex items-center gap-3 mb-2">
          <PenTool className="w-8 h-8 text-primary" />
          Writing Practice
        </h1>
        <p className="text-muted-foreground">Get instant AI-powered feedback on your writing.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <Card className="p-6 glass-card border-border/50">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Prompt</h3>
            <p className="text-lg font-medium mb-4">{prompt}</p>
            
            <div className="flex gap-2 mb-6">
              <Button variant="outline" size="sm" onClick={() => setPrompt("Write a formal email requesting a meeting.")} className="text-xs">Formal Email</Button>
              <Button variant="outline" size="sm" onClick={() => setPrompt("Describe your favorite movie and why you like it.")} className="text-xs">Opinion</Button>
            </div>

            <Textarea 
              placeholder="Start typing your response here..." 
              className="min-h-[300px] resize-none text-lg bg-secondary/20 border-border/50 focus-visible:ring-primary/50 mb-4"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{text.split(/\s+/).filter(w => w.length > 0).length} words</span>
              <Button 
                onClick={handleSubmit} 
                disabled={text.length < 10 || evaluateWriting.isPending}
                className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] font-bold rounded-xl px-8"
              >
                {evaluateWriting.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Evaluating...</> : "Submit for Evaluation"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Feedback Section */}
        <div>
          {evaluateWriting.isPending ? (
            <Card className="p-8 h-full flex flex-col items-center justify-center text-center glass-card border-primary/20 bg-primary/5">
              <div className="w-16 h-16 relative mb-6">
                <div className="absolute inset-0 border-4 border-primary/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
              </div>
              <h3 className="text-xl font-bold font-display text-gradient mb-2">Analyzing your writing...</h3>
              <p className="text-muted-foreground text-sm max-w-xs">Our AI tutor is reviewing your grammar, vocabulary, and coherence.</p>
            </Card>
          ) : result ? (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              <Card className="p-6 glass-card border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 flex items-center justify-center relative">
                    <svg className="w-full h-full absolute inset-0 -rotate-90 transform">
                      <circle cx="36" cy="36" r="34" className="stroke-emerald-500/20 fill-none" strokeWidth="4" />
                      <circle cx="36" cy="36" r="34" className="stroke-emerald-500 fill-none transition-all duration-1000 ease-out" strokeWidth="4" strokeDasharray="213" strokeDashoffset={213 - (213 * result.score) / 100} strokeLinecap="round" />
                    </svg>
                    <span className="text-2xl font-display font-bold text-emerald-400">{result.score}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-display text-emerald-400">Great effort!</h3>
                    <p className="text-emerald-500/70 text-sm">Level: B1 • English</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Grammar</span>
                      <span className="font-medium text-emerald-400">{result.grammarScore}/100</span>
                    </div>
                    <Progress value={result.grammarScore} className="h-1.5 [&>div]:bg-emerald-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Vocabulary</span>
                      <span className="font-medium text-blue-400">{result.vocabularyScore}/100</span>
                    </div>
                    <Progress value={result.vocabularyScore} className="h-1.5 [&>div]:bg-blue-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Coherence</span>
                      <span className="font-medium text-fuchsia-400">{result.coherenceScore}/100</span>
                    </div>
                    <Progress value={result.coherenceScore} className="h-1.5 [&>div]:bg-fuchsia-500" />
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                <h3 className="font-display font-semibold text-xl">Feedback & Corrections</h3>
                
                {result.corrections?.length > 0 ? (
                  result.corrections.map((corr: any, idx: number) => (
                    <Card key={idx} className="p-4 bg-secondary/30 border-border/50">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-red-400 line-through decoration-red-400/50 mb-1">{corr.original}</div>
                          <div className="text-emerald-400 font-medium mb-2">{corr.corrected}</div>
                          <p className="text-sm text-muted-foreground">{corr.explanation}</p>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-4 bg-emerald-500/10 border-emerald-500/20 text-emerald-400 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>No grammar mistakes found! Excellent work.</span>
                  </Card>
                )}
              </div>
              
              {result.improvedVersion && (
                <div className="space-y-4 pt-4 border-t border-border/50">
                  <h3 className="font-display font-semibold text-xl flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" /> How a native might say it
                  </h3>
                  <Card className="p-5 glass-card bg-primary/5 border-primary/20 text-foreground italic">
                    "{result.improvedVersion}"
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <Card className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-dashed border-2 glass-card">
              <PenTool className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-bold font-display mb-2 text-muted-foreground">Awaiting Submission</h3>
              <p className="text-sm text-muted-foreground/70 max-w-sm">
                Write your response on the left and submit it to get detailed AI feedback on your grammar, vocabulary, and coherence.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}