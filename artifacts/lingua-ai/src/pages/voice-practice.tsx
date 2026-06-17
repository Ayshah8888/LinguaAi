import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Volume2, CheckCircle2, XCircle, RotateCcw, ChevronRight, Headphones, Zap, AlertCircle } from "lucide-react";
import { useGetVocabulary, useGetExercises } from "@workspace/api-client-react";

interface VoiceResult {
  transcript: string;
  expected: string;
  isCorrect: boolean;
  similarity: number;
}

const PROMPTS: Record<string, { prompt: string; expected: string }[]> = {
  english: [
    { prompt: "Say: Hello, my name is...", expected: "hello my name is" },
    { prompt: "Say: How are you today?", expected: "how are you today" },
    { prompt: "Say: I am learning English.", expected: "i am learning english" },
    { prompt: "Say: Thank you very much.", expected: "thank you very much" },
    { prompt: "Say: What time is it?", expected: "what time is it" },
    { prompt: "Say: I would like some water, please.", expected: "i would like some water please" },
    { prompt: "Say: Nice to meet you.", expected: "nice to meet you" },
    { prompt: "Say: Have a good day!", expected: "have a good day" },
  ],
  japanese: [
    { prompt: "Say: おはようございます (Good morning)", expected: "ohayou gozaimasu" },
    { prompt: "Say: ありがとうございます (Thank you)", expected: "arigatou gozaimasu" },
    { prompt: "Say: はじめまして (Nice to meet you)", expected: "hajimemashite" },
    { prompt: "Say: すみません (Excuse me)", expected: "sumimasen" },
    { prompt: "Say: こんにちは (Hello)", expected: "konnichiwa" },
    { prompt: "Say: よろしくお願いします (Please treat me well)", expected: "yoroshiku onegaishimasu" },
  ],
};

function similarity(a: string, b: string): number {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z\s]/g, "").trim();
  const na = norm(a).split(" ").filter(Boolean);
  const nb = norm(b).split(" ").filter(Boolean);
  if (na.length === 0 && nb.length === 0) return 100;
  const matches = na.filter(w => nb.includes(w)).length;
  return Math.round((matches / Math.max(na.length, nb.length)) * 100);
}

