# AI Daily Digest Aggregator

An automated, AI-powered daily news aggregator designed specifically for Full Stack GenAI Developers. It curates the most important news on Generative AI, RAG, Agentic Architectures, MCP, and LLM Fine-Tuning, summarizes them using Google Gemini 2.5 Pro, and delivers a concise 10-15 minute read to your inbox every day.

## Features

- 🧠 **AI-Powered Curation**: Uses Gemini 2.5 Pro to filter noise and summarize articles.
- 🌐 **High-Value Sources**: Pulls RSS feeds from top labs (OpenAI, Anthropic, DeepMind), framework repos (AutoGen, CrewAI, MCP), and technical blogs.
- ⏰ **Automated Scheduling**: Delivers digests automatically twice a day (7:00 AM and 7:45 PM).
- 🎨 **Premium Dashboard**: A Next.js web interface to configure your target email address, view past digests, and manually trigger the pipeline.
- 💾 **Local Storage**: Uses SQLite to persist settings and history without needing external database hosting.

## Prerequisites

Before running this project, you will need:
1. **Node.js** (v18 or higher)
2. A **Google Gemini API Key**. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).
3. **SMTP Credentials** to send emails. If you are using Gmail, you will need to generate an [App Password](https://support.google.com/accounts/answer/185833).

## Setup Instructions

1. **Clone the Repository**
   \`\`\`bash
   git clone https://github.com/Mukta9904/buildwithgemini-ai-news-aggregator.git
   cd buildwithgemini-ai-news-aggregator
   \`\`\`

2. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure Environment Variables**
   Rename `.env.example` to `.env.local` (or create a new `.env.local` file) and fill in your details:
   \`\`\`env
   GEMINI_API_KEY="your_gemini_api_key_here"

   # SMTP Settings
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your_email@gmail.com"
   SMTP_PASS="your_app_password"
   FROM_EMAIL="your_email@gmail.com"
   \`\`\`

## Running the Application

This application consists of two parts: the Web Dashboard and the Background Worker.

### 1. Start the Web Dashboard
This runs the Next.js frontend where you can configure the app.
\`\`\`bash
npm run dev
\`\`\`
- Open [http://localhost:3000](http://localhost:3000) in your browser.
- **IMPORTANT**: Enter your target email address in the dashboard and click "Save Settings". The pipeline will not run until an email is configured.
- You can click "Run Pipeline Now" to test the system immediately.

### 2. Start the Background Worker
This runs the cron jobs that automatically trigger the pipeline at 7:00 AM and 7:45 PM.
Open a new terminal window/tab in the project directory and run:
\`\`\`bash
npm run worker
\`\`\`
- Leave this terminal running in the background.

## Troubleshooting

- **No emails received?** Double-check your SMTP credentials in `.env.local`. If using Gmail, ensure 2-Step Verification is on and you are using a 16-character App Password, NOT your regular Google password.
- **Pipeline fails immediately?** Ensure you have opened the dashboard at least once and saved your target email address.
- **Error generating summary?** Verify your `GEMINI_API_KEY` is correct.

## Architecture

- **Frontend**: Next.js App Router with Vanilla CSS.
- **Backend**: Next.js API Routes.
- **Database**: SQLite via `sqlite3` and `sqlite` packages.
- **LLM SDK**: `@google/genai`
- **Email**: `nodemailer`
- **Background Worker**: `node-cron` executed via `tsx`
