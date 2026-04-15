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

  const { text, tonePrompt } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "No text provided" });
  }

  if (text.length > 10000) {
    return res.status(400).json({ error: "Text exceeds 10,000 character limit" });
  }

  const toneInstruction = tonePrompt || "natural and conversational";

  const prompt = `You are a human writer. Rewrite the following text so it reads as if written by a real person, not an AI.

STRICT RULES — follow every one:
1. Use varied sentence lengths — mix short punchy sentences with longer ones naturally.
2. Use contractions freely (it's, don't, I've, we're, that's, etc.).
3. Add minor imperfections: occasional colloquial phrasing, a rhetorical question, or a brief aside.
4. Avoid all AI-typical phrases: "delve", "it's important to note", "in conclusion", "furthermore", "moreover", "in today's world", "leverage", "utilize", "multifaceted", "nuanced", "comprehensive", "it is worth noting", "underpins", "pivotal", "crucial", "key takeaway".
5. Do NOT use bullet points or numbered lists unless the original had them.
6. Break up long paragraphs. Keep paragraphs 2–4 sentences max.
7. Use first or third person naturally — match the original voice.
8. Replace passive voice with active voice wherever possible.
9. Vary vocabulary — don't repeat the same word in close proximity.
10. Tone: ${toneInstruction}.
11. Output ONLY the rewritten text. No preamble, no explanation, no commentary.

TEXT TO REWRITE:
${text}`;

  try {
    const result = await callGemini(prompt);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
};
