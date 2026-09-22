import Parser from 'rss-parser';

type CustomFeed = { title: string };
type CustomItem = { title: string, link: string, pubDate: string, contentSnippet: string, categories?: string[] };

const parser = new Parser<CustomFeed, CustomItem>();

export interface Article {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  contentSnippet: string;
}

const SOURCES = [
  // Generative AI
  { name: 'Hugging Face Blog', url: 'https://huggingface.co/blog/feed.xml' },
  { name: 'Anthropic', url: 'https://www.anthropic.com/feed.xml' },
  { name: 'OpenAI', url: 'https://openai.com/blog/rss.xml' },
  { name: 'Mistral AI', url: 'https://mistral.ai/news/feed.xml' },
  { name: 'Google DeepMind', url: 'https://deepmind.google/blog/rss.xml' },
  // RAG & Vector DBs
  { name: 'LangChain Blog', url: 'https://blog.langchain.dev/rss/' },
  { name: 'LlamaIndex', url: 'https://llamaindex.ai/blog/rss' },
  { name: 'Weaviate', url: 'https://weaviate.io/blog/rss.xml' },
  { name: 'Qdrant', url: 'https://qdrant.tech/articles/rss.xml' },
  // Agentic AI & MCP
  { name: 'AutoGen Releases', url: 'https://github.com/microsoft/autogen/releases.atom' },
  { name: 'CrewAI Releases', url: 'https://github.com/joaomdmoura/crewAI/releases.atom' },
  { name: 'MCP Spec Releases', url: 'https://github.com/modelcontextprotocol/specification/releases.atom' },
  // Fine-Tuning
  { name: 'Baseten', url: 'https://www.baseten.co/blog/rss.xml' },
  { name: 'Predibase', url: 'https://predibase.com/blog/rss.xml' },
  { name: 'Anyscale', url: 'https://www.anyscale.com/blog/rss.xml' },
  { name: 'Unsloth Releases', url: 'https://github.com/unslothai/unsloth/releases.atom' }
];

export async function fetchAllFeeds(): Promise<Article[]> {
  const allArticles: Article[] = [];
  
  // Fetch only articles from the last 24 hours
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const fetchPromises = SOURCES.map(async (source) => {
    try {
      const feed = await parser.parseURL(source.url);
      const recentItems = feed.items.filter(item => {
        if (!item.pubDate) return false;
        const pubDate = new Date(item.pubDate);
        return pubDate >= yesterday;
      });

      recentItems.forEach(item => {
        allArticles.push({
          title: item.title || 'Untitled',
          link: item.link || '',
          pubDate: item.pubDate || new Date().toISOString(),
          source: source.name,
          contentSnippet: item.contentSnippet || item.title || '',
        });
      });
    } catch (error) {
      console.error(`Failed to fetch RSS feed from ${source.name}:`, error);
    }
  });

  await Promise.allSettled(fetchPromises);
  
  // Sort by newest first
  return allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}
