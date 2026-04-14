import { Router, Request, Response } from 'express';
import { db } from '../db/client';
import { reports, newsItems } from '../db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { generateReport } from '../services/reportGenerator';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/reports — list all reports (paginated)
router.get('/', (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const data = db.select().from(reports).orderBy(desc(reports.date)).limit(limit).offset(offset).all();
    const totalResult = db.select({ count: sql<number>`count(*)` }).from(reports).get();
    const total = totalResult?.count || 0;

    res.json({ data, total, page, limit });
  } catch (error) {
    logger.error('Failed to list reports', String(error));
    res.status(500).json({ error: 'Failed to list reports' });
  }
});

// GET /api/reports/latest — today's report
router.get('/latest', (req: Request, res: Response) => {
  try {
    const report = db.select().from(reports).orderBy(desc(reports.date)).limit(1).get();

    if (!report) {
      res.json(null);
      return;
    }

    const items = db.select().from(newsItems).where(eq(newsItems.reportId, report.id)).all();
    res.json({ ...report, newsItems: items });
  } catch (error) {
    logger.error('Failed to get latest report', String(error));
    res.status(500).json({ error: 'Failed to get latest report' });
  }
});

// GET /api/reports/:id — single report with news_items
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const report = db.select().from(reports).where(eq(reports.id, id)).get();

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    const items = db.select().from(newsItems).where(eq(newsItems.reportId, id)).all();
    res.json({ ...report, newsItems: items });
  } catch (error) {
    logger.error('Failed to get report', String(error));
    res.status(500).json({ error: 'Failed to get report' });
  }
});

// POST /api/reports/generate — trigger report generation
router.post('/generate', async (req: Request, res: Response) => {
  try {
    logger.info('Manual report generation triggered');
    const reportId = await generateReport();
    res.json({ success: true, reportId });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Report generation failed', errorMsg);
    res.status(500).json({ error: 'Report generation failed', details: errorMsg });
  }
});

export default router;
