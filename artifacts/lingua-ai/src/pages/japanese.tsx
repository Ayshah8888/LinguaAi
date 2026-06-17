import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { useGetLevels } from "@workspace/api-client-react";
import { ArrowRight, BookOpen, PenTool } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function JapaneseHub() {
  const { data: levels, isLoading } = useGetLevels({ language: "japanese" });

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden glass-card border-primary/20 bg-gradient-to-r from-card to-primary/10">
        <div className="absolute top-0 right-0 w-[500px] h-full opacity-10 pointer-events-none flex items-center justify-center">
          <span className="text-[200px] font-japanese font-bold text-primary">日本</span>
        </div>
        
        <div className="relative z-10 p-12 lg:p-16 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary font-medium text-sm mb-6 border border-primary/30">
            <span className="text-xl">🇯🇵</span> Japanese Curriculum
          </div>
          <h1 className="text-5xl lg:text-6xl font-display font-bold mb-6 tracking-tight">
            Master <span className="text-primary font-japanese">日本語</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            From essential kana to advanced kanji. Our AI tutor adapts to your learning pace, making the world's most elegant language accessible.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/learn/japanese/A1">
              <div className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] cursor-pointer inline-flex items-center">
                Start Basics <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Writing Systems Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl font-display font-bold flex items-center gap-3">
          <PenTool className="w-6 h-6 text-primary" /> The Writing Systems
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-8 glass-card border-border hover:border-primary/50 transition-colors group">
            <div className="text-6xl font-japanese font-bold text-gradient mb-4 drop-shadow-sm">あ</div>
            <h3 className="text-xl font-bold mb-2">Hiragana</h3>
            <p className="text-muted-foreground text-sm mb-6">The foundation of Japanese. Used for native words and grammatical particles.</p>
            <div className="text-sm font-medium text-primary flex items-center group-hover:gap-2 transition-all">
              Practice Kana <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Card>
          
          <Card className="p-8 glass-card border-border hover:border-primary/50 transition-colors group">
            <div className="text-6xl font-japanese font-bold text-blue-400 mb-4 drop-shadow-sm">ア</div>
            <h3 className="text-xl font-bold mb-2">Katakana</h3>
            <p className="text-muted-foreground text-sm mb-6">Used primarily for foreign loanwords, technical terms, and emphasis.</p>
            <div className="text-sm font-medium text-blue-400 flex items-center group-hover:gap-2 transition-all">
              Practice Kana <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Card>
          
          <Card className="p-8 glass-card border-border hover:border-primary/50 transition-colors group">
            <div className="text-6xl font-japanese font-bold text-fuchsia-400 mb-4 drop-shadow-sm">学</div>
            <h3 className="text-xl font-bold mb-2">Kanji</h3>
            <p className="text-muted-foreground text-sm mb-6">Adopted logographic Chinese characters used to express core meanings.</p>
            <div className="text-sm font-medium text-fuchsia-400 flex items-center group-hover:gap-2 transition-all">
              Explore Kanji <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Card>
        </div>
      </section>

      {/* Levels */}
      <section className="space-y-6">
        <h2 className="text-2xl font-display font-bold flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-primary" /> Path to Fluency
        </h2>
        
        <div className="space-y-4">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
          ) : (
            levels?.map((level) => (
              <Link key={level.id} href={`/learn/japanese/${level.code}`}>
                <Card className="p-6 glass-card border-border/50 hover:border-primary/50 transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-xl font-bold font-display text-primary border border-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.1)] group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-shadow">
                      {level.code}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{level.name}</h3>
                      <p className="text-muted-foreground text-sm max-w-lg">{level.description}</p>
                    </div>
                  </div>
                  
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <div className="text-sm font-medium">{level.totalLessons} Lessons</div>
                      <div className="text-xs text-primary">{level.completedLessons || 0} completed</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}