import { Router, Request, Response } from 'express';
import { db } from '../db/client';
import { settings } from '../db/schema';
import { eq } from 'drizzle-orm';
import { restartScheduler } from '../services/scheduler';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/settings — get all settings
router.get('/', (req: Request, res: Response) => {
  try {
    const data = db.select().from(settings).all();
    const result: Record<string, string> = {};
    for (const s of data) {
      result[s.key] = s.value;
    }
    res.json(result);
  } catch (error) {
    logger.error('Failed to get settings', String(error));
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// PUT /api/settings — update settings
router.put('/', (req: Request, res: Response) => {
  try {
    const updates = req.body as Record<string, string>;

    for (const [key, value] of Object.entries(updates)) {
      const existing = db.select().from(settings).where(eq(settings.key, key)).get();
      if (existing) {
        db.update(settings).set({ value }).where(eq(settings.key, key)).run();
      } else {
        db.insert(settings).values({ key, value }).run();
      }
    }

    // Restart scheduler if schedule_time changed
    if (updates.schedule_time) {
      restartScheduler();
    }

    const allSettings = db.select().from(settings).all();
    const result: Record<string, string> = {};
    for (const s of allSettings) {
      result[s.key] = s.value;
    }

    logger.info('Settings updated');
    res.json(result);
  } catch (error) {
    logger.error('Failed to update settings', String(error));
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
