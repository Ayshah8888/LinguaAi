import { useParams, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { useGetLanguages } from "@workspace/api-client-react";
import { Printer, Download, ArrowLeft, CheckCircle2, Star, Award } from "lucide-react";
import { useRef } from "react";

const LEVEL_NAMES: Record<string, string> = {
  A1: "Beginner", A2: "Elementary", B1: "Intermediate",
  B2: "Upper Intermediate", C1: "Advanced", C2: "Mastery",
};

const LANG_LABELS: Record<string, string> = { english: "English", japanese: "Japanese" };
const LANG_FLAGS: Record<string, string> = { english: "🇬🇧", japanese: "🇯🇵" };

const LEVEL_COLORS: Record<string, { from: string; to: string; badge: string; glow: string }> = {
  A1: { from: "#78350f", to: "#92400e", badge: "#cd7f32", glow: "rgba(205,127,50,0.3)" },
  A2: { from: "#374151", to: "#4b5563", badge: "#a8a9ad", glow: "rgba(168,169,173,0.3)" },
  B1: { from: "#78350f", to: "#92400e", badge: "#ffd700", glow: "rgba(255,215,0,0.3)" },
  B2: { from: "#1e3a5f", to: "#1e40af", badge: "#60a5fa", glow: "rgba(96,165,250,0.3)" },
  C1: { from: "#1e1b4b", to: "#312e81", badge: "#818cf8", glow: "rgba(129,140,248,0.3)" },
  C2: { from: "#4a044e", to: "#701a75", badge: "#e879f9", glow: "rgba(232,121,249,0.4)" },
};

export default function Certificate() {
  const { language, level } = useParams<{ language: string; level: string }>();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const certRef = useRef<HTMLDivElement>(null);

  const score = parseInt(params.get("score") ?? "0");
  const timeTaken = parseInt(params.get("time") ?? "0");
  const correct = parseInt(params.get("correct") ?? "0");
  const total = parseInt(params.get("total") ?? "0");

  const colors = LEVEL_COLORS[level ?? "A1"] ?? LEVEL_COLORS["A1"];
  const completionDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const formatTime = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

  const handlePrint = () => {
    const printContent = certRef.current?.innerHTML ?? "";
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>LinguaAI Certificate - ${level} ${LANG_LABELS[language ?? "english"]}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body { background: white; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        </style>
      </head>
      <body>${printContent}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Results
        </button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button onClick={handlePrint} className="gap-2 bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <Download className="w-4 h-4" /> Download PDF
          </Button>
        </div>
      </div>

      <div ref={certRef}>
        <div style={{
          width: "100%",
          aspectRatio: "1.414",
          background: `linear-gradient(135deg, #0a0a0f 0%, #0f0a1f 50%, #0a0a0f 100%)`,
          borderRadius: "16px",
          border: `2px solid ${colors.badge}40`,
          padding: "48px 56px",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Inter, sans-serif",
          boxShadow: `0 0 60px ${colors.glow}, inset 0 0 80px rgba(0,0,0,0.5)`,
        }}>
          {/* Background decorative elements */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: `radial-gradient(ellipse at 20% 20%, ${colors.glow} 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, ${colors.glow} 0%, transparent 50%)`,
            pointerEvents: "none",
          }} />

          {/* Corner decorations */}
          {[
            { top: 20, left: 20 }, { top: 20, right: 20 },
            { bottom: 20, left: 20 }, { bottom: 20, right: 20 }
          ].map((pos, i) => (
            <div key={i} style={{
              position: "absolute", ...pos,
              width: 40, height: 40,
              border: `2px solid ${colors.badge}60`,
              borderRadius: 4,
              opacity: 0.6,
            }} />
          ))}

          {/* Inner border */}
          <div style={{
            position: "absolute", top: 28, left: 28, right: 28, bottom: 28,
            border: `1px solid ${colors.badge}20`,
            borderRadius: 12,
            pointerEvents: "none",
          }} />

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: `linear-gradient(135deg, ${colors.badge}40, ${colors.badge}20)`,
                border: `1px solid ${colors.badge}60`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 18 }}>◆</span>
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#ffffff", letterSpacing: 2 }}>LINGUA<span style={{ color: colors.badge }}>AI</span></span>
            </div>
            <div style={{
              padding: "6px 16px",
              background: `${colors.badge}20`,
              border: `1px solid ${colors.badge}40`,
              borderRadius: 20,
              fontSize: 11,
              color: colors.badge,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}>
              Official Certificate
            </div>
          </div>

          {/* Main title */}
          <div style={{ textAlign: "center", marginBottom: 28, position: "relative" }}>
            <p style={{ fontSize: 12, letterSpacing: 4, color: "#6b7280", textTransform: "uppercase", marginBottom: 8 }}>
              Certificate of Achievement
            </p>
            <h1 style={{
              fontSize: 44, fontWeight: 800, color: "#ffffff",
              lineHeight: 1.1, marginBottom: 8,
              textShadow: `0 0 40px ${colors.glow}`,
              fontFamily: "'Playfair Display', serif",
            }}>
              {LANG_FLAGS[language ?? "english"]} {LEVEL_NAMES[level ?? "A1"]} Level
            </h1>
            <p style={{ fontSize: 18, color: colors.badge, fontWeight: 600, letterSpacing: 1 }}>
              {LANG_LABELS[language ?? "english"]} Language · {level}
            </p>
          </div>

          {/* Recipient */}
          <div style={{ textAlign: "center", marginBottom: 32, position: "relative" }}>
            <p style={{ fontSize: 12, color: "#6b7280", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>
              This certifies that
            </p>
            <div style={{
              fontSize: 30, fontWeight: 700, color: "#ffffff",
              fontFamily: "'Playfair Display', serif",
              borderBottom: `2px solid ${colors.badge}60`,
              display: "inline-block", paddingBottom: 8, minWidth: 240,
            }}>
              Learner
            </div>
            <p style={{ fontSize: 13, color: "#6b7280", marginTop: 10, maxWidth: 500, margin: "10px auto 0" }}>
              has successfully completed the {LEVEL_NAMES[level ?? "A1"]} ({level}) level assessment
              in the <strong style={{ color: "#d1d5db" }}>{LANG_LABELS[language ?? "english"]} Language</strong> program
              on the LinguaAI platform, demonstrating proficiency in reading, listening, and writing skills.
            </p>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 16, marginBottom: 32, justifyContent: "center", position: "relative" }}>
            {[
              { label: "Final Score", value: `${score}%` },
              { label: "Correct Answers", value: `${correct}/${total}` },
              { label: "Completion Time", value: formatTime(timeTaken) },
              { label: "Status", value: "PASSED" },
            ].map(stat => (
              <div key={stat.label} style={{
                flex: 1,
                background: `${colors.badge}10`,
                border: `1px solid ${colors.badge}30`,
                borderRadius: 10,
                padding: "12px 16px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: colors.badge, marginBottom: 4 }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Skills row */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 28, position: "relative" }}>
            {["Reading", "Listening", "Writing", "Vocabulary", "Grammar"].map(skill => (
              <div key={skill} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                fontSize: 11,
                color: "#9ca3af",
              }}>
                <span style={{ color: "#22c55e", fontSize: 12 }}>✓</span> {skill}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderTop: `1px solid rgba(255,255,255,0.08)`,
            paddingTop: 20,
            position: "relative",
            marginTop: "auto",
          }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#d1d5db" }}>LinguaAI Platform</p>
              <p style={{ fontSize: 11, color: "#6b7280" }}>Issued: {completionDate}</p>
            </div>
            <div style={{
              width: 64, height: 64,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${colors.badge}30, ${colors.badge}10)`,
              border: `2px solid ${colors.badge}60`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 20px ${colors.glow}`,
            }}>
              <span style={{ fontSize: 28 }}>◆</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#d1d5db" }}>AI-Verified Assessment</p>
              <p style={{ fontSize: 11, color: "#6b7280" }}>certificate.linguaai.app</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground pb-8">
        Use the Print button above to save as PDF. In the print dialog, choose "Save as PDF" as the destination.
      </div>
    </div>
  );
}
