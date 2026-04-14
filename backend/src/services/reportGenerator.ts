import { db } from '../db/client';
import { reports, newsItems } from '../db/schema';
import { eq } from 'drizzle-orm';
import { collectFromSources } from './collector';
import { filterArticles } from './filter';
import { rankArticles } from './ranker';
import { summarizeArticles } from './summarizer';
import { sendReportEmail } from './emailer';
import { logger } from '../utils/logger';

export async function generateReport(): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  logger.info(`Starting report generation for ${today}`);

  // Check if report already exists for today
  const existing = db.select().from(reports).where(eq(reports.date, today)).get();
  if (existing) {
    logger.warn(`Report for ${today} already exists (id: ${existing.id}). Deleting and regenerating.`);
    db.delete(newsItems).where(eq(newsItems.reportId, existing.id)).run();
    db.delete(reports).where(eq(reports.id, existing.id)).run();
  }

  // Step 1: Collect articles from RSS feeds
  const rawArticles = await collectFromSources();

  if (rawArticles.length === 0) {
    logger.warn('No articles collected. Report will be empty.');
  }

  // Step 2: Filter duplicates and low quality
  const filtered = filterArticles(rawArticles);

  // Step 3: Rank by importance
  const ranked = rankArticles(filtered);

  // Step 4: Summarize with AI (or basic fallback)
  const summarized = await summarizeArticles(ranked);

  // Step 5: Store report in database
  const [report] = db.insert(reports).values({
    date: today,
    executiveSummary: summarized.executiveSummary,
    trends: JSON.stringify(summarized.trends),
    conclusion: summarized.conclusion,
    watchNext24h: summarized.watchNext24h,
    createdAt: now,
  }).returning().all();

  // Step 6: Store news items
  for (const item of summarized.items) {
    db.insert(newsItems).values({
      reportId: report.id,
      type: item.type,
      category: item.category,
      title: item.title,
      summary: item.summary,
      whyItMatters: item.whyItMatters,
      implications: item.implications,
      importance: item.importance,
      sourceUrl: item.sourceUrl,
      sourceName: item.sourceName,
      authorName: item.authorName || null,
      publishedAt: item.publishedAt || now,
      createdAt: now,
    }).run();
  }

  logger.info(`Report generated with ${summarized.items.length} items (id: ${report.id})`);

  // Step 7: Send email (non-blocking)
  try {
    await sendReportEmail(report.id);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Email sending failed: ${errorMsg}`);
  }

  return report.id;
}
