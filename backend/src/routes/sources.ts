import { Router, Request, Response } from 'express';
import { db } from '../db/client';
import { sources } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/sources — list all sources
router.get('/', (req: Request, res: Response) => {
  try {
    const data = db.select().from(sources).all();
    res.json(data);
  } catch (error) {
    logger.error('Failed to list sources', String(error));
    res.status(500).json({ error: 'Failed to list sources' });
  }
});

// POST /api/sources — add source
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, url, type, category } = req.body;

    if (!name || !url || !type || !category) {
      res.status(400).json({ error: 'Missing required fields: name, url, type, category' });
      return;
    }

    const [source] = db.insert(sources).values({
      name,
      url,
      type,
      category,
      enabled: 1,
      errorCount: 0,
      status: 'active',
    }).returning().all();

    logger.info(`Source added: ${name}`);
    res.status(201).json(source);
  } catch (error) {
    logger.error('Failed to add source', String(error));
    res.status(500).json({ error: 'Failed to add source' });
  }
});

// PUT /api/sources/:id — update source
router.put('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const existing = db.select().from(sources).where(eq(sources.id, id)).get();

    if (!existing) {
      res.status(404).json({ error: 'Source not found' });
      return;
    }

    const updates: Record<string, any> = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.url !== undefined) updates.url = req.body.url;
    if (req.body.type !== undefined) updates.type = req.body.type;
    if (req.body.category !== undefined) updates.category = req.body.category;
    if (req.body.enabled !== undefined) updates.enabled = req.body.enabled;
    if (req.body.status !== undefined) updates.status = req.body.status;

    db.update(sources).set(updates).where(eq(sources.id, id)).run();

    const updated = db.select().from(sources).where(eq(sources.id, id)).get();
    logger.info(`Source updated: ${updated?.name}`);
    res.json(updated);
  } catch (error) {
    logger.error('Failed to update source', String(error));
    res.status(500).json({ error: 'Failed to update source' });
  }
});

// DELETE /api/sources/:id — remove source
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const existing = db.select().from(sources).where(eq(sources.id, id)).get();

    if (!existing) {
      res.status(404).json({ error: 'Source not found' });
      return;
    }

    db.delete(sources).where(eq(sources.id, id)).run();
    logger.info(`Source deleted: ${existing.name}`);
    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to delete source', String(error));
    res.status(500).json({ error: 'Failed to delete source' });
  }
});

export default router;
