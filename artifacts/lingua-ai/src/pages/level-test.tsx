import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Clock, CheckCircle2, XCircle, ChevronRight, BookOpen, Trophy, AlertTriangle, Loader2
} from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface Question {
  id: number;
  type: string;
  question: string;
  options: string[];
  language: string;
  level: string;
  hint: string | null;
  xp: number;
}

interface TestData {
  language: string;
  level: string;
  totalQuestions: number;
  timeLimit: number;
  questions: Question[];
}

interface AnswerResult {
  questionId: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface TestResult {
  id: number;
  language: string;
  level: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  passed: boolean;
  xpEarned: number;
  passingScore: number;
  results: AnswerResult[];
}

const LEVEL_NAMES: Record<string, string> = {
  A1: "Beginner", A2: "Elementary", B1: "Intermediate",
  B2: "Upper Intermediate", C1: "Advanced", C2: "Mastery",
};

const LANG_LABELS: Record<string, string> = { english: "English", japanese: "Japanese" };
const LANG_FLAGS: Record<string, string> = { english: "EN", japanese: "JA" };

export default function LevelTest() {
  const { language, level } = useParams<{ language: string; level: string }>();
  const [, navigate] = useLocation();

  const [phase, setPhase] = useState<"intro" | "test" | "result">("intro");
  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: number; userAnswer: string }[]>([]);
  const [timeLeft, setTimeLeft] = useState(600);
  const [startTime, setStartTime] = useState<number>(0);

  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const fetchTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl(`/levels/${language}/${level}/test`));
      if (!res.ok) throw new Error("Failed to load test");
      const data: TestData = await res.json();
      setTestData(data);
      setTimeLeft(data.timeLimit);
    } catch {
      setError("Could not load test questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitTest = useCallback(async (finalAnswers: { questionId: number; userAnswer: string }[], elapsed: number) => {
    setSubmitting(true);
    try {
      const res = await fetch(getApiUrl(`/levels/${language}/${level}/test/submit`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers, timeTaken: elapsed }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      const result: TestResult = await res.json();
      setTestResult(result);
      setPhase("result");
    } catch {
      setError("Failed to submit test. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [language, level]);

  useEffect(() => {
    if (phase !== "test" || !testData) return;
    if (timeLeft <= 0) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const finalAnswers = [...answers];
      const current = testData.questions[currentIdx];
      if (selectedOption && !confirmed) {
        finalAnswers.push({ questionId: current.id, userAnswer: selectedOption });
      }
      submitTest(finalAnswers, elapsed);
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft, testData]);

  const startTest = async () => {
    await fetchTest();
    setPhase("test");
    setCurrentIdx(0);
    setAnswers([]);
    setSelectedOption(null);
    setConfirmed(false);
    setStartTime(Date.now());
  };

  const confirmAnswer = () => {
    if (!selectedOption || !testData) return;
    setConfirmed(true);
  };

  const nextQuestion = () => {
    if (!testData || !selectedOption) return;
    const q = testData.questions[currentIdx];
    const newAnswers = [...answers, { questionId: q.id, userAnswer: selectedOption }];
    setAnswers(newAnswers);

    if (currentIdx + 1 >= testData.questions.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      submitTest(newAnswers, elapsed);
    } else {
      setCurrentIdx(i => i + 1);
      setSelectedOption(null);
      setConfirmed(false);
    }
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (phase === "intro") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-500">
        <div className="max-w-lg w-full space-y-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(139,92,246,0.2)]">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Level Assessment</span>
            </div>
            <h1 className="text-4xl font-display font-bold tracking-tight mb-3">
              {LANG_LABELS[language ?? "english"]} {level} Test
            </h1>
            <p className="text-muted-foreground text-lg">
              {LEVEL_NAMES[level ?? "A1"]} Level — Final Assessment
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Questions", value: "10" },
              { label: "Time Limit", value: "10 min" },
              { label: "Pass Score", value: "70%" },
            ].map(item => (
              <Card key={item.label} className="glass-card p-4 text-center">
                <div className="text-2xl font-bold font-display text-primary mb-1">{item.value}</div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </Card>
            ))}
          </div>

          <Card className="glass-card p-5 text-left space-y-3">
            <p className="font-semibold text-sm text-foreground">Before you start:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Answer all 10 questions covering this level's curriculum</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Score 70% or above to pass and earn your certificate</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> You earn bonus XP for passing — more XP for higher scores</li>
              <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" /> Once started, the timer cannot be paused</li>
            </ul>
          </Card>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-xl border border-red-400/20">{error}</p>
          )}

          <Button
            onClick={startTest}
            disabled={loading}
            size="lg"
            className="w-full text-base font-semibold py-6 bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]"
          >
            {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading Test...</> : <>Start Test <ChevronRight className="w-5 h-5 ml-1" /></>}
          </Button>

          <button onClick={() => navigate(`/learn/${language}/${level}`)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Back to Level
          </button>
        </div>
      </div>
    );
  }

  if (phase === "test" && testData) {
    const q = testData.questions[currentIdx];
    const progress = ((currentIdx) / testData.questions.length) * 100;
    const isUrgent = timeLeft < 60;

    const currentAnswer = answers.find(a => a.questionId === q.id);
    const isCorrectSelection = confirmed && selectedOption === (testData.questions[currentIdx] as any).correctAnswer;

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-mono text-xs">{LANG_FLAGS[language ?? "english"]} {level}</Badge>
            <span className="text-muted-foreground text-sm">Question {currentIdx + 1} of {testData.questions.length}</span>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono font-bold text-sm border transition-colors",
            isUrgent ? "text-red-400 bg-red-400/10 border-red-400/30 animate-pulse" : "text-foreground bg-secondary/50 border-border"
          )}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>

        <Progress value={progress} className="h-1.5" />

        <Card className="glass-card p-8 space-y-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
              {currentIdx + 1}
            </div>
            <h2 className="text-xl font-semibold leading-relaxed">{q.question}</h2>
          </div>

          {q.options && q.options.length > 0 ? (
            <div className="grid gap-3">
              {q.options.map((option, i) => {
                let state: "idle" | "selected" | "correct" | "wrong" = "idle";
                if (confirmed) {
                  if (option === selectedOption && option === (q as any).correctAnswer) state = "correct";
                  else if (option === selectedOption) state = "wrong";
                  else if (option === (q as any).correctAnswer) state = "correct";
                } else if (option === selectedOption) {
                  state = "selected";
                }

                return (
                  <button
                    key={i}
                    onClick={() => !confirmed && setSelectedOption(option)}
                    disabled={confirmed}
                    className={cn(
                      "w-full text-left px-5 py-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-3",
                      state === "idle" && !selectedOption && "bg-secondary/30 border-border hover:bg-secondary hover:border-primary/30",
                      state === "idle" && selectedOption && option !== selectedOption && "bg-secondary/20 border-border/50 opacity-60",
                      state === "selected" && "bg-primary/10 border-primary/50 text-primary shadow-[0_0_15px_rgba(139,92,246,0.15)]",
                      state === "correct" && "bg-emerald-500/10 border-emerald-500/50 text-emerald-400",
                      state === "wrong" && "bg-red-500/10 border-red-500/50 text-red-400",
                    )}
                  >
                    <span className={cn(
                      "w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                      state === "selected" ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
                      state === "correct" && "border-emerald-500 bg-emerald-500 text-white",
                      state === "wrong" && "border-red-500 bg-red-500 text-white",
                    )}>
                      {state === "correct" ? <CheckCircle2 className="w-4 h-4" /> : state === "wrong" ? <XCircle className="w-4 h-4" /> : String.fromCharCode(65 + i)}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={selectedOption ?? ""}
                onChange={e => setSelectedOption(e.target.value)}
                disabled={confirmed}
                placeholder="Type your answer here..."
                className="w-full px-5 py-4 rounded-xl border border-border bg-secondary/30 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
              />
            </div>
          )}

          {q.hint && confirmed && (
            <div className="flex items-start gap-2 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-sm text-blue-400">
              <BookOpen className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{q.hint}</p>
            </div>
          )}
        </Card>

        <div className="flex gap-3">
          {!confirmed ? (
            <Button
              onClick={confirmAnswer}
              disabled={!selectedOption || submitting}
              className="flex-1 py-5 font-semibold"
            >
              Confirm Answer
            </Button>
          ) : (
            <Button
              onClick={nextQuestion}
              disabled={submitting}
              className="flex-1 py-5 font-semibold bg-primary shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {currentIdx + 1 >= testData.questions.length ? "Submit Test" : "Next Question"}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (phase === "result" && testResult) {
    return (
      <TestReport
        result={testResult}
        language={language ?? "english"}
        level={level ?? "A1"}
        onRetry={() => {
          setPhase("intro");
          setTestResult(null);
          setAnswers([]);
          setCurrentIdx(0);
        }}
        onNavigate={navigate}
      />
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

function TestReport({
  result, language, level, onRetry, onNavigate,
}: {
  result: TestResult;
  language: string;
  level: string;
  onRetry: () => void;
  onNavigate: (path: string) => void;
}) {
  const LEVEL_COLORS: Record<string, string> = {
    A1: "#cd7f32", A2: "#a8a9ad", B1: "#ffd700",
    B2: "#e5e4e2", C1: "#b9f2ff", C2: "#9b59b6",
  };

  const badgeColor = LEVEL_COLORS[level] ?? "#9b59b6";
  const formatTime = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;
  const accuracy = Math.round((result.correctAnswers / result.totalQuestions) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className={cn(
        "rounded-2xl p-8 border text-center space-y-4",
        result.passed
          ? "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/30 shadow-[0_0_40px_rgba(139,92,246,0.15)]"
          : "bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border-red-500/20"
      )}>
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto",
          result.passed ? "bg-primary/10 border border-primary/20" : "bg-red-500/10 border border-red-500/20"
        )}>
          {result.passed
            ? <Trophy className="w-8 h-8 text-primary" />
            : <XCircle className="w-8 h-8 text-red-400" />}
        </div>
        <div>
          <h1 className="text-4xl font-display font-bold">
            {result.passed ? "Level Passed!" : "Not Passed Yet"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {result.passed
              ? `Congratulations! You've passed the ${level} ${LANG_LABELS[language]} test.`
              : `You need ${result.passingScore}% to pass. Keep studying and try again!`}
          </p>
        </div>
        <div className="text-6xl font-display font-bold" style={{ color: result.passed ? "hsl(var(--primary))" : "#f87171" }}>
          {result.score}%
        </div>
        {result.passed && (
          <div className="flex items-center justify-center gap-2 text-yellow-500 font-semibold">
            <span>+{result.xpEarned} XP earned</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Correct", value: `${result.correctAnswers}/${result.totalQuestions}`, color: "text-emerald-400" },
          { label: "Accuracy", value: `${accuracy}%`, color: "text-primary" },
          { label: "Time Taken", value: formatTime(result.timeTaken), color: "text-blue-400" },
          { label: "XP Earned", value: `+${result.xpEarned}`, color: "text-yellow-500" },
        ].map(stat => (
          <Card key={stat.label} className="glass-card p-4 text-center">
            <div className={cn("text-2xl font-bold font-display mb-1", stat.color)}>{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold font-display">Question Breakdown</h2>
        {result.results.map((r, i) => (
          <Card key={i} className={cn(
            "glass-card p-5 border-l-4 transition-all",
            r.isCorrect ? "border-l-emerald-500" : "border-l-red-500"
          )}>
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                r.isCorrect ? "bg-emerald-500/10" : "bg-red-500/10"
              )}>
                {r.isCorrect
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  : <XCircle className="w-4 h-4 text-red-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-2">{i + 1}. {r.question}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={cn("px-2 py-1 rounded-lg border", r.isCorrect ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400")}>
                    Your answer: {r.userAnswer || "(no answer)"}
                  </span>
                  {!r.isCorrect && (
                    <span className="px-2 py-1 rounded-lg border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                      Correct: {r.correctAnswer}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {result.passed && (
        <Card className="glass-card p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold font-display text-lg">Certificate Available</h3>
              <p className="text-sm text-muted-foreground mt-1">Download your official level completion certificate</p>
            </div>
            <Button
              onClick={() => onNavigate(`/certificate/${language}/${level}?score=${result.score}&time=${result.timeTaken}&correct=${result.correctAnswers}&total=${result.totalQuestions}`)}
              className="bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            >
              <Trophy className="w-4 h-4 mr-2" />
              View Certificate
            </Button>
          </div>
        </Card>
      )}

      <div className="flex gap-4">
        <Button variant="outline" onClick={onRetry} className="flex-1">
          Retake Test
        </Button>
        <Button onClick={() => onNavigate(`/learn/${language}/${level}`)} className="flex-1 bg-primary hover:bg-primary/90">
          Back to Level
        </Button>
      </div>
    </div>
  );
}
