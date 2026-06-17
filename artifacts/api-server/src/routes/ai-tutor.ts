import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

router.post("/ai-tutor/chat", async (req, res) => {
  try {
    const { messages, language, level, context } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array required" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const systemPrompt = `You are an expert ${language === "japanese" ? "Japanese" : "English"} language tutor at the ${level ?? "B1"} CEFR level. You are a friendly, encouraging, and highly knowledgeable personal teacher.

Your role:
- Answer questions about grammar, vocabulary, pronunciation, and language usage
- Explain concepts clearly with examples appropriate for the ${level ?? "B1"} level
- Correct mistakes gently and explain why
- Provide example sentences and usage tips
- Encourage the learner and celebrate their progress
- If asked about a word or phrase, give: meaning, pronunciation, example sentence, and a memory tip
${context ? `\nCurrent lesson context: ${context}` : ""}

Always respond in the same language the user writes in (Arabic or English). Keep responses focused and practical. Format your responses clearly with line breaks for readability.`;

    const stream = anthropic.messages.stream({
      model: "claude-haiku-4-5",
      max_tokens: 8192,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        res.write(`data: ${JSON.stringify({ content: event.delta.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (e: any) {
    console.error("AI tutor error:", e);
    res.write(`data: ${JSON.stringify({ error: "AI service unavailable" })}\n\n`);
    res.end();
  }
});

export default router;
