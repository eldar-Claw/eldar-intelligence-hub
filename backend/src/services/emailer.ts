import nodemailer from 'nodemailer';
import { db } from '../db/client';
import { reports, newsItems, settings } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger';

function getSettingValue(key: string, fallback: string): string {
  const setting = db.select().from(settings).where(eq(settings.key, key)).get();
  return setting?.value || fallback;
}

export async function sendReportEmail(reportId: number): Promise<void> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const emailTo = getSettingValue('email_to', process.env.EMAIL_TO || '');

  if (!smtpHost || !smtpUser || !smtpPass || !emailTo) {
    logger.warn('Email not configured. Skipping email delivery.');
    return;
  }

  const report = db.select().from(reports).where(eq(reports.id, reportId)).get();
  if (!report) {
    logger.error(`Report ${reportId} not found for email`);
    return;
  }

  const items = db.select().from(newsItems).where(eq(newsItems.reportId, reportId)).all();
  const news = items.filter((i) => i.type === 'news');
  const content = items.filter((i) => i.type === 'content');

  let trends: Array<{ title: string; description: string; direction: string }> = [];
  try {
    trends = JSON.parse(report.trends);
  } catch {
    trends = [];
  }

  const directionEmoji = (d: string) => d === 'up' ? '📈' : d === 'down' ? '📉' : '➡️';

  const categoryColors: Record<string, string> = {
    economy: '#2b6cb0',
    politics: '#805ad5',
    society: '#d69e2e',
    military: '#c53030',
    technology: '#2f855a',
  };

  const importanceColor = (n: number) => n >= 8 ? '#e53e3e' : n >= 5 ? '#d69e2e' : '#38a169';

  const newsHtml = news.map((item) => `
    <tr>
      <td style="padding: 16px; border-bottom: 1px solid #e2e8f0;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="background: ${importanceColor(item.importance)}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">${item.importance}/10</span>
          <span style="background: ${categoryColors[item.category] || '#718096'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${item.category}</span>
        </div>
        <h3 style="margin: 0 0 8px 0; color: #1a202c; font-size: 16px;">${item.title}</h3>
        <p style="margin: 0 0 8px 0; color: #4a5568; font-size: 14px; line-height: 1.6;">${item.summary}</p>
        <p style="margin: 0 0 4px 0; color: #2b6cb0; font-size: 13px;"><strong>למה זה חשוב:</strong> ${item.whyItMatters}</p>
        <p style="margin: 0; color: #718096; font-size: 12px;">${item.sourceName} | <a href="${item.sourceUrl}" style="color: #2b6cb0;">קישור למקור</a></p>
      </td>
    </tr>
  `).join('');

  const contentHtml = content.map((item) => `
    <tr>
      <td style="padding: 16px; border-bottom: 1px solid #e2e8f0;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="background: ${importanceColor(item.importance)}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">${item.importance}/10</span>
          <span style="background: ${categoryColors[item.category] || '#718096'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${item.category}</span>
        </div>
        <h3 style="margin: 0 0 8px 0; color: #1a202c; font-size: 16px;">${item.title}</h3>
        ${item.authorName ? `<p style="margin: 0 0 4px 0; color: #718096; font-size: 12px;">✍️ ${item.authorName}</p>` : ''}
        <p style="margin: 0 0 8px 0; color: #4a5568; font-size: 14px; line-height: 1.6;">${item.summary}</p>
        <p style="margin: 0; color: #718096; font-size: 12px;">${item.sourceName} | <a href="${item.sourceUrl}" style="color: #2b6cb0;">קישור</a></p>
      </td>
    </tr>
  `).join('');

  const trendsHtml = trends.map((t) => `
    <div style="background: #f7fafc; padding: 12px 16px; border-radius: 8px; margin-bottom: 8px; border-right: 4px solid #2b6cb0;">
      <strong>${directionEmoji(t.direction)} ${t.title}</strong>
      <p style="margin: 4px 0 0 0; color: #4a5568; font-size: 14px;">${t.description}</p>
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head><meta charset="UTF-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f7fafc; margin: 0; padding: 20px; direction: rtl;">
      <div style="max-width: 700px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a365d, #2b6cb0); padding: 24px; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">📊 דו"ח מודיעין יומי</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">${report.date}</p>
        </div>

        <!-- Executive Summary -->
        <div style="padding: 24px; background: #ebf4ff; border-bottom: 1px solid #e2e8f0;">
          <h2 style="margin: 0 0 12px 0; color: #1a365d; font-size: 18px;">סיכום מנהלים</h2>
          <p style="margin: 0; color: #2d3748; font-size: 15px; line-height: 1.7;">${report.executiveSummary}</p>
        </div>

        <!-- News -->
        <div style="padding: 24px;">
          <h2 style="margin: 0 0 16px 0; color: #1a365d; font-size: 18px;">📰 חדשות מרכזיות</h2>
          <table style="width: 100%; border-collapse: collapse;">${newsHtml}</table>
        </div>

        <!-- Content -->
        <div style="padding: 24px; background: #f7fafc;">
          <h2 style="margin: 0 0 16px 0; color: #1a365d; font-size: 18px;">📚 תוכן מקצועי</h2>
          <table style="width: 100%; border-collapse: collapse;">${contentHtml}</table>
        </div>

        <!-- Trends -->
        <div style="padding: 24px;">
          <h2 style="margin: 0 0 16px 0; color: #1a365d; font-size: 18px;">📊 מגמות מאקרו</h2>
          ${trendsHtml}
        </div>

        <!-- Conclusion -->
        <div style="padding: 24px; background: #ebf4ff;">
          <h2 style="margin: 0 0 12px 0; color: #1a365d; font-size: 18px;">🎯 מסקנה ניהולית</h2>
          <p style="margin: 0 0 16px 0; color: #2d3748; font-size: 15px; line-height: 1.7;">${report.conclusion}</p>
          <h2 style="margin: 0 0 12px 0; color: #1a365d; font-size: 18px;">👁️ לעקוב ב-24 שעות</h2>
          <p style="margin: 0; color: #2d3748; font-size: 15px; line-height: 1.7;">${report.watchNext24h}</p>
        </div>

        <!-- Footer -->
        <div style="padding: 16px; text-align: center; color: #a0aec0; font-size: 12px; border-top: 1px solid #e2e8f0;">
          Eldar Intelligence Hub — Generated at ${new Date().toISOString()}
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: `"Eldar Intelligence Hub" <${smtpUser}>`,
    to: emailTo,
    subject: `📊 דו"ח מודיעין יומי — ${report.date}`,
    html,
  });

  logger.info(`Report email sent to ${emailTo}`);
}
