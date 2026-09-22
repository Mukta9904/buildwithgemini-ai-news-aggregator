from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

from database import init_db, get_setting, update_setting, save_digest, get_latest_digests
from rss_fetcher import fetch_all_feeds
from ai_summarizer import summarize_articles
from mailer import send_digest_email

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.local"))
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

app = FastAPI(title="AI News Aggregator API")

# Initialize SQLite database
init_db()

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Default Vite ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SettingsUpdate(BaseModel):
    targetEmail: str

class TriggerRequest(BaseModel):
    token: str = ""

def run_pipeline() -> dict:
    print("Starting AI News Aggregator Pipeline...")
    try:
        target_email = get_setting('target_email')
        if not target_email:
            print("Pipeline aborted: target_email is not configured.")
            return {"success": False, "message": "Target email is not configured."}

        print("Fetching articles from RSS feeds...")
        articles = fetch_all_feeds()
        
        if not articles:
            print("No articles found in the last 24 hours. Saving empty digest.")
            save_digest("No articles found.", "skipped")
            return {"success": True, "message": "No articles found in the last 24 hours."}

        print(f"Found {len(articles)} articles. Summarizing with Gemini...")
        html_content = summarize_articles(articles)

        print(f"Sending email to {target_email}...")
        email_sent = send_digest_email(target_email, html_content)

        if email_sent:
            print("Email sent successfully. Saving to database...")
            save_digest(html_content, "sent")
            return {"success": True, "message": "Pipeline executed and email sent successfully."}
        else:
            print("Failed to send email.")
            save_digest(html_content, "failed")
            return {"success": False, "message": "Failed to send email. Check SMTP settings."}
    except Exception as e:
        print(f"Pipeline error: {e}")
        return {"success": False, "message": "Pipeline failed due to an internal error."}

@app.get("/api/settings")
def api_get_settings():
    try:
        target_email = get_setting('target_email')
        return {"targetEmail": target_email}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch settings")

@app.post("/api/settings")
def api_update_settings(data: SettingsUpdate):
    try:
        update_setting('target_email', data.targetEmail)
        return {"success": True, "targetEmail": data.targetEmail}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update settings")

@app.get("/api/digests")
def api_get_digests(limit: int = 10):
    try:
        digests = get_latest_digests(limit)
        return {"digests": digests}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch digests")

@app.post("/api/trigger")
def api_trigger_pipeline(data: TriggerRequest):
    expected_token = os.getenv("CRON_SECRET", "")
    if expected_token and data.token != expected_token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    result = run_pipeline()
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=500, detail=result["message"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
