import { CollectedArticle } from './collector';
import { logger } from '../utils/logger';

interface RankedArticle extends CollectedArticle {
  score: number;
}

// Keywords that indicate higher importance
const importanceKeywords: Record<string, number> = {
  // Hebrew keywords
  'בנק ישראל': 3,
  'ריבית': 2,
  'תקציב': 2,
  'ממשלה': 2,
  'כנסת': 2,
  'צה"ל': 3,
  'ביטחון': 2,
  'מלחמה': 3,
  'פיגוע': 3,
  'טילים': 3,
  'גיוס': 2,
  'הייטק': 2,
  'סטארטאפ': 2,
  'AI': 2,
  'בינה מלאכותית': 2,
  'נדל"ן': 2,
  'מחירי דירות': 2,
  'אינפלציה': 2,
  'שוק ההון': 2,
  'בורסה': 1,
  // English keywords
  'breaking': 3,
  'urgent': 3,
  'exclusive': 2,
  'israel': 1,
  'middle east': 2,
  'artificial intelligence': 2,
  'startup': 1,
  'funding': 1,
};

// Source reputation scores
const sourceScores: Record<string, number> = {
  'Ynet': 2,
  'Haaretz': 2,
  'Calcalist': 2,
  'Globes': 2,
  'Walla': 1,
  'Kan News': 2,
  'Geektime': 1,
  'TechCrunch': 2,
  'People & Computers': 1,
  'Reuters World': 3,
  'BBC News': 3,
};

export function rankArticles(articles: CollectedArticle[]): RankedArticle[] {
  logger.info(`Ranking ${articles.length} articles`);

  const ranked: RankedArticle[] = articles.map((article) => {
    let score = 5; // Base score

    // Keyword analysis
    const text = `${article.title} ${article.content}`.toLowerCase();
    for (const [keyword, weight] of Object.entries(importanceKeywords)) {
      if (text.includes(keyword.toLowerCase())) {
        score += weight;
      }
    }

    // Source reputation
    const sourceScore = sourceScores[article.sourceName] || 1;
    score += sourceScore;

    // Recency bonus (articles from last 6 hours get a boost)
    try {
      const age = Date.now() - new Date(article.pubDate).getTime();
      if (age < 6 * 60 * 60 * 1000) score += 2;
      else if (age < 12 * 60 * 60 * 1000) score += 1;
    } catch {
      // ignore
    }

    // Content length bonus (longer content tends to be more substantial)
    if (article.content.length > 500) score += 1;
    if (article.content.length > 1000) score += 1;

    // Clamp to 1-10
    score = Math.min(10, Math.max(1, score));

    return { ...article, score };
  });

  // Sort by score descending
  ranked.sort((a, b) => b.score - a.score);

  logger.info(`Ranking complete. Top score: ${ranked[0]?.score || 0}`);
  return ranked;
}
