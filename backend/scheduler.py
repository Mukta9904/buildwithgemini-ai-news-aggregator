from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz
import os
from dotenv import load_dotenv
from main import run_pipeline

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.local"))
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

def start_scheduler():
    print("Starting AI News Aggregator Cron Worker (APScheduler)...")
    print("Schedules set for: 07:00 AM and 19:45 (7:45 PM) every day.")

    tz = pytz.timezone("America/New_York")
    scheduler = BlockingScheduler(timezone=tz)

    def morning_run():
        print("[Cron Worker] Triggering morning run (7:00 AM)...")
        run_pipeline()

    def evening_run():
        print("[Cron Worker] Triggering evening run (7:45 PM)...")
        run_pipeline()

    # Run at 7:00 AM every day
    scheduler.add_job(morning_run, CronTrigger(hour=7, minute=0))

    # Run at 7:45 PM every day
    scheduler.add_job(evening_run, CronTrigger(hour=19, minute=45))

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        print("Worker stopped.")

if __name__ == "__main__":
    start_scheduler()
