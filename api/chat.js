export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { bodyPart, history } = req.body;

  const system = bodyPart
    ? `You are a careful AI health assistant. The user has pain in their ${bodyPart}. Ask up to 2 short follow-up questions to understand the symptoms better. Keep replies under 70 words. Never prescribe medication. Recommend seeing a doctor for serious symptoms.`
    : `You are a careful AI health assistant helping someone describe general symptoms. Ask 1-2 short follow-up questions. Keep replies under 70 words. Never prescribe medication.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 200,
        messages: [
          { role: "system", content: system },
          ...history
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || "Groq API error" });
    }

    res.status(200).json({ reply: data.choices[0].message.content });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
