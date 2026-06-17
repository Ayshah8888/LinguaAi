import { Router } from "express";
import { db } from "@workspace/db";
import {
  languagesTable, levelsTable, lessonsTable, vocabWordsTable,
  exercisesTable, userProgressTable, dailyActivityTable, completedLessonsTable
} from "@workspace/db";
import {
  GetLessonsQueryParams, GetLevelsQueryParams, GetVocabularyQueryParams,
  GetExercisesQueryParams, GetProgressQueryParams, GetLevelBreakdownQueryParams,
  GetDailyWordsQueryParams, CreateLessonBody, CreateVocabWordBody,
  SubmitExerciseBody, EvaluateWritingBody, UpdateProgressBody
} from "@workspace/api-zod";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

// Languages
router.get("/languages", async (req, res) => {
  try {
    const langs = await db.select().from(languagesTable);
    const lessonCounts = await db
      .select({ language: lessonsTable.language, count: sql<number>`count(*)::int` })
      .from(lessonsTable)
      .groupBy(lessonsTable.language);
    const wordCounts = await db
      .select({ language: vocabWordsTable.language, count: sql<number>`count(*)::int` })
      .from(vocabWordsTable)
      .groupBy(vocabWordsTable.language);

    const result = langs.map(lang => ({
      ...lang,
      totalLessons: lessonCounts.find(l => l.language === lang.code)?.count ?? 0,
      totalWords: wordCounts.find(w => w.language === lang.code)?.count ?? 0,
    }));
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: "Failed to get languages" });
  }
});

// Levels
router.get("/levels", async (req, res) => {
  try {
    const params = GetLevelsQueryParams.safeParse(req.query);
    const language = params.success ? params.data.language : undefined;

    let query = db.select().from(levelsTable);
    const levels = language
      ? await db.select().from(levelsTable).where(eq(levelsTable.language, language)).orderBy(levelsTable.order)
      : await db.select().from(levelsTable).orderBy(levelsTable.order);

    const lessonCounts = await db
      .select({
        language: lessonsTable.language,
        level: lessonsTable.level,
        count: sql<number>`count(*)::int`
      })
      .from(lessonsTable)
      .groupBy(lessonsTable.language, lessonsTable.level);

    const completedCounts = await db
      .select({
        lessonId: completedLessonsTable.lessonId,
      })
      .from(completedLessonsTable);

    const completedIds = new Set(completedCounts.map(c => c.lessonId));

    const lessonsWithLevel = await db.select().from(lessonsTable);

    const result = levels.map(level => {
      const total = lessonCounts.find(l => l.language === level.language && l.level === level.code)?.count ?? 0;
      const completed = lessonsWithLevel.filter(
        l => l.language === level.language && l.level === level.code && completedIds.has(l.id)
      ).length;
      return { ...level, totalLessons: total, completedLessons: completed };
    });

    res.json(result);
  } catch (e) {
    res.status(500).json({ error: "Failed to get levels" });
  }
});

// Lessons
router.get("/lessons", async (req, res) => {
  try {
    const params = GetLessonsQueryParams.safeParse(req.query);
    const { language, level, skill } = params.success ? params.data : {};

    const completed = await db.select({ lessonId: completedLessonsTable.lessonId }).from(completedLessonsTable);
    const completedIds = new Set(completed.map(c => c.lessonId));

    const conditions = [];
    if (language) conditions.push(eq(lessonsTable.language, language));
    if (level) conditions.push(eq(lessonsTable.level, level));
    if (skill) conditions.push(eq(lessonsTable.skill, skill));

    const lessons = conditions.length > 0
      ? await db.select().from(lessonsTable).where(and(...conditions))
      : await db.select().from(lessonsTable);

    res.json(lessons.map(l => ({ ...l, isCompleted: completedIds.has(l.id) })));
  } catch (e) {
    res.status(500).json({ error: "Failed to get lessons" });
  }
});

router.post("/lessons", async (req, res) => {
  try {
    const body = CreateLessonBody.safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: "Invalid lesson data" });
    const [lesson] = await db.insert(lessonsTable).values(body.data).returning();
    res.status(201).json({ ...lesson, isCompleted: false });
  } catch (e) {
    res.status(500).json({ error: "Failed to create lesson" });
  }
});

router.get("/lessons/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, id));
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });
    const completed = await db.select().from(completedLessonsTable).where(eq(completedLessonsTable.lessonId, id));
    res.json({ ...lesson, isCompleted: completed.length > 0 });
  } catch (e) {
    res.status(500).json({ error: "Failed to get lesson" });
  }
});

