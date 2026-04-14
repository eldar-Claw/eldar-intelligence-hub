import { Router, Request, Response } from 'express';
import { db } from '../db/client';
import { logs } from '../db/schema';
import { desc, eq, sql } from 'drizzle-orm';

const router = Router();

// GET /api/logs — get logs (paginated, filterable by level)
router.get('/', (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const level = req.query.level as string | undefined;
    const offset = (page - 1) * limit;

    let query = db.select().from(logs);

    if (level && ['info', 'warn', 'error'].includes(level)) {
      const data = db.select().from(logs)
        .where(eq(logs.level, level))
        .orderBy(desc(logs.createdAt))
        .limit(limit)
        .offset(offset)
        .all();

      const totalResult = db.select({ count: sql<number>`count(*)` }).from(logs)
        .where(eq(logs.level, level))
        .get();

      res.json({ data, total: totalResult?.count || 0, page, limit });
    } else {
      const data = db.select().from(logs)
        .orderBy(desc(logs.createdAt))
        .limit(limit)
        .offset(offset)
        .all();

      const totalResult = db.select({ count: sql<number>`count(*)` }).from(logs).get();

      res.json({ data, total: totalResult?.count || 0, page, limit });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

export default router;
