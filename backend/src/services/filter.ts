import { CollectedArticle } from './collector';
import { logger } from '../utils/logger';

export function filterArticles(articles: CollectedArticle[]): CollectedArticle[] {
  logger.info(`Filtering ${articles.length} articles`);

  // Remove duplicates by URL
  const seen = new Set<string>();
  let filtered = articles.filter((article) => {
    if (seen.has(article.link)) return false;
    seen.add(article.link);
    return true;
  });

  // Remove articles with empty titles or very short content
  filtered = filtered.filter((article) => {
    return article.title.length > 5 && article.link.length > 0;
  });

  // Remove articles older than 48 hours
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  filtered = filtered.filter((article) => {
    try {
      const pubDate = new Date(article.pubDate).getTime();
      return pubDate > cutoff;
    } catch {
      return true; // Keep if date parsing fails
    }
  });

  // Sort by date, newest first
  filtered.sort((a, b) => {
    try {
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    } catch {
      return 0;
    }
  });

  logger.info(`After filtering: ${filtered.length} articles remain`);
  return filtered;
}