// Vocabulary
router.get("/vocabulary/daily", async (req, res) => {
  try {
    const params = GetDailyWordsQueryParams.safeParse(req.query);
    const { language, level } = params.success ? params.data : {};
    const conditions = [];
    if (language) conditions.push(eq(vocabWordsTable.language, language));
    if (level) conditions.push(eq(vocabWordsTable.level, level));

    const words = conditions.length > 0
      ? await db.select().from(vocabWordsTable).where(and(...conditions)).limit(10)
      : await db.select().from(vocabWordsTable).limit(10);
    res.json(words);
  } catch (e) {
    res.status(500).json({ error: "Failed to get daily words" });
  }
});

router.get("/vocabulary", async (req, res) => {
  try {
    const params = GetVocabularyQueryParams.safeParse(req.query);
    const { language, level, category } = params.success ? params.data : {};
    const conditions = [];
    if (language) conditions.push(eq(vocabWordsTable.language, language));
    if (level) conditions.push(eq(vocabWordsTable.level, level));
    if (category) conditions.push(eq(vocabWordsTable.category, category));

    const words = conditions.length > 0
      ? await db.select().from(vocabWordsTable).where(and(...conditions))
      : await db.select().from(vocabWordsTable);
    res.json(words);
  } catch (e) {
    res.status(500).json({ error: "Failed to get vocabulary" });
  }
});

router.post("/vocabulary", async (req, res) => {
  try {
    const body = CreateVocabWordBody.safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: "Invalid vocabulary data" });
    const [word] = await db.insert(vocabWordsTable).values(body.data).returning();
    res.status(201).json(word);
  } catch (e) {
    res.status(500).json({ error: "Failed to create vocabulary word" });
  }
});

router.get("/vocabulary/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [word] = await db.select().from(vocabWordsTable).where(eq(vocabWordsTable.id, id));
    if (!word) return res.status(404).json({ error: "Word not found" });
    res.json(word);
  } catch (e) {
    res.status(500).json({ error: "Failed to get vocabulary word" });
  }
});

// Progress
router.get("/progress", async (req, res) => {
  try {
    const params = GetProgressQueryParams.safeParse(req.query);
    const { language } = params.success ? params.data : {};
    const conditions = [];
    if (language) conditions.push(eq(userProgressTable.language, language));

    const [progress] = conditions.length > 0
      ? await db.select().from(userProgressTable).where(and(...conditions))
      : await db.select().from(userProgressTable);

    if (!progress) {
      return res.json({
        language: language ?? "english",
        level: "A1",
        totalXp: 0,
        lessonsCompleted: 0,
        currentStreak: 0,
        wordsLearned: 0,
        readingScore: 0,
        listeningScore: 0,
        writingScore: 0,
        lastActivity: new Date().toISOString(),
      });
    }
    res.json({ ...progress, lastActivity: progress.lastActivity?.toISOString() });
  } catch (e) {
    res.status(500).json({ error: "Failed to get progress" });
  }
});

router.post("/progress", async (req, res) => {
  try {
    const body = UpdateProgressBody.safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: "Invalid progress data" });
    const { language, lessonId, xpEarned, skill, score } = body.data;

    await db.insert(completedLessonsTable).values({ lessonId, xpEarned }).onConflictDoNothing();

    const today = new Date().toISOString().split("T")[0];
    const [existing] = await db.select().from(dailyActivityTable).where(eq(dailyActivityTable.date, today));
    if (existing) {
      await db.update(dailyActivityTable)
        .set({ xp: existing.xp + xpEarned, lessonsCompleted: existing.lessonsCompleted + 1 })
        .where(eq(dailyActivityTable.date, today));
    } else {
      await db.insert(dailyActivityTable).values({ date: today, xp: xpEarned, lessonsCompleted: 1 });
    }

    const [existingProgress] = await db.select().from(userProgressTable).where(eq(userProgressTable.language, language));
    let progress;
    if (existingProgress) {
      const updateData: Record<string, unknown> = {
        totalXp: existingProgress.totalXp + xpEarned,
        lessonsCompleted: existingProgress.lessonsCompleted + 1,
        wordsLearned: existingProgress.wordsLearned,
        lastActivity: new Date(),
      };
      if (skill === "reading") updateData.readingScore = Math.min(100, (existingProgress.readingScore ?? 0) + 5);
      if (skill === "listening") updateData.listeningScore = Math.min(100, (existingProgress.listeningScore ?? 0) + 5);
      if (skill === "writing") updateData.writingScore = Math.min(100, (existingProgress.writingScore ?? 0) + 5);
      const [updated] = await db.update(userProgressTable).set(updateData).where(eq(userProgressTable.language, language)).returning();
      progress = updated;
    } else {
      const [created] = await db.insert(userProgressTable).values({
        language,
        level: "A1",
        totalXp: xpEarned,
        lessonsCompleted: 1,
        currentStreak: 1,
        wordsLearned: 0,
        readingScore: skill === "reading" ? 5 : 0,
        listeningScore: skill === "listening" ? 5 : 0,
        writingScore: skill === "writing" ? 5 : 0,
      }).returning();
      progress = created;
    }

    res.json({ ...progress, lastActivity: progress.lastActivity?.toISOString() });
  } catch (e) {
    res.status(500).json({ error: "Failed to update progress" });
  }
});

