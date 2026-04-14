import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const reports = sqliteTable('reports', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull().unique(),
  executiveSummary: text('executive_summary').notNull(),
  trends: text('trends').notNull(),
  conclusion: text('conclusion').notNull(),
  watchNext24h: text('watch_next_24h').notNull(),
  createdAt: text('created_at').notNull(),
});

export const newsItems = sqliteTable('news_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  reportId: integer('report_id').notNull().references(() => reports.id),
  type: text('type').notNull(),
  category: text('category').notNull(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  whyItMatters: text('why_it_matters').notNull(),
  implications: text('implications').notNull(),
  importance: integer('importance').notNull(),
  sourceUrl: text('source_url').notNull(),
  sourceName: text('source_name').notNull(),
  authorName: text('author_name'),
  publishedAt: text('published_at').notNull(),
  createdAt: text('created_at').notNull(),
});

export const sources = sqliteTable('sources', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  url: text('url').notNull(),
  type: text('type').notNull(),
  category: text('category').notNull(),
  enabled: integer('enabled').notNull().default(1),
  lastFetchedAt: text('last_fetched_at'),
  errorCount: integer('error_count').notNull().default(0),
  status: text('status').notNull().default('active'),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const logs = sqliteTable('logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  level: text('level').notNull(),
  message: text('message').notNull(),
  details: text('details'),
  createdAt: text('created_at').notNull(),
});
