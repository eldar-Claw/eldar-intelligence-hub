import OpenAI from 'openai';
import { CollectedArticle } from './collector';
import { logger } from '../utils/logger';

interface SummarizedItem {
  type: 'news' | 'content';
  category: 'economy' | 'politics' | 'society' | 'military' | 'technology';
  title: string;
  summary: string;
  whyItMatters: string;
  implications: string;
  importance: number;
  sourceUrl: string;
  sourceName: string;
  authorName: string | null;
  publishedAt: string;
}

interface SummarizedReport {
  executiveSummary: string;
  trends: Array<{ title: string; description: string; direction: 'up' | 'down' | 'stable' }>;
  conclusion: string;
  watchNext24h: string;
  items: SummarizedItem[];
}

const SYSTEM_PROMPT = `אתה מנתח מודיעין עסקי וחדשותי בכיר. תפקידך לנתח מאמרים ולהפיק דו"ח מודיעין יומי עבור מנהל בכיר בישראל.

כללים:
1. כתוב בעברית מקצועית ותמציתית — סגנון ניהולי
2. בחר את 10 החדשות החשובות ביותר ו-5 פריטי תוכן מקצועי
3. סווג כל פריט לקטגוריה: economy, politics, society, military, technology
4. דרג חשיבות 1-10
5. לכל פריט: כותרת, סיכום (3-5 שורות), למה זה חשוב, השלכות
6. כתוב סיכום מנהלים (5-7 שורות)
7. זהה 3 מגמות מאקרו
8. כתוב מסקנה ניהולית
9. ציין מה לעקוב אחריו ב-24 שעות הקרובות

החזר JSON תקין בלבד.`;

const USER_PROMPT_TEMPLATE = `נתח את המאמרים הבאים והפק דו"ח מודיעין יומי:

{articles}

החזר JSON במבנה הבא:
{
  "executiveSummary": "סיכום מנהלים בעברית",
  "trends": [
    {"title": "כותרת מגמה", "description": "תיאור", "direction": "up|down|stable"}
  ],
  "conclusion": "מסקנה ניהולית",
  "watchNext24h": "מה לעקוב אחריו",
  "items": [
    {
      "type": "news|content",
      "category": "economy|politics|society|military|technology",
      "title": "כותרת בעברית",
      "summary": "סיכום 3-5 שורות",
      "whyItMatters": "למה זה חשוב",
      "implications": "השלכות",
      "importance": 8,
      "sourceUrl": "URL",
      "sourceName": "שם מקור",
      "authorName": null,
      "publishedAt": "ISO date"
    }
  ]
}`;

export async function summarizeArticles(
  articles: Array<CollectedArticle & { score: number }>
): Promise<SummarizedReport> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'sk-your-key-here') {
    logger.warn('No OpenAI API key configured. Using basic summarization.');
    return basicSummarize(articles);
  }

  try {
    const openai = new OpenAI({ apiKey });

    // Prepare articles for the prompt (limit to top 30)
    const topArticles = articles.slice(0, 30);
    const articlesText = topArticles
      .map((a, i) => `[${i + 1}] ${a.sourceName} (${a.sourceCategory}) — Score: ${a.score}\nTitle: ${a.title}\nURL: ${a.link}\nDate: ${a.pubDate}\nContent: ${a.content.substring(0, 500)}`)
      .join('\n\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: USER_PROMPT_TEMPLATE.replace('{articles}', articlesText) },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');

    const result = JSON.parse(content) as SummarizedReport;
    logger.info('Successfully summarized articles with OpenAI');
    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`OpenAI summarization failed: ${errorMsg}`);
    return basicSummarize(articles);
  }
}

// Fallback summarization without AI
function basicSummarize(
  articles: Array<CollectedArticle & { score: number }>
): SummarizedReport {
  logger.info('Using basic summarization (no AI)');

  const categoryMap: Record<string, 'economy' | 'politics' | 'society' | 'military' | 'technology'> = {
    economy: 'economy',
    politics: 'politics',
    society: 'society',
    military: 'military',
    technology: 'technology',
    news: 'politics',
    blog: 'technology',
  };

  const newsArticles = articles.slice(0, 10);
  const contentArticles = articles.slice(10, 15);

  const items: SummarizedItem[] = [
    ...newsArticles.map((a) => ({
      type: 'news' as const,
      category: categoryMap[a.sourceCategory] || 'politics',
      title: a.title,
      summary: a.content.substring(0, 300) || a.title,
      whyItMatters: 'פריט חדשותי חשוב מהיום',
      implications: 'יש לעקוב אחר ההתפתחויות',
      importance: a.score,
      sourceUrl: a.link,
      sourceName: a.sourceName,
      authorName: null,
      publishedAt: a.pubDate,
    })),
    ...contentArticles.map((a) => ({
      type: 'content' as const,
      category: categoryMap[a.sourceCategory] || 'technology',
      title: a.title,
      summary: a.content.substring(0, 300) || a.title,
      whyItMatters: 'תוכן מקצועי רלוונטי',
      implications: 'מומלץ לקריאה מעמיקה',
      importance: a.score,
      sourceUrl: a.link,
      sourceName: a.sourceName,
      authorName: null,
      publishedAt: a.pubDate,
    })),
  ];

  return {
    executiveSummary: `דו"ח מודיעין יומי — נאספו ${articles.length} פריטים מכל המקורות. הדו"ח כולל ${newsArticles.length} חדשות ו-${contentArticles.length} פריטי תוכן מקצועי.`,
    trends: [
      { title: 'מגמה 1', description: 'מגמה שזוהתה מתוך החדשות היומיות', direction: 'stable' },
      { title: 'מגמה 2', description: 'מגמה נוספת שזוהתה', direction: 'up' },
      { title: 'מגמה 3', description: 'מגמה שלישית', direction: 'down' },
    ],
    conclusion: 'יש לעקוב אחר ההתפתחויות ולהעמיק בקריאה של הפריטים המסומנים כבעלי חשיבות גבוהה.',
    watchNext24h: 'המשך מעקב אחר ההתפתחויות החדשותיות העיקריות.',
    items,
  };
}
