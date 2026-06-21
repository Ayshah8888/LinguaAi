import { Router } from "express";
import { db } from "@workspace/db";
import { exercisesTable, levelTestResultsTable, userProgressTable, vocabWordsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

function uid(req: any): string {
  return req.user?.id ?? "guest";
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

router.get("/levels/:language/:level/test", async (req, res) => {
  try {
    const { language, level } = req.params;

    const exercises = await db.select().from(exercisesTable)
      .where(and(eq(exercisesTable.language, language), eq(exercisesTable.level, level)));

    let questions = shuffle(exercises).slice(0, 10);

    if (questions.length < 10) {
      const vocabWords = await db.select().from(vocabWordsTable)
        .where(and(eq(vocabWordsTable.language, language), eq(vocabWordsTable.level, level)))
        .limit(10 - questions.length);

      const vocabExercises = vocabWords.map((word, i) => ({
        id: -(i + 1),
        type: "multiple_choice",
        question: `What does "${word.word}" mean?`,
        options: shuffleOptions(word.translation, language),
        correctAnswer: word.translation,
        language,
        level,
        lessonId: null,
        hint: word.exampleSentence || null,
        audioUrl: null,
        xp: 15,
      }));

      questions = [...questions, ...vocabExercises];
    }

    if (questions.length < 10) {
      const generalExercises = await db.select().from(exercisesTable)
        .where(eq(exercisesTable.language, language))
        .limit(10 - questions.length);
      questions = [...questions, ...shuffle(generalExercises)].slice(0, 10);
    }

    res.json({
      language,
      level,
      totalQuestions: questions.length,
      timeLimit: 600,
      questions: questions.map(q => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options,
        language: q.language,
        level: q.level,
        hint: q.hint,
        xp: q.xp,
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get test questions" });
  }
});

router.post("/levels/:language/:level/test/submit", async (req, res) => {
  try {
    const { language, level } = req.params;
    const { answers, timeTaken } = req.body;
    const userId = uid(req);

    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: "answers must be an array" });
    }

    const exerciseIds = answers.filter((a: any) => a.questionId > 0).map((a: any) => a.questionId as number);
    let exercises: any[] = [];
    if (exerciseIds.length > 0) {
      exercises = await db.select().from(exercisesTable).where(sql`id = ANY(${exerciseIds})`);
    }

    const vocabWords = await db.select().from(vocabWordsTable)
      .where(and(eq(vocabWordsTable.language, language), eq(vocabWordsTable.level, level)));

    const results = answers.map((answer: any) => {
      let correctAnswer = "";
      let question = "";
      if (answer.questionId > 0) {
        const ex = exercises.find(e => e.id === answer.questionId);
        correctAnswer = ex?.correctAnswer ?? "";
        question = ex?.question ?? "";
      } else {
        const idx = Math.abs(answer.questionId) - 1;
        const word = vocabWords[idx];
        correctAnswer = word?.translation ?? "";
        question = `What does "${word?.word}" mean?`;
      }
      const isCorrect = answer.userAnswer?.trim().toLowerCase() === correctAnswer?.trim().toLowerCase();
      return { questionId: answer.questionId, question, userAnswer: answer.userAnswer, correctAnswer, isCorrect };
    });

    const correct = results.filter((r: any) => r.isCorrect).length;
    const total = results.length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = score >= 70;
    const xpEarned = passed ? 200 + score : Math.round(score * 0.5);

    const [testResult] = await db.insert(levelTestResultsTable).values({
      userId,
      language,
      level,
      score,
      totalQuestions: total,
      correctAnswers: correct,
      timeTaken: timeTaken ?? 0,
      passed,
      answers: results.map((r: any) => JSON.stringify(r)),
    }).returning();

    if (passed) {
      const [existingProgress] = await db.select().from(userProgressTable)
        .where(and(eq(userProgressTable.userId, userId), eq(userProgressTable.language, language)));
      if (existingProgress) {
        await db.update(userProgressTable)
          .set({ totalXp: existingProgress.totalXp + xpEarned })
          .where(and(eq(userProgressTable.userId, userId), eq(userProgressTable.language, language)));
      }
    }

    res.json({ id: testResult.id, language, level, score, totalQuestions: total, correctAnswers: correct, timeTaken: timeTaken ?? 0, passed, xpEarned, passingScore: 70, results });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to submit test" });
  }
});

router.get("/levels/:language/:level/test/history", async (req, res) => {
  try {
    const { language, level } = req.params;
    const userId = uid(req);
    const history = await db.select().from(levelTestResultsTable)
      .where(and(
        eq(levelTestResultsTable.userId, userId),
        eq(levelTestResultsTable.language, language),
        eq(levelTestResultsTable.level, level)
      ))
      .orderBy(sql`completed_at desc`)
      .limit(5);

    res.json(history.map(h => ({ ...h, completedAt: h.completedAt?.toISOString() })));
  } catch (e) {
    res.status(500).json({ error: "Failed to get test history" });
  }
});

function shuffleOptions(correct: string, language: string): string[] {
  const distractors: Record<string, string[]> = {
    english: ["beautiful", "difficult", "common", "expensive", "important", "possible", "different", "simple"],
    japanese: ["ありがとう", "すみません", "はい", "いいえ", "大きい", "小さい", "新しい", "古い"],
  };
  const pool = distractors[language] ?? distractors["english"];
  const opts = [correct, ...shuffle(pool).slice(0, 3)];
  return shuffle(opts);
}

export default router;
