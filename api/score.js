const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

async function callGemini(prompt) {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-lite-001",
      messages: [{ role: "user", content: prompt }],
      temperature: 1.2,
      top_p: 0.95,
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

export default async (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "No text provided" });
  }

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
};
