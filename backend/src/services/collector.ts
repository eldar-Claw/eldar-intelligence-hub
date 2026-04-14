import Parser from 'rss-parser';
import { db } from '../db/client';
import { sources } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'EldarIntelligenceHub/1.0',
  },
});

export interface CollectedArticle {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  sourceName: string;
  sourceCategory: string;
}

export async function collectFromSources(): Promise<CollectedArticle[]> {
  const enabledSources = db.select().from(sources).where(eq(sources.enabled, 1)).all();
  const articles: CollectedArticle[] = [];

  logger.info(`Starting collection from ${enabledSources.length} sources`);

  for (const source of enabledSources) {
    try {
      const feed = await parser.parseURL(source.url);
      const items = (feed.items || []).slice(0, 20);

      for (const item of items) {
        articles.push({
          title: item.title || 'Untitled',
          link: item.link || '',
          pubDate: item.pubDate || new Date().toISOString(),
          content: item.contentSnippet || item.content || '',
          sourceName: source.name,
          sourceCategory: source.category,
        });
      }

      db.update(sources)
        .set({
          lastFetchedAt: new Date().toISOString(),
          errorCount: 0,
          status: 'active',
        })
        .where(eq(sources.id, source.id))
        .run();

      logger.info(`Collected ${items.length} articles from ${source.name}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const newErrorCount = source.errorCount + 1;
      const newStatus = newErrorCount >= 3 ? 'error' : 'active';

      db.update(sources)
        .set({
          errorCount: newErrorCount,
          status: newStatus,
        })
        .where(eq(sources.id, source.id))
        .run();

      logger.error(`Failed to collect from ${source.name}: ${errorMsg}`);
    }
  }

  logger.info(`Total articles collected: ${articles.length}`);
  return articles;
}
