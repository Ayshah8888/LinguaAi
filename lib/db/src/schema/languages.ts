import { pgTable, serial, text, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const languagesTable = pgTable("languages", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  flag: text("flag").notNull(),
  description: text("description").notNull(),
});

export const levelsTable = pgTable("levels", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  language: text("language").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
});

export const lessonsTable = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  language: text("language").notNull(),
  level: text("level").notNull(),
  skill: text("skill").notNull(),
  content: text("content").notNull(),
  audioUrl: text("audio_url"),
  duration: integer("duration").notNull().default(10),
  xp: integer("xp").notNull().default(50),
  description: text("description").notNull().default(""),
  objectives: text("objectives").array().notNull().default([]),
  tags: text("tags").array().notNull().default([]),
  isCompleted: boolean("is_completed").notNull().default(false),
});

export const vocabWordsTable = pgTable("vocab_words", {
  id: serial("id").primaryKey(),
  word: text("word").notNull(),
  translation: text("translation").notNull(),
  language: text("language").notNull(),
  level: text("level").notNull(),
  phonetic: text("phonetic").notNull(),
  exampleSentence: text("example_sentence").notNull().default(""),
  exampleTranslation: text("example_translation").notNull().default(""),
  category: text("category").notNull().default("general"),
  isMastered: boolean("is_mastered").notNull().default(false),
  difficulty: integer("difficulty").notNull().default(1),
  notes: text("notes"),
  reading: text("reading"),
});

export const exercisesTable = pgTable("exercises", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  question: text("question").notNull(),
  options: text("options").array().notNull().default([]),
  correctAnswer: text("correct_answer").notNull(),
  language: text("language").notNull(),
  level: text("level").notNull(),
  lessonId: integer("lesson_id"),
  hint: text("hint"),
  audioUrl: text("audio_url"),
  xp: integer("xp").notNull().default(20),
});

export const userProgressTable = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().default("guest"),
  language: text("language").notNull(),
  level: text("level").notNull().default("A1"),
  totalXp: integer("total_xp").notNull().default(0),
  lessonsCompleted: integer("lessons_completed").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  wordsLearned: integer("words_learned").notNull().default(0),
  readingScore: integer("reading_score").notNull().default(0),
  listeningScore: integer("listening_score").notNull().default(0),
  writingScore: integer("writing_score").notNull().default(0),
  lastActivity: timestamp("last_activity").defaultNow(),
});

export const dailyActivityTable = pgTable("daily_activity", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().default("guest"),
  date: text("date").notNull(),
  xp: integer("xp").notNull().default(0),
  lessonsCompleted: integer("lessons_completed").notNull().default(0),
});

export const completedLessonsTable = pgTable("completed_lessons", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().default("guest"),
  lessonId: integer("lesson_id").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  xpEarned: integer("xp_earned").notNull().default(0),
});

export const levelTestResultsTable = pgTable("level_test_results", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().default("guest"),
  language: text("language").notNull(),
  level: text("level").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  timeTaken: integer("time_taken").notNull().default(0),
  passed: boolean("passed").notNull().default(false),
  answers: text("answers").array().notNull().default([]),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const spacedRepetitionTable = pgTable("spaced_repetition", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().default("guest"),
  wordId: integer("word_id").notNull(),
  language: text("language").notNull(),
  easeFactor: integer("ease_factor").notNull().default(250),
  interval: integer("interval").notNull().default(1),
  repetitions: integer("repetitions").notNull().default(0),
  dueDate: text("due_date").notNull(),
  lastReviewed: timestamp("last_reviewed").defaultNow(),
});

export const leaderboardTable = pgTable("leaderboard", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().default("guest"),
  username: text("username").notNull(),
  avatar: text("avatar").notNull().default(""),
  totalXp: integer("total_xp").notNull().default(0),
  weeklyXp: integer("weekly_xp").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  lessonsCompleted: integer("lessons_completed").notNull().default(0),
  level: text("level").notNull().default("A1"),
  language: text("language").notNull().default("english"),
  country: text("country").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const savedLessonsTable = pgTable("saved_lessons", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().default("guest"),
  lessonId: integer("lesson_id").notNull(),
  savedAt: timestamp("saved_at").defaultNow(),
  content: text("content").notNull(),
  title: text("title").notNull(),
  language: text("language").notNull(),
  level: text("level").notNull(),
  skill: text("skill").notNull(),
});

export const insertLessonSchema = createInsertSchema(lessonsTable).omit({ id: true });
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessonsTable.$inferSelect;

export const insertVocabWordSchema = createInsertSchema(vocabWordsTable).omit({ id: true });
export type InsertVocabWord = z.infer<typeof insertVocabWordSchema>;
export type VocabWord = typeof vocabWordsTable.$inferSelect;

export const insertExerciseSchema = createInsertSchema(exercisesTable).omit({ id: true });
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercisesTable.$inferSelect;
