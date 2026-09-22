import feedparser
from datetime import datetime, timedelta, timezone

SOURCES = [
    {"name": "Hugging Face Blog", "url": "https://huggingface.co/blog/feed.xml"},
    {"name": "Anthropic", "url": "https://www.anthropic.com/feed.xml"},
    {"name": "OpenAI", "url": "https://openai.com/blog/rss.xml"},
    {"name": "Mistral AI", "url": "https://mistral.ai/news/feed.xml"},
    {"name": "Google DeepMind", "url": "https://deepmind.google/blog/rss.xml"},
    {"name": "LangChain Blog", "url": "https://blog.langchain.dev/rss/"},
    {"name": "LlamaIndex", "url": "https://llamaindex.ai/blog/rss"},
    {"name": "Weaviate", "url": "https://weaviate.io/blog/rss.xml"},
    {"name": "Qdrant", "url": "https://qdrant.tech/articles/rss.xml"},
    {"name": "AutoGen Releases", "url": "https://github.com/microsoft/autogen/releases.atom"},
    {"name": "CrewAI Releases", "url": "https://github.com/joaomdmoura/crewAI/releases.atom"},
    {"name": "MCP Spec Releases", "url": "https://github.com/modelcontextprotocol/specification/releases.atom"},
    {"name": "Baseten", "url": "https://www.baseten.co/blog/rss.xml"},
    {"name": "Predibase", "url": "https://predibase.com/blog/rss.xml"},
    {"name": "Anyscale", "url": "https://www.anyscale.com/blog/rss.xml"},
    {"name": "Unsloth Releases", "url": "https://github.com/unslothai/unsloth/releases.atom"}
]

def fetch_all_feeds():
    all_articles = []
    # Fetch only articles from the last 24 hours
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    
    for source in SOURCES:
        try:
            feed = feedparser.parse(source['url'])
            for entry in feed.entries:
                pub_date = None
                
                if hasattr(entry, 'published_parsed') and entry.published_parsed:
                    pub_date = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                    pub_date = datetime(*entry.updated_parsed[:6], tzinfo=timezone.utc)
                
                if pub_date and pub_date >= yesterday:
                    all_articles.append({
                        "title": entry.get("title", "Untitled"),
                        "link": entry.get("link", ""),
                        "pubDate": pub_date.isoformat(),
                        "source": source["name"],
                        "contentSnippet": entry.get("summary", entry.get("title", ""))
                    })
        except Exception as e:
            print(f"Failed to fetch RSS feed from {source['name']}: {e}")
            
    # Sort by newest first
    all_articles.sort(key=lambda x: x['pubDate'], reverse=True)
    return all_articles