export default function VoicePractice() {
  const [language, setLanguage] = useState("english");
  const [isRecording, setIsRecording] = useState(false);
  const [promptIdx, setPromptIdx] = useState(0);
  const [result, setResult] = useState<VoiceResult | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [supported, setSupported] = useState(true);
  const [permError, setPermError] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const prompts = PROMPTS[language] ?? PROMPTS.english;
  const current = prompts[promptIdx % prompts.length];

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    setSupported(true);
  }, []);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "japanese" ? "ja-JP" : "en-US";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const startRecording = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR() as SpeechRecognition;
    recognition.lang = language === "japanese" ? "ja-JP" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onstart = () => { setIsRecording(true); setTranscript(""); setResult(null); };
    recognition.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join(" ");
      setTranscript(t);
    };
    recognition.onend = () => {
      setIsRecording(false);
      const finalTranscript = transcript || "";
      if (finalTranscript) {
        const sim = similarity(finalTranscript, current.expected);
        const isCorrect = sim >= 60;
        setResult({ transcript: finalTranscript, expected: current.expected, isCorrect, similarity: sim });
        setTotal(t => t + 1);
        if (isCorrect) setScore(s => s + 1);
      }
    };
    recognition.onerror = (e) => {
      setIsRecording(false);
      if (e.error === "not-allowed") setPermError(true);
    };

    try { recognition.start(); } catch {}
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const next = () => {
    setPromptIdx(i => i + 1);
    setResult(null);
    setTranscript("");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Mic className="w-5 h-5 text-blue-400" />
            </div>
            Voice Practice
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Train your pronunciation with real speech recognition</p>
        </div>
        <div className="flex gap-1 bg-secondary/50 rounded-xl p-1 border border-border">
          {[{ v: "english", l: "EN" }, { v: "japanese", l: "JA" }].map(opt => (
            <button key={opt.v} onClick={() => { setLanguage(opt.v); setResult(null); setTranscript(""); setPromptIdx(0); }}
              className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                language === opt.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}>{opt.l}</button>
          ))}
        </div>
      </div>

      {/* Score */}
      {total > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Attempts", value: total, color: "text-foreground" },
            { label: "Correct", value: score, color: "text-emerald-400" },
            { label: "Accuracy", value: `${Math.round((score / total) * 100)}%`, color: "text-primary" },
          ].map(s => (
            <Card key={s.label} className="glass-card p-4 text-center">
              <div className={cn("text-2xl font-bold font-display", s.color)}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </Card>
          ))}
        </div>
      )}

      {!supported ? (
        <Card className="glass-card p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
          <h2 className="text-xl font-display font-bold">Browser Not Supported</h2>
          <p className="text-muted-foreground text-sm">Voice recognition requires Chrome or Edge browser. Please switch browsers to use this feature.</p>
        </Card>
      ) : permError ? (
        <Card className="glass-card p-8 text-center space-y-4">
          <MicOff className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-display font-bold">Microphone Access Denied</h2>
          <p className="text-muted-foreground text-sm">Please allow microphone access in your browser settings, then refresh the page.</p>
        </Card>
      ) : (
        <>
          {/* Prompt card */}
          <Card className="glass-card p-8 text-center space-y-6 border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.08)]">
            <Badge variant="outline" className="text-xs">Prompt {(promptIdx % prompts.length) + 1} of {prompts.length}</Badge>
            <h2 className="text-2xl font-display font-semibold leading-relaxed">{current.prompt}</h2>

            <button
              onClick={() => speak(current.expected)}
              className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors text-sm font-medium"
            >
              <Volume2 className="w-4 h-4" /> Listen to Example
            </button>

            {/* Mic button */}
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={cn(
                  "w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all duration-300",
                  isRecording
                    ? "bg-red-500/20 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse"
                    : "bg-primary/10 border-primary/40 hover:bg-primary/20 hover:border-primary shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
                )}
              >
                {isRecording
                  ? <MicOff className="w-10 h-10 text-red-400" />
                  : <Mic className="w-10 h-10 text-primary" />}
              </button>
              <p className="text-sm text-muted-foreground">
                {isRecording ? "Recording... Tap to stop" : "Tap to start recording"}
              </p>
            </div>

            {/* Live transcript */}
            {(isRecording || transcript) && !result && (
              <div className="p-4 rounded-xl bg-secondary/30 border border-border text-sm text-muted-foreground italic min-h-12">
                {transcript || "Listening..."}
              </div>
            )}
          </Card>

          {/* Result */}
          {result && (
            <Card className={cn(
              "glass-card p-6 space-y-4 border-l-4 animate-in slide-in-from-bottom-4 duration-300",
              result.isCorrect ? "border-l-emerald-500" : "border-l-orange-500"
            )}>
              <div className="flex items-center gap-3">
                {result.isCorrect
                  ? <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  : <XCircle className="w-6 h-6 text-orange-400 shrink-0" />}
                <div>
                  <p className="font-semibold">{result.isCorrect ? "Great pronunciation!" : "Keep practicing!"}</p>
                  <p className="text-sm text-muted-foreground">Match score: {result.similarity}%</p>
                </div>
                <div className="ml-auto">
                  <Progress value={result.similarity} className="w-24 h-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">You said:</p>
                  <p className="font-medium italic">"{result.transcript}"</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Expected:</p>
                  <p className="font-medium text-emerald-400">"{result.expected}"</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setResult(null); setTranscript(""); }} className="flex-1 gap-2">
                  <RotateCcw className="w-4 h-4" /> Try Again
                </Button>
                <Button onClick={next} className="flex-1 gap-2 bg-primary hover:bg-primary/90">
                  Next Prompt <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