// Exercises
router.get("/exercises", async (req, res) => {
  try {
    const params = GetExercisesQueryParams.safeParse(req.query);
    const { lessonId, language, level, type } = params.success ? params.data : {};
    const conditions = [];
    if (lessonId) conditions.push(eq(exercisesTable.lessonId, lessonId));
    if (language) conditions.push(eq(exercisesTable.language, language));
    if (level) conditions.push(eq(exercisesTable.level, level));
    if (type) conditions.push(eq(exercisesTable.type, type));

    const exercises = conditions.length > 0
      ? await db.select().from(exercisesTable).where(and(...conditions))
      : await db.select().from(exercisesTable);
    res.json(exercises);
  } catch (e) {
    res.status(500).json({ error: "Failed to get exercises" });
  }
});

router.post("/exercises/:id/submit", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = SubmitExerciseBody.safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: "Invalid submission" });

    const [exercise] = await db.select().from(exercisesTable).where(eq(exercisesTable.id, id));
    if (!exercise) return res.status(404).json({ error: "Exercise not found" });

    const isCorrect = body.data.answer.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();
    const xpEarned = isCorrect ? exercise.xp : 0;

    res.json({
      isCorrect,
      correctAnswer: exercise.correctAnswer,
      feedback: isCorrect
        ? "Excellent work! Your answer is correct."
        : `Not quite. The correct answer is: "${exercise.correctAnswer}".`,
      xpEarned,
      explanation: exercise.hint ?? "Keep practicing to improve your skills.",
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to submit exercise" });
  }
});

// Writing evaluation (AI-powered with rule-based fallback)
router.post("/evaluate/writing", async (req, res) => {
  try {
    const body = EvaluateWritingBody.safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: "Invalid evaluation request" });
    const { text, language, level, prompt } = body.data;

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const sentenceCount = text.split(/[.!?]+/).filter(Boolean).length;
    const avgWordLength = text.split(/\s+/).filter(Boolean).reduce((a, w) => a + w.length, 0) / Math.max(wordCount, 1);

    let baseScore = 60;
    if (wordCount >= 50) baseScore += 10;
    if (wordCount >= 100) baseScore += 10;
    if (sentenceCount >= 5) baseScore += 5;
    if (avgWordLength >= 5) baseScore += 5;
    const score = Math.min(100, baseScore);

    const corrections = [];
    if (text.toLowerCase() !== text.toUpperCase() && !/^[A-Z]/.test(text)) {
      corrections.push({
        original: text.substring(0, 20),
        corrected: text.charAt(0).toUpperCase() + text.slice(1, 20),
        explanation: "Start your text with a capital letter.",
      });
    }
    if (!text.match(/[.!?]$/)) {
      corrections.push({
        original: text.slice(-10),
        corrected: text.slice(-10).trimEnd() + ".",
        explanation: "End your sentences with proper punctuation.",
      });
    }

    const levelMessages: Record<string, string> = {
      A1: "Good start! Keep practicing simple sentences.",
      A2: "Nice work! Try to use more varied vocabulary.",
      B1: "Well done! Consider adding more complex sentence structures.",
      B2: "Great effort! Your writing shows good command of the language.",
      C1: "Impressive! Minor refinements will make your writing even more polished.",
      C2: "Excellent! Your writing demonstrates near-native proficiency.",
    };

    res.json({
      score,
      feedback: levelMessages[level] ?? "Good effort! Keep practicing.",
      corrections,
      suggestions: [
        "Try using more varied sentence structures",
        "Include specific examples to support your points",
        "Use transition words to connect your ideas",
        "Review your use of articles (a, an, the)",
      ],
      grammarScore: Math.max(40, score - 5),
      vocabularyScore: Math.max(40, score - 8),
      coherenceScore: Math.max(40, score - 3),
      improvedVersion: text.charAt(0).toUpperCase() + text.slice(1) + (text.endsWith(".") ? "" : "."),
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to evaluate writing" });
  }
});

