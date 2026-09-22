# AI Daily Digest Aggregator

An automated, AI-powered daily news aggregator designed specifically for Full Stack GenAI Developers. It curates the most important news on Generative AI, RAG, Agentic Architectures, MCP, and LLM Fine-Tuning, summarizes them using Google Gemini 2.5 Pro (Free Tier), and delivers a concise 10-15 minute read to your inbox every day.

**Architecture**: React (Vite) Frontend + Python FastAPI Backend

## Features

- 🧠 **AI-Powered Curation**: Uses Gemini 2.5 Pro to filter noise and summarize articles.
- 🌐 **High-Value Sources**: Pulls RSS feeds from top labs (OpenAI, Anthropic, DeepMind), framework repos (AutoGen, CrewAI, MCP), and technical blogs.
- ⏰ **Automated Scheduling**: Delivers digests automatically twice a day (7:00 AM and 7:45 PM) via Python APScheduler.
- 🎨 **Premium Dashboard**: A React web interface to configure your target email address, view past digests, and manually trigger the pipeline.
- 💾 **Local Storage**: Uses SQLite to persist settings and history without needing external database hosting.

## Prerequisites

Before running this project, you will need:
1. **Node.js** (v18 or higher)
2. **Python 3.10+**
3. A **Google Gemini API Key**. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).
4. **SMTP Credentials** to send emails. If you are using Gmail, you will need to generate an [App Password](https://support.google.com/accounts/answer/185833).

## Setup Instructions

1. **Clone the Repository**
   \`\`\`bash
   git clone https://github.com/Mukta9904/buildwithgemini-ai-news-aggregator.git
   cd buildwithgemini-ai-news-aggregator
   \`\`\`

2. **Configure Environment Variables**
   Create a `.env` file inside the `backend/` directory:
   \`\`\`bash
   cd backend
   touch .env
   \`\`\`
   Fill it in with your details:
   \`\`\`env
   GEMINI_API_KEY="your_gemini_api_key_here"

   # SMTP Settings
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your_email@gmail.com"
   SMTP_PASS="your_app_password"
   FROM_EMAIL="your_email@gmail.com"
   \`\`\`

3. **Install & Run Backend (FastAPI)**
   \`\`\`bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   
   # Start the FastAPI server (Runs on port 8000)
   python main.py
   \`\`\`

4. **Start the Scheduler (Optional for manual testing, Required for automation)**
   In a separate terminal window, start the APScheduler script to run jobs automatically:
   \`\`\`bash
   cd backend
   source .venv/bin/activate
   python scheduler.py
   \`\`\`

5. **Install & Run Frontend (React/Vite)**
   In a new terminal window:
   \`\`\`bash
   cd frontend
   npm install
   npm run dev
   \`\`\`
   - Open [http://localhost:5173](http://localhost:5173) in your browser.
   - Enter your target email address in the dashboard and click "Save Settings".
   - You can click "Run Pipeline Now" to test the system immediately.

## Troubleshooting

- **No emails received?** Double-check your SMTP credentials in `backend/.env`. If using Gmail, ensure 2-Step Verification is on and you are using a 16-character App Password, NOT your regular Google password.
- **Pipeline fails immediately?** Ensure you have opened the dashboard at least once and saved your target email address.
- **Error generating summary?** Verify your `GEMINI_API_KEY` is correct.

## Architecture

- **Frontend**: React, TypeScript, Vite.
- **Backend**: Python FastAPI.
- **Database**: SQLite via Python `sqlite3`.
- **LLM SDK**: `google-genai` Python SDK.
- **Email**: Python `smtplib`.
- **Background Worker**: `APScheduler`.
