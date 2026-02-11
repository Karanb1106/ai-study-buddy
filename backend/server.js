require("dotenv").config();
const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

/* ================= API KEY CHECK ================= */

const apiKey = process.env.GROQ_API_KEY;

if (apiKey) {
  console.log("✓ GROQ_API_KEY loaded successfully");
} else {
  console.error("✗ ERROR: GROQ_API_KEY not found in .env file!");
  process.exit(1);
}

/* ================= MIDDLEWARE ================= */

app.use(bodyParser.json({ limit: "200kb" }));

// Simple CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

/* ================= PROMPT BUILDERS ================= */

function buildExplainPrompt(topic, level = "college") {
  return `Explain the topic "${topic}" in EXTREMELY DETAILED words for a ${level} student.

Provide:
- A detailed definition (100+ words)
- Clear analogies and real-world examples
- Historical background
- Key concepts and relationships
- Practical applications
- Common misconceptions
- 5 practice questions with complete answers

Use structured headings and clean formatting.`;
}

function buildSummarizePrompt(notes) {
  return `Summarize the following notes into:

1) A detailed 400–500 word structured summary.
2) 3 concise bullet takeaways at the end.

Use bold formatting for important terms.

Notes:
${notes}`;
}

function buildQuizPrompt(source, count = 5) {
  return `Create exactly ${count} multiple-choice questions based on the following content.

STRICT FORMAT:

Q[number]: Question text
A) Option A
B) Option B
C) Option C
D) Option D
Correct Answer: A/B/C/D
Detailed Explanation: 150+ word explanation

IMPORTANT:
- Provide ONLY 4 options.
- Do NOT include explanations for incorrect options separately.
- Do NOT add extra commentary.

Content:
${source}`;
}

/* ================= GROQ API CALL ================= */

async function callAI(prompt) {
  const postData = JSON.stringify({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are a professional educational tutor who explains concepts clearly, deeply, and structurally.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2500,
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.groq.com",
      path: "/openai/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode !== 200) {
          console.error("Groq API Error:", res.statusCode, data);
          return reject(
            new Error(`Groq API error: ${res.statusCode}`)
          );
        }

        try {
          const parsed = JSON.parse(data);
          const text =
            parsed.choices?.[0]?.message?.content || "";

          if (!text) {
            return reject(
              new Error("No content returned from Groq")
            );
          }

          resolve(text);
        } catch (err) {
          reject(
            new Error(
              "Failed to parse Groq response: " + err.message
            )
          );
        }
      });
    });

    req.on("error", (err) => {
      console.error("Request Error:", err);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

/* ================= ROUTES ================= */

app.get("/", (req, res) => {
  res.send("AI Study Buddy Backend Running 🚀");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    backend: "running",
    timestamp: new Date().toISOString(),
    hasGROQ_API_KEY: !!apiKey,
  });
});

/* ---------- EXPLAIN ---------- */

app.post("/api/explain", async (req, res) => {
  try {
    const { topic, level } = req.body;

    if (!topic) {
      return res.status(400).json({
        error: "Missing topic",
      });
    }

    const prompt = buildExplainPrompt(topic, level);
    const result = await callAI(prompt);

    res.json({ topic, result });
  } catch (err) {
    console.error("Explain Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ---------- SUMMARIZE ---------- */

app.post("/api/summarize", async (req, res) => {
  try {
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({
        error: "Missing notes",
      });
    }

    const prompt = buildSummarizePrompt(notes);
    const summary = await callAI(prompt);

    res.json({ summary });
  } catch (err) {
    console.error("Summarize Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ---------- QUIZ ---------- */

app.post("/api/quiz", async (req, res) => {
  try {
    const { source, count } = req.body;

    if (!source) {
      return res.status(400).json({
        error: "Missing source",
      });
    }

    const prompt = buildQuizPrompt(source, count || 5);
    const questions = await callAI(prompt);

    res.json({ questions });
  } catch (err) {
    console.error("Quiz Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ================= START SERVER ================= */

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
