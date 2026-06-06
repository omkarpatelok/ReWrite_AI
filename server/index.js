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
      model: "meta-llama/llama-3.3-70b-instruct:free",
      messages: [{ role: "user", content: prompt }],
      temperature: 1.2,
      top_p: 0.95,
      max_tokens: 4000,
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

  const prompt = `You are an expert human writer and copyeditor. Rewrite the following text to make it sound completely human, natural, and conversational. Your goal is to bypass AI detection filters (like GPTZero, Turnitin) by optimizing perplexity (word choice variety) and burstiness (sentence structure variation).

STRICT RULES — follow every single one:
1. NO PREDICTABLE ESSAY STRUCTURE: Do NOT follow a standard AI essay template (e.g., Introduction -> Body -> Transition -> Ethical Warning/Limitation -> Conclusion). Break this order entirely. Reorganize the flow of ideas, merge or split thoughts, or start with the main conclusion first.
2. INTEGRATE WARNINGS NATURALLY: If the original text contains ethical warnings, privacy warnings, or limitations, do NOT isolate them in a separate transition paragraph at the end. Either weave them organically into other sentences or remove the preachy AI tone completely.
3. NATURAL HUMAN PHRASING: Avoid forced informal slang or slightly artificial casual words. Write in a clean, natural, and confident style — like a seasoned writer explaining a topic to a peer.
4. HIGH BURSTINESS: Mix very short, punchy sentences (3-8 words) with medium and longer sentences naturally. Avoid uniform sentence lengths.
5. HIGH PERPLEXITY: Avoid predictable, cliché word choices. Use natural synonyms, active verbs, and idioms that a human would write.
6. CONTRACTIONS: Use contractions (it's, don't, I've, we're, shouldn't, etc.) freely.
7. NO AI CLICHÉS: Absolutely do not use words or phrases like: "delve", "tapestry", "testament", "beacon", "moreover", "furthermore", "leverage", "utilize", "multifaceted", "nuanced", "comprehensive", "it is worth noting", "underpins", "pivotal", "crucial", "key takeaway", "first and foremost", "demystify", "streamline", "in conclusion", "it's important to note", "in today's world", "ultimately", "essentially", "in order to".
8. ACTIVE VOICE: Replace passive voice with active voice wherever possible.
9. PARAGRAPHS: Keep paragraphs short and dynamic. Feel free to combine or split paragraphs to destroy the original AI layout.
10. TONE: ${toneInstruction}.
11. OUTPUT ONLY: Return ONLY the rewritten text. No preamble, no explanation, no markdown blocks, no quotes.

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
