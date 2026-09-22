import { fetchAllFeeds } from './fetcher';
import { summarizeArticles } from './ai';
import { sendDigestEmail } from './mailer';
import { getSetting, saveDigest } from './db';

export async function runPipeline(): Promise<{ success: boolean; message: string }> {
  console.log('Starting AI News Aggregator Pipeline...');
  
  try {
    const targetEmail = await getSetting('target_email');
    if (!targetEmail) {
      console.warn('Pipeline aborted: target_email is not configured.');
      return { success: false, message: 'Target email is not configured.' };
    }

    console.log('Fetching articles from RSS feeds...');
    const articles = await fetchAllFeeds();
    
    if (articles.length === 0) {
      console.log('No articles found in the last 24 hours. Saving empty digest.');
      await saveDigest('No articles found.', 'skipped');
      return { success: true, message: 'No articles found in the last 24 hours.' };
    }

    console.log(`Found ${articles.length} articles. Summarizing with Gemini...`);
    const htmlContent = await summarizeArticles(articles);

    console.log(`Sending email to ${targetEmail}...`);
    const emailSent = await sendDigestEmail(targetEmail, htmlContent);

    if (emailSent) {
      console.log('Email sent successfully. Saving to database...');
      await saveDigest(htmlContent, 'sent');
      return { success: true, message: 'Pipeline executed and email sent successfully.' };
    } else {
      console.error('Failed to send email.');
      await saveDigest(htmlContent, 'failed');
      return { success: false, message: 'Failed to send email. Check SMTP settings.' };
    }
  } catch (error) {
    console.error('Pipeline error:', error);
    return { success: false, message: 'Pipeline failed due to an internal error.' };
  }
}
