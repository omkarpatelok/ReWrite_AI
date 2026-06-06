const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

async function callGemini(prompt) {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-3.5-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 1.2,
      top_p: 0.95,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errData = await response.json();
    console.error("OpenRouter API error:", errData);
    throw new Error(errData.error?.message || "API error");
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// ── /rewrite ────────────────────────────────────────────────────────────────
app.post("/rewrite", async (req, res) => {
  const { text, tonePrompt } = req.body;

  if (!text || text.trim() === "")
    return res.status(400).json({ error: "No text provided" });

  if (text.length > 10000)
    return res.status(400).json({ error: "Text exceeds 10,000 character limit" });

  const toneInstruction = tonePrompt || "natural and conversational";

  const prompt = `You are an expert human writer and copyeditor. Rewrite the following text to make it sound completely human, natural, and conversational. The goal is to bypass AI detection filters (like GPTZero, Turnitin) by optimizing perplexity (word choice variety) and burstiness (sentence structure variation).

STRICT RULES — follow every single one:
1. HIGH BURSTINESS: Mix very short, punchy sentences (3-8 words) with medium and longer sentences naturally. Never keep sentence lengths uniform.
2. HIGH PERPLEXITY: Avoid predictable, cliché word choices. Use natural synonyms and idioms that a human would write.
3. CONTRACTIONS: Use contractions (it's, don't, I've, we're, shouldn't, etc.) to sound conversational.
4. NO AI CLICHÉS: Absolutely do not use words or phrases like: "delve", "tapestry", "testament", "beacon", "moreover", "furthermore", "leverage", "utilize", "multifaceted", "nuanced", "comprehensive", "it is worth noting", "underpins", "pivotal", "crucial", "key takeaway", "first and foremost", "demystify", "streamline", "in conclusion", "it's important to note", "in today's world", "ultimately", "essentially", "in order to".
5. FLOW OVER STRUCTURE: Do NOT translate sentence-by-sentence. Combine, split, or restructure sentences freely so the prose flows beautifully.
6. NO LISTS: Do NOT use bullet points or numbered lists unless the original input has them.
7. ACTIVE VOICE: Replace passive voice (e.g., "The book was read by him") with active voice (e.g., "He read the book") wherever possible.
8. PARAGRAPHS: Keep paragraphs short (2-4 sentences max). If the input has multiple paragraphs, preserve the same paragraph boundaries but restructure the sentences within them.
9. TONE: ${toneInstruction}.
10. OUTPUT ONLY: Return ONLY the rewritten text. No preamble, no explanation, no markdown blocks, no quotes.

TEXT TO REWRITE:
${text}`;

  try {
    const result = await callGemini(prompt);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
});

// ── /score ───────────────────────────────────────────────────────────────────
app.post("/score", async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === "")
    return res.status(400).json({ error: "No text provided" });

  const prompt = `You are an AI detection expert. Analyze the following text and estimate how human-like it sounds versus AI-generated.

Return ONLY a valid JSON object with this exact structure — no markdown, no explanation:
{
  "humanScore": <number 0-100>,
  "aiScore": <number 0-100>,
  "grade": "<one of: Likely AI | Possibly AI | Mixed | Mostly Human | Human>",
  "turnitinRisk": "<one of: High | Medium | Low | Very Low>",
  "flags": [<list of up to 5 short strings describing AI-like patterns found, or empty array if none>],
  "summary": "<one sentence summary>"
}

humanScore + aiScore must equal 100.

TEXT TO ANALYZE:
${text}`;

  try {
    let raw = await callGemini(prompt);
    raw = raw.replace(/```json\n?|```\n?/g, "").trim();
    
    // Extract JSON if wrapped in other text
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate required fields
    if (typeof parsed.humanScore !== "number" || typeof parsed.aiScore !== "number") {
      throw new Error("Invalid score format");
    }
    
    res.json(parsed);
  } catch (err) {
    console.error("Score error:", err);
    res.status(500).json({ error: "Scoring failed. " + (err.message || "") });
  }
});

// ── health ───────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "AI Rewriter backend running ✓" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✓ Server running on http://localhost:${PORT}`));
