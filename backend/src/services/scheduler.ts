import cron from 'node-cron';
import { db } from '../db/client';
import { settings } from '../db/schema';
import { eq } from 'drizzle-orm';
import { generateReport } from './reportGenerator';
import { logger } from '../utils/logger';

let currentJob: cron.ScheduledTask | null = null;

function getScheduleTime(): string {
  const setting = db.select().from(settings).where(eq(settings.key, 'schedule_time')).get();
  return setting?.value || process.env.SCHEDULE_TIME || '07:00';
}

function timeToCron(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  return `${minutes} ${hours} * * *`;
}

export function startScheduler(): void {
  const scheduleTime = getScheduleTime();
  const cronExpression = timeToCron(scheduleTime);

  if (currentJob) {
    currentJob.stop();
  }

  logger.info(`Starting scheduler: daily report at ${scheduleTime} (cron: ${cronExpression})`);

  currentJob = cron.schedule(cronExpression, async () => {
    logger.info('Scheduled report generation triggered');
    try {
      const reportId = await generateReport();
      logger.info(`Scheduled report generated successfully (id: ${reportId})`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Scheduled report generation failed: ${errorMsg}`);
    }
  }, {
    timezone: process.env.TIMEZONE || 'Asia/Jerusalem',
  });

  logger.info('Scheduler started');
}

export function restartScheduler(): void {
  logger.info('Restarting scheduler with updated settings');
  startScheduler();
}

export function stopScheduler(): void {
  if (currentJob) {
    currentJob.stop();
    currentJob = null;
    logger.info('Scheduler stopped');
  }
}
