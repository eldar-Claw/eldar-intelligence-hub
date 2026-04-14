export interface Report {
  id: number;
  date: string;
  executiveSummary: string;
  trends: string;
  conclusion: string;
  watchNext24h: string;
  createdAt: string;
  newsItems?: NewsItem[];
}

export interface NewsItem {
  id: number;
  reportId: number;
  type: 'news' | 'content';
  category: Category;
  title: string;
  summary: string;
  whyItMatters: string;
  implications: string;
  importance: number;
  sourceUrl: string;
  sourceName: string;
  authorName: string | null;
  publishedAt: string;
  createdAt: string;
}

export type Category = 'economy' | 'politics' | 'society' | 'military' | 'technology';

export interface Source {
  id: number;
  name: string;
  url: string;
  type: 'rss' | 'blog' | 'news';
  category: string;
  enabled: number;
  lastFetchedAt: string | null;
  errorCount: number;
  status: 'active' | 'error' | 'disabled';
}

export interface Trend {
  title: string;
  description: string;
  direction: 'up' | 'down' | 'stable';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
