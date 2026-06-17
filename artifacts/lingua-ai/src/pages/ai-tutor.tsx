import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Send, Bot, User, BookOpen, Zap, Loader2, Trash2, Lightbulb } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { useGetLevels } from "@workspace/api-client-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

const SUGGESTIONS: Record<string, string[]> = {
  english: [
    "What's the difference between 'since' and 'for'?",
    "Explain the present perfect tense with examples",
    "How do I use articles (a, an, the) correctly?",
    "What does 'resilient' mean? Give me an example.",
    "How can I improve my English writing style?",
    "What are common mistakes Arabic speakers make in English?",
  ],
  japanese: [
    "What is the difference between は and が?",
    "Explain ている form with examples",
    "How do I count people in Japanese?",
    "When do I use です vs だ?",
    "Explain the difference between に and へ",
    "How do I read this kanji: 勉強?",
  ],
};

const LANG_OPTIONS = [
  { value: "english", label: "English", flag: "EN" },
  { value: "japanese", label: "Japanese", flag: "JA" },
];
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function AiTutor() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [language, setLanguage] = useState("english");
  const [level, setLevel] = useState("B1");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isStreaming) return;
    setInput("");

    const userMsg: Message = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsStreaming(true);

    const assistantMsg: Message = { role: "assistant", content: "", isStreaming: true };
    setMessages(prev => [...prev, assistantMsg]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch(getApiUrl("/ai-tutor/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          language,
          level,
        }),
        signal: abortRef.current.signal,
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (!reader) throw new Error("No stream");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.done) break;
            if (data.error) { fullContent += `\n[Error: ${data.error}]`; break; }
            if (data.content) {
              fullContent += data.content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: fullContent, isStreaming: true };
                return updated;
              });
            }
          } catch {}
        }
      }

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: fullContent, isStreaming: false };
        return updated;
      });
    } catch (e: any) {
      if (e.name === "AbortError") return;
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Sorry, I encountered an error. Please try again.", isStreaming: false };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setIsStreaming(false);
  };

  const suggestions = SUGGESTIONS[language] ?? SUGGESTIONS.english;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.2)]">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            AI Tutor
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Your personal language coach — ask anything</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-secondary/50 rounded-xl p-1 border border-border">
            {LANG_OPTIONS.map(l => (
              <button
                key={l.value}
                onClick={() => setLanguage(l.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  language === l.value ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(139,92,246,0.3)]" : "text-muted-foreground hover:text-foreground"
                )}
              >{l.flag} {l.label}</button>
            ))}
          </div>
          <select
            value={level}
            onChange={e => setLevel(e.target.value)}
            className="px-3 py-2 rounded-xl bg-secondary/50 border border-border text-sm font-medium focus:outline-none focus:border-primary/50"
          >
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          {messages.length > 0 && (
            <button onClick={clearChat} className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
            <div className="w-20 h-20 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.1)]">
              <Bot className="w-10 h-10 text-primary/60" />
            </div>
            <div>
              <h2 className="text-xl font-display font-semibold mb-2">Ask your tutor anything</h2>
              <p className="text-muted-foreground text-sm max-w-sm">Grammar, vocabulary, pronunciation, translations — your personal AI teacher is ready</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30 border border-border hover:bg-secondary hover:border-primary/30 transition-all text-left group"
                >
                  <Lightbulb className="w-4 h-4 text-primary/60 group-hover:text-primary mt-0.5 shrink-0 transition-colors" />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{s}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={cn(
                "max-w-[75%] rounded-2xl px-5 py-4 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(139,92,246,0.25)] rounded-tr-sm"
                  : "bg-secondary/50 border border-border rounded-tl-sm"
              )}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.isStreaming && (
                  <span className="inline-block w-2 h-4 bg-primary/60 ml-1 animate-pulse rounded-sm" />
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 pt-4 border-t border-border mt-4">
        <div className="flex gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about ${language === "japanese" ? "Japanese" : "English"} grammar, vocabulary, or anything...`}
            rows={1}
            disabled={isStreaming}
            className="flex-1 px-5 py-3.5 rounded-2xl bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 resize-none transition-colors min-h-[52px] max-h-32 overflow-y-auto leading-relaxed"
            style={{ height: "auto" }}
            onInput={e => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 128) + "px";
            }}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isStreaming}
            className="h-[52px] w-[52px] p-0 rounded-2xl bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(139,92,246,0.3)] shrink-0"
          >
            {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
