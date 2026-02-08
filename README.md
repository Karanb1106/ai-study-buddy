# AI Study Buddy

A simple web app that uses AI to help students understand complex topics, summarize notes, and generate quizzes.

## Features

- **Explain**: Get a simple explanation of any topic with examples and practice questions
- **Summarize**: Turn long notes into concise bullet points
- **Generate Quiz**: Create multiple-choice quizzes from topics or notes
- **Adjustable Level**: Set reading level (Child, High-school, College)

## Quick Start

### Prerequisites
- Node.js 16+ installed
- OpenAI API key (get one at https://platform.openai.com/api-keys)

### 1. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file from .env.example
cp .env.example .env

# Edit .env and add your OpenAI API key
notepad .env
# Replace: your_openai_api_key_here with your actual key

# Start the server
npm start
# Server runs on http://localhost:5173
```

### 2. Frontend Setup

In a **new terminal**:

```bash
# Navigate to frontend folder
cd frontend

# Serve the static files
python -m http.server 3000
# or with Python 2: python -m SimpleHTTPServer 3000
# or with Node: npx serve
```

Then open **http://localhost:3000** in your browser.

## Usage

1. Enter a topic or paste notes in the input box
2. Choose a reading level (optional)
3. Click **Explain**, **Summarize**, or **Generate Quiz**
4. See results appear on the right side
5. Use **Copy** button to copy the text

## API Endpoints

All endpoints require `Content-Type: application/json` header.

### POST /api/explain
Explain a topic in simple words.
**Request:**
```json
{
  "topic": "Photosynthesis",
  "level": "high-school"
}
```
**Response:**
```json
{
  "topic": "Photosynthesis",
  "result": "..."
}
```

### POST /api/summarize
Summarize notes into key points.
**Request:**
```json
{
  "notes": "Your long notes here...",
  "maxPoints": 5
}
```
**Response:**
```json
{
  "summary": "..."
}
```

### POST /api/quiz
Generate multiple-choice questions.
**Request:**
```json
{
  "source": "Topic or notes",
  "count": 3
}
```
**Response:**
```json
{
  "questions": "..."
}
```

## Project Structure

```
AI-Study-Buddy/
├── backend/
│   ├── server.js          # Express server with API endpoints
│   ├── package.json       # Node.js dependencies
│   ├── .env.example       # Example environment variables
│   └── .env               # Your actual API key (don't commit!)
├── frontend/
│   ├── index.html         # Main page
│   ├── app.js             # Frontend logic
│   └── style.css          # Styles
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **AI**: OpenAI GPT-4o-mini API
- **Deployment**: Vercel (frontend), Render/Heroku (backend)

## Security

**Important**: Never commit `.env` file with your API key. Use `.gitignore` to exclude it.

The `.env.example` file shows the format without a real key.

## Troubleshooting

### "OPENAI_API_KEY not set in .env"
- Make sure `.env` file exists in the `backend/` folder
- Check the key starts with `sk-proj-` or `sk-`
- Restart the backend server after updating `.env`

### "Empty response from server (status 405)"
- Ensure backend is running on http://localhost:5173
- Check that frontend HTML structure is correct (no duplicate tags)
- Verify CORS is enabled (it should be by default)

### Frontend showing blank or not working
- Open browser developer tools (F12) and check Console tab
- Look for network errors in Network tab
- Ensure backend URL matches frontend fetch calls

## Next Steps

- Add a database to save favorite explanations
- Add dark mode toggle
- Deploy to cloud (Vercel + Render)
- Add more AI models (Claude, Gemini)
- Create a mobile app (React Native)

## License

MIT

## Support

For issues, check the logs in both terminals where backend and frontend run.
