import os
import re
from google import genai

def summarize_articles(articles):
    if not articles:
        return "<h2>No new articles found in the last 24 hours.</h2>"
    
    # Check if API key is set
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "<h2>Error: GEMINI_API_KEY not found in environment variables.</h2>"

    client = genai.Client(api_key=api_key)
    
    articles_text = ""
    for idx, a in enumerate(articles):
        articles_text += f"\n[{idx + 1}] Title: {a['title']}\n"
        articles_text += f"Source: {a['source']}\n"
        articles_text += f"Date: {a['pubDate']}\n"
        articles_text += f"Link: {a['link']}\n"
        articles_text += f"Snippet: {a['contentSnippet']}\n\n"
        
    prompt = f"""
    You are an expert AI software engineer and technical editor. Your job is to curate a daily digest for a Full Stack GenAI Developer.
    The digest should take about 10-15 minutes to read and provide high value.

    Below is a list of articles fetched from top AI sources in the last 24 hours.

    <articles>
    {articles_text}
    </articles>

    Instructions:
    1. Filter out noise, marketing fluff, or low-value posts.
    2. Select the top 5 to 8 most important articles related to:
       - Generative AI & Foundation Models
       - Retrieval-Augmented Generation (RAG)
       - Agentic AI Architecture
       - Model Context Protocol (MCP)
       - LLM Fine-tuning
    3. Write a compelling HTML email newsletter. Use standard HTML tags (<h2>, <h3>, <p>, <ul>, <li>, <a>) for structure.
    4. Start with a brief 1-paragraph overview of the day's trends.
    5. For each selected article, provide a 2-3 sentence technical summary of *why* this matters to a developer, and include a clickable link to the source.
    6. Group the articles by category if applicable (e.g., "Foundational Models", "Agentic Frameworks").
    7. Ensure the tone is highly technical, concise, and professional.

    Output ONLY valid HTML content, ready to be embedded into the body of an email. Do not include markdown code block syntax (like ```html or backticks).
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-pro',
            contents=prompt,
        )
        
        text = response.text or ""
        # Strip markdown formatting if the model still outputs it
        text = re.sub(r'^```html\n?', '', text)
        text = re.sub(r'\n?```$', '', text)
        return text.strip()
    except Exception as e:
        print(f"Error generating summary with Gemini: {e}")
        return "<h2>Error generating summary</h2><p>Could not reach Gemini API. Please check your API key.</p>"
