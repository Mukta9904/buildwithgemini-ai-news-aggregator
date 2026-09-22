import { GoogleGenAI } from '@google/genai';
import { Article } from './fetcher';

// Initialize the Google Gen AI SDK
// It will automatically use the GEMINI_API_KEY environment variable
const ai = new GoogleGenAI({});

export async function summarizeArticles(articles: Article[]): Promise<string> {
  if (articles.length === 0) {
    return '<h2>No new articles found in the last 24 hours.</h2>';
  }

  // Convert articles to a formatted string for the prompt
  const articlesText = articles.map((a, index) => `
    [${index + 1}] Title: ${a.title}
    Source: ${a.source}
    Date: ${a.pubDate}
    Link: ${a.link}
    Snippet: ${a.contentSnippet}
  `).join('\n\n');

  const prompt = `
    You are an expert AI software engineer and technical editor. Your job is to curate a daily digest for a Full Stack GenAI Developer.
    The digest should take about 10-15 minutes to read and provide high value.

    Below is a list of articles fetched from top AI sources in the last 24 hours.

    <articles>
    ${articlesText}
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

    Output ONLY valid HTML content, ready to be embedded into the body of an email. Do not include \`\`\`html or backticks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    let text = response.text || '';
    // Strip markdown formatting if the model still outputs it
    text = text.replace('\\x60\\x60\\x60html', '').replace('\\x60\\x60\\x60', '').trim();
    
    return text;
  } catch (error) {
    console.error('Error generating summary with Gemini:', error);
    return '<h2>Error generating summary</h2><p>Could not reach Gemini API. Please check your API key.</p>';
  }
}
