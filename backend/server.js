require('dotenv').config();
const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5173;

// Debug: Check if API key is loaded
const apiKey = process.env.GROQ_API_KEY;
if (apiKey) {
	console.log('✓ GROQ_API_KEY loaded successfully');
} else {
	console.error('✗ ERROR: GROQ_API_KEY not found in .env file!');
	process.exit(1);
}

app.use(bodyParser.json({ limit: '200kb' }));

// Simple CORS middleware so frontend served from another origin can call APIs
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
	if (req.method === 'OPTIONS') return res.sendStatus(204);
	next();
});

function buildExplainPrompt(topic, level = 'college') {
	return `Explain the topic "${topic}" in EXTREMELY DETAILED words for a ${level} student. Provide a comprehensive explanation of at least 1000 words with:
- A detailed definition (100+ words)
- Multiple clear analogies and real-world examples
- Historical context or background
- Key concepts and their relationships
- Practical applications
- Common misconceptions and clarifications
- 5 detailed practice questions with complete answers (50+ words each)
Keep language clear, engaging, and comprehensive. Use proper formatting with sections.`;
}

function buildSummarizePrompt(notes, maxPoints = 5) {
	return `Summarize the following notes in a single, clear, and comprehensive summary of approximately 500 words. Provide:
- A focused 500-word summary covering the key points, important connections, and insights.
- 3 concise bullet takeaways (one line each) after the summary.

Make the summary informative, well-structured, and easy to understand. Use bold for important terms.

Notes:\n\n${notes}`;
}

function buildQuizPrompt(source, count = 5) {
	return `Create exactly ${count} VERY DETAILED multiple-choice questions (4 choices each) based on the following content or topic. 

For EACH question, provide in this exact format:
Q[number]: [Detailed question text]
A) [Choice A]
B) [Choice B]
C) [Choice C]
D) [Choice D]
Correct Answer: [A/B/C/D]
Detailed Explanation: [Comprehensive explanation of 150+ words explaining why this is correct, covering related concepts, common mistakes, and deeper understanding]
Why others are wrong: [Brief explanation of why each incorrect option is wrong]

Make questions progressively harder and cover different aspects of the topic.

Content:\n\n${source}`;
}

async function callAI(prompt) {
	const apiKey = process.env.GROQ_API_KEY;
	if (!apiKey) {
		throw new Error('GROQ_API_KEY not set in .env - check if .env file exists and has valid key');
	}

	const postData = JSON.stringify({
		model: 'llama-3.3-70b-versatile',
		messages: [
			{ role: 'system', content: 'You are a comprehensive educational tutor that explains concepts in great detail with examples, analogies, and deep understanding.' },
			{ role: 'user', content: prompt },
		],
		temperature: 0.7,
		max_tokens: 3000,
	});

	return new Promise((resolve, reject) => {
		const options = {
			hostname: 'api.groq.com',
			path: '/openai/v1/chat/completions',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${apiKey}`,
				'Content-Length': Buffer.byteLength(postData),
			},
		};

		const req = https.request(options, (res) => {
			let data = '';
			res.on('data', (chunk) => { data += chunk; });
			res.on('end', () => {
				if (res.statusCode !== 200) {
					console.error('AI API Error:', res.statusCode, data);
					reject(new Error(`AI API error: ${res.statusCode} ${data}`));
					return;
				}
				try {
					const parsed = JSON.parse(data);
					const text = parsed.choices?.[0]?.message?.content || '';
					if (!text) {
						reject(new Error('No text content in Groq response'));
						return;
					}
					resolve(text);
				} catch (err) {
					reject(new Error(`Failed to parse AI response: ${err.message}`));
				}
			});
		});

		req.on('error', (err) => {
			console.error('Request error:', err);
			reject(err);
		});

		req.write(postData);
		req.end();
	});
}

app.get('/', (req, res) => res.send('AI Study Buddy backend running'));

app.get('/api/health', (req, res) => {
	const hasApiKey = !!process.env.GROQ_API_KEY;
	res.json({
		status: 'ok',
		backend: 'running',
		timestamp: new Date().toISOString(),
		hasGROQ_API_KEY: hasApiKey,
		message: hasApiKey ? 'Backend ready' : 'WARNING: GROQ_API_KEY not configured'
	});
});

app.post('/api/explain', async (req, res) => {
	try {
		const { topic, level } = req.body;
		if (!topic) return res.status(400).json({ error: 'Missing topic' });
		const prompt = buildExplainPrompt(topic, level);
		const text = await callAI(prompt);
		res.json({ topic, result: text });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post('/api/summarize', async (req, res) => {
	try {
		const { notes, maxPoints } = req.body;
		if (!notes) return res.status(400).json({ error: 'Missing notes' });
		const prompt = buildSummarizePrompt(notes, maxPoints || 5);
		const text = await callAI(prompt);
		res.json({ summary: text });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.post('/api/quiz', async (req, res) => {
	try {
		const { source, count } = req.body;
		if (!source) return res.status(400).json({ error: 'Missing source (topic or notes)' });
		const prompt = buildQuizPrompt(source, count || 5);
		const text = await callAI(prompt);
		res.json({ questions: text });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));

