require("dotenv").config();
const express = require("express");
const cors = require("cors");
const https = require("https");

const app = express();


app.use(cors({
  origin: "https://ai-study-buddyproject.netlify.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json({ limit: "200kb" }));


const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.error("GROQ_API_KEY missing");
}


async function callAI(prompt) {
  const postData = JSON.stringify({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.groq.com",
      path: "/openai/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Content-Length": Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", chunk => data += chunk);

      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.choices?.[0]?.message?.content || "");
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}


app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/explain", async (req, res) => {
  try {
    const result = await callAI(`Explain: ${req.body.topic}`);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/summarize", async (req, res) => {
  try {
    const summary = await callAI(`Summarize:\n${req.body.notes}`);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/quiz", async (req, res) => {
  try {
    const questions = await callAI(`Create 5 MCQs:\n${req.body.source}`);
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = app;
