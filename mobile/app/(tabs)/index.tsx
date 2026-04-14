import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { colors, spacing } from '../../constants/theme';
import { Report, NewsItem, Trend } from '../../types';
import { getLatestReport } from '../../services/api';
import ExecutiveSummary from '../../components/ExecutiveSummary';
import ReportCard from '../../components/ReportCard';
import TrendCard from '../../components/TrendCard';
import SectionHeader from '../../components/SectionHeader';
import EmptyState from '../../components/EmptyState';

// Sample data for offline/demo mode
const SAMPLE_REPORT: Report = {
  id: 1,
  date: new Date().toISOString().split('T')[0],
  executiveSummary:
    'היום חלו התפתחויות משמעותיות בזירה הכלכלית והביטחונית. שוק ההון הישראלי רשם עליות חדות על רקע נתוני מאקרו חיוביים, בעוד שבזירה הביטחונית נמשכת פעילות צה"ל בגזרת הצפון. בתחום הטכנולוגיה, חברות AI ישראליות דיווחו על גיוסי ענק.',
  trends: JSON.stringify([
    { title: 'עליית מניות הטכנולוגיה', description: 'מגמת עלייה חדה במניות AI וסייבר ישראליות, עם גיוסים של מעל $500M ברבעון', direction: 'up' },
    { title: 'ירידה בריבית הצפויה', description: 'בנק ישראל צפוי להוריד ריבית ברבעון הבא על רקע ירידת האינפלציה', direction: 'down' },
    { title: 'יציבות גיאופוליטית שברירית', description: 'המצב הביטחוני בצפון נשאר מורכב אך מבוקר, עם מגעים דיפלומטיים פעילים', direction: 'stable' },
  ]),
  conclusion:
    'המצב הכלכלי מציג סימנים חיוביים עם צמיחה בסקטור הטכנולוגיה. יש להמשיך לעקוב אחר ההתפתחויות הביטחוניות ופעולות בנק ישראל.',
  watchNext24h:
    'פרסום נתוני אינפלציה חודשיים מחר ב-10:00 | ישיבת קבינט ביטחוני | פרסום דוחות רבעוניים של בנקים | כנס טכנולוגיה בתל אביב',
  createdAt: new Date().toISOString(),
  newsItems: [
    { id: 1, reportId: 1, type: 'news', category: 'economy', title: 'הבורסה בתל אביב רשמה עלייה של 2.3% - השיא מתחילת השנה', summary: 'מדד ת"א 35 עלה ב-2.3% היום, מונע על ידי מניות הטכנולוגיה והבנקאות. העליות הגיעו על רקע נתוני תעסוקה חיוביים ותחזית צמיחה מעודכנת של בנק ישראל.', whyItMatters: 'מדובר בשיא של המדד מתחילת 2026, מה שמצביע על אמון גובר של המשקיעים בכלכלה הישראלית.', implications: 'עלייה בתשואות קרנות הפנסיה, חיזוק השקל, ואפשרות להנפקות חדשות.', importance: 9, sourceUrl: 'https://www.globes.co.il', sourceName: 'גלובס', authorName: null, publishedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: 2, reportId: 1, type: 'news', category: 'military', title: 'צה"ל הרחיב פעילות בגזרת הצפון - תרגיל רחב היקף', summary: 'צה"ל פתח בתרגיל צבאי רחב היקף בגזרת הצפון, הכולל כוחות יבשה, אוויר וים. התרגיל נמשך שלושה ימים ומדמה תרחישי לחימה מורכבים.', whyItMatters: 'התרגיל נערך על רקע מתיחות מתמשכת בגבול הצפון ומעביר מסר הרתעתי.', implications: 'חיזוק המוכנות המבצעית, הגברת ההרתעה, ואפשרות להסלמה מדודה.', importance: 8, sourceUrl: 'https://www.ynet.co.il', sourceName: 'Ynet', authorName: null, publishedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: 3, reportId: 1, type: 'news', category: 'technology', title: 'סטארטאפ ישראלי בתחום ה-AI גייס $200 מיליון בסבב C', summary: 'חברת "NovaMind AI" הישראלית גייסה $200M בהובלת Sequoia Capital. החברה מפתחת מודלי שפה מתקדמים לשוק הארגוני ומתכננת הרחבה משמעותית.', whyItMatters: 'הגיוס מציב את ישראל כשחקנית מרכזית בזירת ה-AI העולמית ומחזק את מעמד ההייטק הישראלי.', implications: 'גיוס עובדים נרחב, חיזוק האקוסיסטם הישראלי, ותחרות מול חברות אמריקאיות.', importance: 8, sourceUrl: 'https://www.geektime.co.il', sourceName: 'Geektime', authorName: null, publishedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: 4, reportId: 1, type: 'news', category: 'politics', title: 'הממשלה אישרה תוכנית רפורמה בדיור - 50,000 יחידות חדשות', summary: 'הקבינט אישר תוכנית דיור חדשה הכוללת בניית 50,000 יחידות דיור בפריפריה וקיצור הליכי תכנון ל-18 חודשים.', whyItMatters: 'מדובר בצעד משמעותי לטיפול במשבר הדיור שפוקד את ישראל כבר שנים.', implications: 'ירידה צפויה במחירי הדירות בפריפריה, הגירה פנימית, ותנופת בנייה.', importance: 7, sourceUrl: 'https://www.haaretz.co.il', sourceName: 'הארץ', authorName: null, publishedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: 5, reportId: 1, type: 'news', category: 'society', title: 'שביתה ארצית במערכת החינוך - מחר לא ילמדו', summary: 'ארגוני המורים הכריזו על שביתה ארצית ביום רביעי בעקבות מחלוקת על תנאי השכר. כ-1.5 מיליון תלמידים לא ילמדו.', whyItMatters: 'השביתה משפיעה על מיליוני משפחות ומעלה לסדר היום את סוגיית תנאי המורים.', implications: 'לחץ ציבורי על הממשלה, פגיעה כלכלית ביום עבודה, ואפשרות להסכם חדש.', importance: 7, sourceUrl: 'https://www.kan.org.il', sourceName: 'כאן חדשות', authorName: null, publishedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: 6, reportId: 1, type: 'news', category: 'economy', title: 'בנק ישראל: האינפלציה ירדה ל-2.1% - הנמוכה מזה שנתיים', summary: 'הלמ"ס פרסמה שמדד המחירים לצרכן ירד ב-0.2% בחודש האחרון, והאינפלציה השנתית ירדה ל-2.1%.', whyItMatters: 'ירידת האינפלציה פותחת פתח להורדת ריבית ומקלה על עלות המחיה.', implications: 'הורדת ריבית צפויה, הוזלת משכנתאות, וחיזוק הצריכה הפרטית.', importance: 8, sourceUrl: 'https://www.calcalist.co.il', sourceName: 'כלכליסט', authorName: null, publishedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: 7, reportId: 1, type: 'news', category: 'technology', title: 'Intel תשקיע $10 מיליארד נוספים במפעל בישראל', summary: 'Intel הודיעה על הרחבת ההשקעה במפעל קריית גת ב-$10B, מה שיהפוך אותו לאחד המתקדמים בעולם עם טכנולוגיית 1.4nm.', whyItMatters: 'ההשקעה מחזקת את מעמד ישראל כמרכז ייצור שבבים עולמי.', implications: 'אלפי משרות חדשות, חיזוק הפריפריה, והגברת ייצוא הטכנולוגיה.', importance: 9, sourceUrl: 'https://www.pc.co.il', sourceName: 'אנשים ומחשבים', authorName: null, publishedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: 8, reportId: 1, type: 'news', category: 'military', title: 'מערכת הגנה אווירית חדשה עברה ניסוי מוצלח', summary: 'משרד הביטחון ורפאל ביצעו ניסוי מוצלח במערכת "מגן שמיים" ליירוט טילים בליסטיים בשכבה העליונה של האטמוספירה.', whyItMatters: 'המערכת משלימה את כיפת הברזל וחץ ומספקת שכבת הגנה נוספת.', implications: 'חיזוק ההגנה האסטרטגית, פוטנציאל ייצוא ביטחוני, ושיפור ההרתעה.', importance: 7, sourceUrl: 'https://www.ynet.co.il', sourceName: 'Ynet', authorName: null, publishedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: 9, reportId: 1, type: 'news', category: 'politics', title: 'ישראל וסעודיה: סבב שיחות חדש בוושינגטון', summary: 'נציגים ישראלים וסעודים נפגשו בוושינגטון לסבב שיחות נוסף בנושא נורמליזציה. השיחות כוללות היבטים ביטחוניים וכלכליים.', whyItMatters: 'הסכם עם סעודיה יהיה פריצת דרך גיאופוליטית משמעותית למזרח התיכון.', implications: 'שינוי מפת הבריתות האזורית, הזדמנויות כלכליות ותיירותיות, ולחץ בנושא הפלסטיני.', importance: 8, sourceUrl: 'https://www.haaretz.co.il', sourceName: 'הארץ', authorName: null, publishedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: 10, reportId: 1, type: 'news', category: 'society', title: 'מחקר: 40% מהישראלים מתכננים לעבוד מהבית באופן קבוע', summary: 'סקר חדש של מכון ברוקדייל מצא ש-40% מהעובדים בישראל מעדיפים עבודה היברידית קבועה. המגמה חזקה בעיקר בהייטק ובשירותים.', whyItMatters: 'שינוי דפוסי העבודה משפיע על תחבורה, נדל"ן מסחרי ואיכות חיים.', implications: 'ירידת ביקוש למשרדים, שיפור תחבורתי, ושינוי מפת המגורים.', importance: 6, sourceUrl: 'https://www.walla.co.il', sourceName: 'וואלה', authorName: null, publishedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: 11, reportId: 1, type: 'content', category: 'technology', title: 'מדריך: כך תבנו אסטרטגיית AI לארגון שלכם ב-2026', summary: 'מאמר מקיף שמסביר את הצעדים הנדרשים להטמעת AI בארגונים בינוניים וגדולים, כולל ROI, כוח אדם ותשתיות.', whyItMatters: 'AI הפך לכלי קריטי לתחרותיות עסקית ומי שלא יטמיע יישאר מאחור.', implications: 'הגברת פרודוקטיביות, חיסכון בעלויות, וצורך בהכשרת עובדים.', importance: 7, sourceUrl: 'https://www.geektime.co.il/ai-strategy-2026', sourceName: 'Geektime', authorName: 'יוסי כהן', publishedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: 12, reportId: 1, type: 'content', category: 'economy', title: 'ניתוח: למה הפד ירד מהריבית ומה זה אומר לישראל', summary: 'ניתוח מעמיק של השפעת הורדת הריבית האמריקאית על הכלכלה הישראלית, שוק ההון ושער החליפין.', whyItMatters: 'מדיניות הפד משפיעה ישירות על שוקי ההון ועל מדיניות בנק ישראל.', implications: 'ירידת תשואות אג"ח, חיזוק שוק המניות, ולחץ על השקל.', importance: 7, sourceUrl: 'https://www.calcalist.co.il/fed-analysis', sourceName: 'כלכליסט', authorName: 'דנה אשכנזי', publishedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: 13, reportId: 1, type: 'content', category: 'technology', title: 'סייבר 2026: האיומים החדשים שכל CISO צריך להכיר', summary: 'סקירה של וקטורי התקיפה החדשים כולל AI-powered attacks, deepfake phishing ו-quantum threats.', whyItMatters: 'איומי הסייבר מתפתחים מהר יותר מההגנות וארגונים צריכים להתעדכן.', implications: 'הגדלת תקציבי אבטחה, גיוס מומחים, ושדרוג מערכות.', importance: 6, sourceUrl: 'https://www.pc.co.il/cyber-2026', sourceName: 'אנשים ומחשבים', authorName: 'מיכל לוי', publishedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: 14, reportId: 1, type: 'content', category: 'politics', title: 'מבט מלמעלה: השפעת הבחירות באירופה על ישראל', summary: 'פוסט מנתח את ההשלכות של תוצאות הבחירות באירופה על יחסי ישראל-אירופה, סחר ודיפלומטיה.', whyItMatters: 'אירופה היא שותפת סחר מרכזית של ישראל ושינויים פוליטיים שם משפיעים ישירות.', implications: 'שינוי מדיניות סחר, השפעה על תהליכים מדיניים, ושינוי בסיוע.', importance: 5, sourceUrl: 'https://www.haaretz.co.il/europe-elections', sourceName: 'הארץ', authorName: 'עמית רז', publishedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: 15, reportId: 1, type: 'content', category: 'economy', title: 'FinTech ישראלי: 5 חברות שישנו את עולם התשלומים', summary: 'סקירה של חמש חברות פינטק ישראליות שמפתחות פתרונות תשלום חדשניים לשוק הגלובלי.', whyItMatters: 'ישראל מובילה בתחום הפינטק ואלו חברות שיכולות להפוך לענקיות.', implications: 'השקעות חדשות, שינוי דפוסי תשלום, ותחרות עם בנקים מסורתיים.', importance: 5, sourceUrl: 'https://www.globes.co.il/fintech-5', sourceName: 'גלובס', authorName: 'שרון אביב', publishedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  ],
};

export default function DashboardScreen() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    try {
      setError(null);
      const data = await getLatestReport();
      setReport(data || SAMPLE_REPORT);
    } catch (e) {
      // Fallback to sample data
      setReport(SAMPLE_REPORT);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReport();
    setRefreshing(false);
  }, [loadReport]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!report) {
    return (
      <EmptyState
        title="אין דוח זמין"
        message="עדיין לא נוצר דוח יומי. לחץ ליצירת דוח חדש."
        actionLabel="צור דוח"
        onAction={loadReport}
      />
    );
  }

  const newsItems = (report.newsItems || []).filter((item) => item.type === 'news');
  const contentItems = (report.newsItems || []).filter((item) => item.type === 'content');
  let trends: Trend[] = [];
  try {
    trends = typeof report.trends === 'string' ? JSON.parse(report.trends) : report.trends || [];
  } catch {
    trends = [];
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <ExecutiveSummary
        date={report.date}
        summary={report.executiveSummary}
      />

      {/* News Section */}
      <SectionHeader title="חדשות מרכזיות" icon="📰" count={newsItems.length} />
      {newsItems.map((item) => (
        <ReportCard
          key={item.id}
          item={item}
          onLinkPress={() => item.sourceUrl && Linking.openURL(item.sourceUrl)}
        />
      ))}

      {/* Content Section */}
      <SectionHeader title="תוכן מקצועי" icon="📋" count={contentItems.length} />
      {contentItems.map((item) => (
        <ReportCard
          key={item.id}
          item={item}
          onLinkPress={() => item.sourceUrl && Linking.openURL(item.sourceUrl)}
        />
      ))}

      {/* Trends Section */}
      <SectionHeader title="מגמות מרכזיות" icon="📈" count={trends.length} />
      <View style={styles.trendsRow}>
        {trends.map((trend, idx) => (
          <TrendCard key={idx} trend={trend} />
        ))}
      </View>

      {/* Conclusion */}
      {report.conclusion && (
        <View style={styles.conclusionCard}>
          <SectionHeader title="סיכום ניהולי" icon="✅" />
          <View style={styles.conclusionBody}>
            <View style={styles.conclusionContent}>
              <Text style={styles.conclusionText}>{report.conclusion}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Watch Next */}
      {report.watchNext24h && (
        <View style={styles.watchCard}>
          <SectionHeader title="מה לעקוב ב-24 שעות הקרובות" icon="👁️" />
          <View style={styles.watchBody}>
            <View style={styles.watchContent}>
              <Text style={styles.watchText}>{report.watchNext24h}</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// Import Text component
import { Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  trendsRow: {
    paddingHorizontal: spacing.md,
  },
  conclusionCard: {
    marginTop: spacing.sm,
  },
  conclusionBody: {
    paddingHorizontal: spacing.md,
  },
  conclusionContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    borderRightWidth: 4,
    borderRightColor: colors.success,
  },
  conclusionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  watchCard: {
    marginTop: spacing.sm,
  },
  watchBody: {
    paddingHorizontal: spacing.md,
  },
  watchContent: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: spacing.md,
    borderRightWidth: 4,
    borderRightColor: colors.primary,
  },
  watchText: {
    fontSize: 14,
    color: colors.primaryDark,
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  bottomSpacer: {
    height: 40,
  },
});
