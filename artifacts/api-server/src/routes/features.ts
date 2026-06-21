import { Router } from "express";
import { db } from "@workspace/db";
import {
  spacedRepetitionTable, leaderboardTable, savedLessonsTable,
  vocabWordsTable, lessonsTable
} from "@workspace/db";
import { eq, and, sql, lte } from "drizzle-orm";

const router = Router();

function uid(req: any): string {
  return req.user?.id ?? "guest";
}

// ── Spaced Repetition ──────────────────────────────────────────────
router.get("/spaced-repetition/due", async (req, res) => {
  try {
    const { language } = req.query as { language?: string };
    const today = new Date().toISOString().split("T")[0];
    const userId = uid(req);

    const conditions = [
      eq(spacedRepetitionTable.userId, userId),
      lte(spacedRepetitionTable.dueDate, today),
    ];
    if (language) conditions.push(eq(spacedRepetitionTable.language, language));

    const due = await db.select({ sr: spacedRepetitionTable, word: vocabWordsTable })
      .from(spacedRepetitionTable)
      .innerJoin(vocabWordsTable, eq(spacedRepetitionTable.wordId, vocabWordsTable.id))
      .where(and(...conditions))
      .limit(20);

    res.json(due.map(d => ({ ...d.word, sr: d.sr })));
  } catch (e) {
    res.status(500).json({ error: "Failed to get due cards" });
  }
});

router.post("/spaced-repetition/review", async (req, res) => {
  try {
    const { wordId, language, quality } = req.body;
    if (wordId === undefined || quality === undefined) {
      return res.status(400).json({ error: "wordId and quality required" });
    }
    const userId = uid(req);

    const [existing] = await db.select().from(spacedRepetitionTable)
      .where(and(
        eq(spacedRepetitionTable.userId, userId),
        eq(spacedRepetitionTable.wordId, wordId),
        eq(spacedRepetitionTable.language, language ?? "english")
      ));

    let easeFactor = existing?.easeFactor ?? 250;
    let interval = existing?.interval ?? 1;
    let repetitions = existing?.repetitions ?? 0;

    if (quality >= 3) {
      if (repetitions === 0) interval = 1;
      else if (repetitions === 1) interval = 6;
      else interval = Math.round(interval * (easeFactor / 100));
      repetitions += 1;
    } else {
      repetitions = 0;
      interval = 1;
    }
    easeFactor = Math.max(130, easeFactor + (10 * (quality - 3) + Math.floor(0.08 * quality * quality)));

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + interval);
    const dueDateStr = dueDate.toISOString().split("T")[0];

    if (existing) {
      await db.update(spacedRepetitionTable)
        .set({ easeFactor, interval, repetitions, dueDate: dueDateStr, lastReviewed: new Date() })
        .where(eq(spacedRepetitionTable.id, existing.id));
    } else {
      await db.insert(spacedRepetitionTable).values({
        userId, wordId, language: language ?? "english",
        easeFactor, interval, repetitions, dueDate: dueDateStr,
      });
    }

    res.json({ wordId, nextDue: dueDateStr, interval, repetitions, easeFactor });
  } catch (e) {
    res.status(500).json({ error: "Failed to record review" });
  }
});

router.get("/spaced-repetition/stats", async (req, res) => {
  try {
    const { language } = req.query as { language?: string };
    const today = new Date().toISOString().split("T")[0];
    const userId = uid(req);

    const conditions = [eq(spacedRepetitionTable.userId, userId)];
    if (language) conditions.push(eq(spacedRepetitionTable.language, language));

    const allCards = await db.select().from(spacedRepetitionTable).where(and(...conditions));

    const due = allCards.filter(c => c.dueDate <= today).length;
    const mastered = allCards.filter(c => c.repetitions >= 5).length;
    const learning = allCards.filter(c => c.repetitions > 0 && c.repetitions < 5).length;
    const total = allCards.length;

    res.json({ due, mastered, learning, total, new: total - mastered - learning });
  } catch (e) {
    res.status(500).json({ error: "Failed to get SR stats" });
  }
});

// ── Leaderboard ────────────────────────────────────────────────────
router.get("/leaderboard", async (req, res) => {
  try {
    const { type = "total", language } = req.query as { type?: string; language?: string };

    const conditions = language ? [eq(leaderboardTable.language, language)] : [];
    const rows = await db.select().from(leaderboardTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(type === "weekly" ? sql`weekly_xp desc` : type === "streak" ? sql`current_streak desc` : sql`total_xp desc`)
      .limit(20);

    res.json(rows.map((r, i) => ({ ...r, rank: i + 1, updatedAt: r.updatedAt?.toISOString() })));
  } catch (e) {
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
});

router.post("/leaderboard/sync", async (req, res) => {
  try {
    const { username, totalXp, weeklyXp, currentStreak, lessonsCompleted, level, language, country } = req.body;
    if (!username) return res.status(400).json({ error: "username required" });
    const userId = uid(req);

    const [existing] = await db.select().from(leaderboardTable).where(eq(leaderboardTable.userId, userId));

    if (existing) {
      const [updated] = await db.update(leaderboardTable)
        .set({ username, totalXp, weeklyXp, currentStreak, lessonsCompleted, level, language, country, updatedAt: new Date() })
        .where(eq(leaderboardTable.userId, userId))
        .returning();
      res.json({ ...updated, updatedAt: updated.updatedAt?.toISOString() });
    } else {
      const [created] = await db.insert(leaderboardTable)
        .values({ userId, username, totalXp, weeklyXp, currentStreak, lessonsCompleted, level, language, country })
        .returning();
      res.json({ ...created, updatedAt: created.updatedAt?.toISOString() });
    }
  } catch (e) {
    res.status(500).json({ error: "Failed to sync leaderboard" });
  }
});

// ── Offline / Saved Lessons ────────────────────────────────────────
router.get("/saved-lessons", async (req, res) => {
  try {
    const userId = uid(req);
    const rows = await db.select().from(savedLessonsTable)
      .where(eq(savedLessonsTable.userId, userId))
      .orderBy(sql`saved_at desc`);
    res.json(rows.map(r => ({ ...r, savedAt: r.savedAt?.toISOString() })));
  } catch (e) {
    res.status(500).json({ error: "Failed to get saved lessons" });
  }
});

router.post("/saved-lessons", async (req, res) => {
  try {
    const { lessonId, content, title, language, level, skill } = req.body;
    if (!lessonId) return res.status(400).json({ error: "lessonId required" });
    const userId = uid(req);

    const [existing] = await db.select().from(savedLessonsTable)
      .where(and(eq(savedLessonsTable.userId, userId), eq(savedLessonsTable.lessonId, lessonId)));
    if (existing) return res.json({ ...existing, savedAt: existing.savedAt?.toISOString(), alreadySaved: true });

    const [saved] = await db.insert(savedLessonsTable)
      .values({ userId, lessonId, content, title, language, level, skill })
      .returning();
    res.status(201).json({ ...saved, savedAt: saved.savedAt?.toISOString() });
  } catch (e) {
    res.status(500).json({ error: "Failed to save lesson" });
  }
});

router.delete("/saved-lessons/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = uid(req);
    await db.delete(savedLessonsTable)
      .where(and(eq(savedLessonsTable.id, id), eq(savedLessonsTable.userId, userId)));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete saved lesson" });
  }
});

export default router;
