import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from datetime import datetime

def send_digest_email(target_email: str, html_content: str) -> bool:
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port_str = os.getenv("SMTP_PORT", "587")
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    from_email = os.getenv("FROM_EMAIL", smtp_user)

    if not all([smtp_host, smtp_user, smtp_pass, target_email]):
        print("Error: Missing SMTP configuration or target email.")
        return False

    try:
        smtp_port = int(smtp_port_str)
    except ValueError:
        smtp_port = 587

    date_str = datetime.now().strftime("%A, %B %d, %Y")
    
    full_html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333;">
        <h1 style="color: #2563eb; text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">AI Daily Digest</h1>
        {html_content}
        <div style="margin-top: 40px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            Generated automatically by your AI News Aggregator on {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
        </div>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Your AI Daily Digest - {date_str}"
    msg["From"] = f"AI News Aggregator <{from_email}>"
    msg["To"] = target_email

    msg.attach(MIMEText(full_html, "html"))

    try:
        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_host, smtp_port)
        else:
            server = smtplib.SMTP(smtp_host, smtp_port)
            server.starttls()
            
        server.login(smtp_user, smtp_pass)
        server.sendmail(from_email, target_email, msg.as_string())
        server.quit()
        print("Email sent successfully.")
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