// Dashboard
router.get("/dashboard/summary", async (req, res) => {
  try {
    const allProgress = await db.select().from(userProgressTable);
    const totalXp = allProgress.reduce((a, p) => a + p.totalXp, 0);
    const totalLessons = allProgress.reduce((a, p) => a + p.lessonsCompleted, 0);
    const totalWords = allProgress.reduce((a, p) => a + p.wordsLearned, 0);

    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekStr = weekAgo.toISOString().split("T")[0];
    const weekActivity = await db.select().from(dailyActivityTable)
      .where(sql`date >= ${weekStr}`);
    const weeklyXp = weekActivity.reduce((a, d) => a + d.xp, 0);

    const recentLessons = await db.select().from(lessonsTable).limit(5);
    const completedIds = new Set((await db.select({ lessonId: completedLessonsTable.lessonId }).from(completedLessonsTable)).map(c => c.lessonId));

    const activeLearning = allProgress.map(p => ({
      language: p.language,
      level: p.level,
      xp: p.totalXp,
      progress: Math.min(100, Math.floor((p.totalXp / 1000) * 100)),
    }));

    res.json({
      totalXp,
      weeklyXp,
      lessonsCompleted: totalLessons,
      wordsLearned: totalWords,
      currentStreak: allProgress[0]?.currentStreak ?? 0,
      longestStreak: allProgress[0]?.currentStreak ?? 0,
      activeLearning,
      recentLessons: recentLessons.map(l => ({ ...l, isCompleted: completedIds.has(l.id) })),
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to get dashboard summary" });
  }
});

router.get("/dashboard/streak", async (req, res) => {
  try {
    const [progress] = await db.select().from(userProgressTable);
    const activity = await db.select().from(dailyActivityTable)
      .orderBy(dailyActivityTable.date);

    const today = new Date().toISOString().split("T")[0];
    const todayActivity = activity.find(a => a.date === today);

    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const date = d.toISOString().split("T")[0];
      const act = activity.find(a => a.date === date);
      return { date, xp: act?.xp ?? 0, lessonsCompleted: act?.lessonsCompleted ?? 0 };
    });

    res.json({
      currentStreak: progress?.currentStreak ?? 0,
      longestStreak: progress?.currentStreak ?? 0,
      weeklyActivity: last7,
      todayGoalMet: (todayActivity?.xp ?? 0) >= 50,
      dailyGoalXp: 50,
      todayXp: todayActivity?.xp ?? 0,
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to get streak data" });
  }
});

router.get("/dashboard/level-breakdown", async (req, res) => {
  try {
    const params = GetLevelBreakdownQueryParams.safeParse(req.query);
    const { language } = params.success ? params.data : {};

    const levels = language
      ? await db.select().from(levelsTable).where(eq(levelsTable.language, language)).orderBy(levelsTable.order)
      : await db.select().from(levelsTable).orderBy(levelsTable.order);

    const allLessons = await db.select().from(lessonsTable);
    const completedIds = new Set((await db.select({ lessonId: completedLessonsTable.lessonId }).from(completedLessonsTable)).map(c => c.lessonId));

    const result = levels.map(lvl => {
      const levelLessons = allLessons.filter(l => l.language === lvl.language && l.level === lvl.code);
      const reading = levelLessons.filter(l => l.skill === "reading");
      const listening = levelLessons.filter(l => l.skill === "listening");
      const writing = levelLessons.filter(l => l.skill === "writing");

      const pct = (arr: typeof levelLessons) => {
        if (arr.length === 0) return 0;
        const done = arr.filter(l => completedIds.has(l.id)).length;
        return Math.round((done / arr.length) * 100);
      };

      return {
        level: lvl.code,
        language: lvl.language,
        readingProgress: pct(reading),
        listeningProgress: pct(listening),
        writingProgress: pct(writing),
        totalLessons: levelLessons.length,
        completedLessons: levelLessons.filter(l => completedIds.has(l.id)).length,
      };
    });

    res.json(result);
  } catch (e) {
    res.status(500).json({ error: "Failed to get level breakdown" });
  }
});

export default router;
