import { db } from './client';
import { reports, newsItems, sources, settings } from './schema';

const today = new Date().toISOString().split('T')[0];
const now = new Date().toISOString();

async function seed() {
  console.log('Seeding database...');

  // Clear existing data
  db.delete(newsItems).run();
  db.delete(reports).run();
  db.delete(sources).run();
  db.delete(settings).run();

  // Seed sources
  const defaultSources = [
    { name: 'Ynet', url: 'https://www.ynet.co.il/Integration/StoryRss2.xml', type: 'rss', category: 'news', enabled: 1, errorCount: 0, status: 'active' },
    { name: 'Haaretz', url: 'https://www.haaretz.co.il/cmlink/1.1', type: 'rss', category: 'news', enabled: 1, errorCount: 0, status: 'active' },
    { name: 'Calcalist', url: 'https://www.calcalist.co.il/GeneralRSS/0,16335,L-8,00.xml', type: 'rss', category: 'economy', enabled: 1, errorCount: 0, status: 'active' },
    { name: 'Globes', url: 'https://www.globes.co.il/webservice/rss/rssfeeder.asmx/FeederNode?iID=585', type: 'rss', category: 'economy', enabled: 1, errorCount: 0, status: 'active' },
    { name: 'Walla', url: 'https://rss.walla.co.il/feed/1', type: 'rss', category: 'news', enabled: 1, errorCount: 0, status: 'active' },
    { name: 'Kan News', url: 'https://www.kan.org.il/lobby/kan-news/0,7965,112,0,0.rss', type: 'rss', category: 'news', enabled: 1, errorCount: 0, status: 'active' },
    { name: 'Geektime', url: 'https://www.geektime.co.il/feed/', type: 'rss', category: 'technology', enabled: 1, errorCount: 0, status: 'active' },
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', type: 'rss', category: 'technology', enabled: 1, errorCount: 0, status: 'active' },
    { name: 'People & Computers', url: 'https://www.pc.co.il/feed/', type: 'rss', category: 'technology', enabled: 1, errorCount: 0, status: 'active' },
    { name: 'Reuters World', url: 'https://feeds.reuters.com/reuters/worldNews', type: 'rss', category: 'news', enabled: 1, errorCount: 0, status: 'active' },
    { name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml', type: 'rss', category: 'news', enabled: 1, errorCount: 0, status: 'active' },
  ];

  for (const source of defaultSources) {
    db.insert(sources).values(source).run();
  }
  console.log(`Inserted ${defaultSources.length} sources`);

  // Seed settings
  const defaultSettings = [
    { key: 'email_to', value: 'eldar@el-dar.co.il' },
    { key: 'schedule_time', value: '07:00' },
    { key: 'timezone', value: 'Asia/Jerusalem' },
    { key: 'max_news_items', value: '10' },
    { key: 'max_content_items', value: '5' },
    { key: 'backend_url', value: 'http://localhost:3001' },
  ];

  for (const setting of defaultSettings) {
    db.insert(settings).values(setting).run();
  }
  console.log(`Inserted ${defaultSettings.length} settings`);

  // Seed sample report
  const trendsData = JSON.stringify([
    {
      title: 'האטה בשוק הנדל"ן',
      description: 'מגמת ירידה מתמשכת במחירי הדירות ברבעון האחרון, עם ירידה ממוצעת של 3.2% בערים המרכזיות. הביקוש מצטמצם על רקע ריביות גבוהות.',
      direction: 'down'
    },
    {
      title: 'עלייה בהשקעות הייטק',
      description: 'גל השקעות חדש בסטארטאפים ישראליים בתחום ה-AI, עם עלייה של 45% בהשקעות לעומת הרבעון הקודם. חברות ישראליות מובילות בפיתוח מודלי שפה.',
      direction: 'up'
    },
    {
      title: 'יציבות גיאופוליטית שברירית',
      description: 'המשא ומתן האזורי ממשיך להתקדם בזהירות. ישנם סימנים חיוביים לנורמליזציה עם מדינות נוספות, אך המתיחות בזירה הצפונית נמשכת.',
      direction: 'stable'
    }
  ]);

  const [report] = db.insert(reports).values({
    date: today,
    executiveSummary: 'יום עמוס בזירה הכלכלית והביטחונית. בנק ישראל הודיע על הותרת הריבית ללא שינוי ב-4.5%, תוך ציון סימני התאוששות בשוק העבודה. בזירה הטכנולוגית, חברת AI ישראלית גייסה 200 מיליון דולר בסבב C. שוק ההון הישראלי סיים את היום בעליות מתונות, עם עלייה של 0.8% במדד ת"א 35. בזירה הבינלאומית, פסגת G7 התמקדה ברגולציה על בינה מלאכותית.',
    trends: trendsData,
    conclusion: 'המשק הישראלי מציג חוסן יחסי למרות אתגרים גלובליים. מגזר הטכנולוגיה ממשיך להוביל צמיחה, אך יש לעקוב אחר התפתחויות בשוק הנדל"ן ובזירה הגיאופוליטית. מומלץ לשים לב להחלטות ריבית עתידיות ולהשפעתן על שוק האשראי.',
    watchNext24h: 'פרסום נתוני האינפלציה לחודש מרץ (צפי: 2.8%), ישיבת קבינט ביטחוני מיוחדת, תוצאות רבעון ראשון של חברות הטכנולוגיה הגדולות, והמשך דיונים בכנסת על חוק התקציב.',
    createdAt: now,
  }).returning().all();

  console.log(`Inserted report for ${today}`);

  // Seed news items
  const sampleNewsItems = [
    {
      reportId: report.id,
      type: 'news',
      category: 'economy',
      title: 'בנק ישראל: הריבית נותרת על 4.5% — "סימני התאוששות בשוק העבודה"',
      summary: 'הוועדה המוניטרית של בנק ישראל החליטה להותיר את הריבית ללא שינוי ברמה של 4.5%. נגיד הבנק ציין כי נתוני התעסוקה מראים שיפור הדרגתי, אך האינפלציה עדיין מעל היעד. הבנק צופה שהריבית תתחיל לרדת ברבעון השלישי של השנה.',
      whyItMatters: 'החלטת הריבית משפיעה ישירות על עלויות המשכנתאות, האשראי העסקי, ושוק ההון. הותרתה ללא שינוי מעידה על גישה זהירה של הבנק המרכזי.',
      implications: 'בעלי משכנתאות בריבית משתנה ימשיכו לשלם תשלומים גבוהים. עסקים קטנים ובינוניים עלולים להמשיך להתמודד עם עלויות מימון גבוהות. שוק הנדל"ן צפוי להמשיך במגמת האטה.',
      importance: 9,
      sourceUrl: 'https://www.calcalist.co.il/finance/article/example1',
      sourceName: 'כלכליסט',
      authorName: null,
      publishedAt: now,
      createdAt: now,
    },
    {
      reportId: report.id,
      type: 'news',
      category: 'technology',
      title: 'סטארטאפ ישראלי בתחום ה-AI גייס 200 מיליון דולר בסבב C',
      summary: 'חברת "דיפמיינד ישראל" הודיעה על השלמת סבב גיוס C בהיקף של 200 מיליון דולר, בהובלת קרן סקויה. החברה מפתחת מודל שפה מתקדם לעברית וערבית, ומתכננת להרחיב את פעילותה לשווקים נוספים במזרח התיכון.',
      whyItMatters: 'הגיוס מעיד על אמון המשקיעים בסצנת ה-AI הישראלית ועל הפוטנציאל הכלכלי של מודלי שפה אזוריים.',
      implications: 'צפויים מאות משרות חדשות בתחום ה-AI בישראל. החברה עשויה להפוך לחד-קרן הישראלי הבא. המהלך עשוי למשוך השקעות נוספות למגזר.',
      importance: 8,
      sourceUrl: 'https://www.geektime.co.il/article/example2',
      sourceName: 'גיקטיים',
      authorName: null,
      publishedAt: now,
      createdAt: now,
    },
    {
      reportId: report.id,
      type: 'news',
      category: 'politics',
      title: 'הכנסת אישרה בקריאה ראשונה את חוק התקציב לשנת 2026',
      summary: 'מליאת הכנסת אישרה הלילה בקריאה ראשונה את הצעת חוק התקציב לשנת 2026 בהיקף של 530 מיליארד שקל. ההצבעה עברה ברוב של 61-53. האופוזיציה מתחה ביקורת על הקיצוצים בתקציבי הרווחה.',
      whyItMatters: 'חוק התקציב הוא המסמך הכלכלי החשוב ביותר של הממשלה, המשפיע על כל תחומי החיים — חינוך, בריאות, ביטחון ורווחה.',
      implications: 'הקיצוצים המתוכננים עלולים להשפיע על שירותים ציבוריים. תקציב הביטחון הגדל עלול לבוא על חשבון תחומים אזרחיים. הדיונים בקריאה שנייה ושלישית צפויים להיות סוערים.',
      importance: 9,
      sourceUrl: 'https://www.ynet.co.il/news/article/example3',
      sourceName: 'Ynet',
      authorName: null,
      publishedAt: now,
      createdAt: now,
    },
    {
      reportId: report.id,
      type: 'news',
      category: 'military',
      title: 'צה"ל: סיכלנו ניסיון הברחת נשק בגבול הצפון',
      summary: 'דובר צה"ל הודיע הבוקר על סיכול ניסיון הברחת נשק בגבול הצפון. כוחות צה"ל תפסו משלוח של נשק מתקדם שהיה בדרכו לארגון טרור. לא היו נפגעים בקרב כוחותינו. הפעולה בוצעה בתיאום עם גורמי המודיעין.',
      whyItMatters: 'ניסיונות הברחת נשק מעידים על המשך האיום בגבול הצפון ועל הצורך בערנות מתמדת.',
      implications: 'צפוי חיזוק הפעילות הביטחונית באזור. ייתכנו השלכות דיפלומטיות. הגברת הפיקוח על מעברי הגבול.',
      importance: 8,
      sourceUrl: 'https://www.ynet.co.il/news/article/example4',
      sourceName: 'Ynet',
      authorName: null,
      publishedAt: now,
      createdAt: now,
    },
    {
      reportId: report.id,
      type: 'news',
      category: 'economy',
      title: 'שוק ההון: ת"א 35 עלה ב-0.8% — מניות הטכנולוגיה מובילות',
      summary: 'מדד ת"א 35 סיים את יום המסחר בעלייה של 0.8%, מונע בעיקר על ידי מניות הטכנולוגיה. מניית נייס עלתה ב-3.2%, צ\'ק פוינט ב-2.1%. מדד הבנקים עלה ב-0.5% על רקע החלטת הריבית.',
      whyItMatters: 'ביצועי שוק ההון משקפים את הביטחון הכלכלי ומשפיעים על קרנות הפנסיה והחיסכון של מיליוני ישראלים.',
      implications: 'מגמת העלייה עשויה להימשך אם נתוני המאקרו ימשיכו להשתפר. משקיעים מוסדיים מגדילים חשיפה למניות טכנולוגיה מקומיות.',
      importance: 7,
      sourceUrl: 'https://www.globes.co.il/news/article/example5',
      sourceName: 'גלובס',
      authorName: null,
      publishedAt: now,
      createdAt: now,
    },
    {
      reportId: report.id,
      type: 'news',
      category: 'society',
      title: 'משרד החינוך: רפורמה חדשה בבחינות הבגרות תיכנס לתוקף בספטמבר',
      summary: 'שר החינוך הודיע על רפורמה מקיפה בבחינות הבגרות שתיכנס לתוקף בשנת הלימודים הקרובה. הרפורמה כוללת הפחתת מספר הבחינות החיצוניות, הגדלת המשקל של הערכה בית-ספרית, ושילוב מיומנויות דיגיטליות במקצועות הליבה.',
      whyItMatters: 'שינוי במערכת הבחינות משפיע על מאות אלפי תלמידים, על תכני ההוראה, ועל דרישות הקבלה למוסדות להשכלה גבוהה.',
      implications: 'מורים יידרשו להתעדכן בשיטות הערכה חדשות. צפויה מחלוקת ציבורית על הפחתת הסטנדרטים. אוניברסיטאות עשויות לשנות קריטריוני קבלה.',
      importance: 7,
      sourceUrl: 'https://www.haaretz.co.il/news/education/article/example6',
      sourceName: 'הארץ',
      authorName: null,
      publishedAt: now,
      createdAt: now,
    },
    {
      reportId: report.id,
      type: 'news',
      category: 'technology',
      title: 'גוגל משיקה מרכז מחקר AI חדש בתל אביב — 500 משרות חדשות',
      summary: 'חברת גוגל הודיעה על פתיחת מרכז מחקר בינה מלאכותית חדש בתל אביב, שיעסיק 500 עובדים תוך שלוש שנים. המרכז יתמקד בפיתוח מודלי שפה מרובי-לשוניים ובטכנולוגיות בריאות דיגיטלית.',
      whyItMatters: 'ההשקעה של גוגל מחזקת את מעמדה של ישראל כמרכז AI עולמי ומספקת מאות משרות איכותיות.',
      implications: 'עלייה בביקוש למהנדסי AI, עלייה אפשרית בשכר בתחום, חיזוק האקוסיסטם הטכנולוגי הישראלי.',
      importance: 7,
      sourceUrl: 'https://techcrunch.com/article/example7',
      sourceName: 'TechCrunch',
      authorName: null,
      publishedAt: now,
      createdAt: now,
    },
    {
      reportId: report.id,
      type: 'news',
      category: 'politics',
      title: 'פסגת G7: מנהיגי העולם דנים ברגולציה בינלאומית על AI',
      summary: 'מנהיגי מדינות ה-G7 פתחו דיון בפסגה השנתית על רגולציה בינלאומית לבינה מלאכותית. ישראל הוזמנה כמשקיפה בשל מומחיותה בתחום. נשיא ארה"ב קרא להקמת גוף בינלאומי שיפקח על פיתוח AI.',
      whyItMatters: 'רגולציה בינלאומית על AI תשפיע ישירות על תעשיית ההייטק הישראלית, שמהווה כ-18% מהתמ"ג.',
      implications: 'חברות ישראליות עשויות להידרש לעמוד בתקנים בינלאומיים חדשים. ההזמנה לפסגה מחזקת את המעמד הדיפלומטי של ישראל.',
      importance: 6,
      sourceUrl: 'https://www.bbc.com/news/article/example8',
      sourceName: 'BBC News',
      authorName: null,
      publishedAt: now,
      createdAt: now,
    },
    {
      reportId: report.id,
      type: 'news',
      category: 'economy',
      title: 'חברת מובילאיי מדווחת על עלייה של 25% בהכנסות הרבעון הראשון',
      summary: 'חברת מובילאיי, חברת הבת של אינטל לנהיגה אוטונומית, דיווחה על הכנסות של 637 מיליון דולר ברבעון הראשון — עלייה של 25% לעומת התקופה המקבילה. החברה ציינה ביקוש גובר מיצרניות רכב אירופיות.',
      whyItMatters: 'מובילאיי היא אחת מחברות הטכנולוגיה הגדולות בישראל ותוצאותיה משפיעות על האקוסיסטם כולו.',
      implications: 'תוצאות חיוביות עשויות להגביר את האמון במגזר הרכב האוטונומי. אינטל עשויה להגדיל השקעות בפעילות הישראלית.',
      importance: 6,
      sourceUrl: 'https://www.calcalist.co.il/finance/article/example9',
      sourceName: 'כלכליסט',
      authorName: null,
      publishedAt: now,
      createdAt: now,
    },
    {
      reportId: report.id,
      type: 'news',
      category: 'society',
      title: 'סקר: 68% מהישראלים מעוניינים בהרחבת התחבורה הציבורית בשבת',
      summary: 'סקר חדש שנערך על ידי מכון המחקר הישראלי לדמוקרטיה מגלה כי 68% מהציבור היהודי בישראל תומכים בהפעלת תחבורה ציבורית בשבת, עלייה של 5% לעומת השנה שעברה. התמיכה גבוהה במיוחד בקרב צעירים (82%).',
      whyItMatters: 'נושא התחבורה בשבת הוא אחד מהנושאים החברתיים הרגישים בישראל, הנוגע ליחסי דת ומדינה.',
      implications: 'ייתכנו לחצים פוליטיים להרחיב את שירותי התחבורה. הנושא עלול ליצור מתחים קואליציוניים.',
      importance: 5,
      sourceUrl: 'https://www.haaretz.co.il/news/article/example10',
      sourceName: 'הארץ',
      authorName: null,
      publishedAt: now,
      createdAt: now,
    },
    // Professional content items
    {
      reportId: report.id,
      type: 'content',
      category: 'technology',
      title: 'מדריך: איך להטמיע מודלי AI בארגון — 5 שלבים מעשיים',
      summary: 'מדריך מקיף של גיקטיים על הטמעת בינה מלאכותית בארגונים ישראליים. המאמר סוקר את חמשת השלבים הקריטיים: זיהוי הזדמנויות, בחירת טכנולוגיה, פיילוט, הדרכת עובדים, והשקה מבוקרת. כולל דוגמאות מארגונים ישראליים שהצליחו.',
      whyItMatters: 'הטמעת AI הפכה לצורך אסטרטגי עבור חברות ישראליות. מדריך זה מספק מתודולוגיה מעשית.',
      implications: 'ארגונים שיאמצו AI מוקדם ירכשו יתרון תחרותי. הביקוש ליועצי AI צפוי לעלות.',
      importance: 7,
      sourceUrl: 'https://www.geektime.co.il/article/ai-implementation-guide',
      sourceName: 'גיקטיים',
      authorName: 'ד"ר מיכל לוי',
      publishedAt: now,
      createdAt: now,
    },
    {
      reportId: report.id,
      type: 'content',
      category: 'economy',
      title: 'ניתוח: שוק הנדל"ן בישראל — לאן הולכים המחירים ב-2026?',
      summary: 'ניתוח מעמיק של גלובס על מגמות שוק הנדל"ן. המאמר מנתח את השפעת הריבית הגבוהה, ירידת הביקוש, והצפי לעלייה בהיצע. לפי הניתוח, מחירי הדירות צפויים לרדת ב-5-8% עד סוף 2026.',
      whyItMatters: 'שוק הנדל"ן משפיע על כלכלת ישראל ועל יכולת הרכישה של משפחות צעירות.',
      implications: 'קונים פוטנציאליים עשויים להמתין עם רכישה. יזמים עלולים לדחות פרויקטים חדשים. הבנקים עשויים להחמיר תנאי משכנתא.',
      importance: 8,
      sourceUrl: 'https://www.globes.co.il/news/article/real-estate-analysis',
      sourceName: 'גלובס',
      authorName: 'אורי פסובסקי',
      publishedAt: now,
      createdAt: now,
    },
    {
      reportId: report.id,
      type: 'content',
      category: 'technology',
      title: 'סייבר: האיומים החדשים על תשתיות קריטיות — מה ישראל עושה?',
      summary: 'סקירה מקיפה של PC.co.il על איומי הסייבר על תשתיות קריטיות בישראל. המאמר מפרט את העלייה של 40% בתקיפות סייבר על מערכות מים, חשמל ותחבורה, ואת התגובה של מערך הסייבר הלאומי.',
      whyItMatters: 'תשתיות קריטיות הן עמוד השדרה של המדינה. פגיעה בהן עלולה להשפיע על חיי יומיום של מיליוני אזרחים.',
      implications: 'צפויה הגדלת תקציבי הסייבר הלאומיים. חברות אבטחת מידע ישראליות ייהנו מביקוש מוגבר.',
      importance: 7,
      sourceUrl: 'https://www.pc.co.il/article/cyber-threats-2026',
      sourceName: 'People & Computers',
      authorName: 'נועם רותם',
      publishedAt: now,
      createdAt: now,
    },
    {
      reportId: report.id,
      type: 'content',
      category: 'economy',
      title: 'פודקאסט: ראיון עם נגיד בנק ישראל על עתיד המטבע הדיגיטלי',
      summary: 'בפרק החדש של פודקאסט "כלכלה בקצרה", נגיד בנק ישראל דן בתוכנית השקל הדיגיטלי. הנגיד חשף כי הפיילוט צפוי להתחיל ברבעון השלישי של 2026, עם שיתוף פעולה של שלושה בנקים מסחריים.',
      whyItMatters: 'שקל דיגיטלי עשוי לשנות את אופן התשלומים בישראל ולהשפיע על המערכת הבנקאית.',
      implications: 'בנקים צריכים להיערך לשינוי טכנולוגי. פינטק ישראלי עשוי לקבל הזדמנויות חדשות. האזרחים יידרשו להתרגל למערכת תשלומים חדשה.',
      importance: 6,
      sourceUrl: 'https://www.calcalist.co.il/podcast/digital-shekel',
      sourceName: 'כלכליסט',
      authorName: 'שרון פוליאקוב',
      publishedAt: now,
      createdAt: now,
    },
    {
      reportId: report.id,
      type: 'content',
      category: 'politics',
      title: 'דעה: האם ישראל מוכנה לשינוי האקלימי? ניתוח מדיניות',
      summary: 'מאמר דעה בהארץ בוחן את מוכנות ישראל לשינוי האקלים. המחבר טוען כי למרות יעדים שאפתניים, המדינה מפגרת ביישום. המאמר מציע תוכנית פעולה הכוללת מעבר מואץ לאנרגיה מתחדשת, השקעה בהתפלה, וחינוך סביבתי.',
      whyItMatters: 'ישראל נמצאת באזור הפגיע במיוחד לשינויי אקלים, עם סיכוני מים, חום קיצוני, ועליית מפלס הים.',
      implications: 'ייתכנו רגולציות חדשות על פליטות. השקעות באנרגיה ירוקה צפויות לגדול. ערים חופיות יידרשו להתכונן לעליית מפלס הים.',
      importance: 5,
      sourceUrl: 'https://www.haaretz.co.il/opinions/article/climate-policy',
      sourceName: 'הארץ',
      authorName: 'פרופ\' עמיחי ליפשיץ',
      publishedAt: now,
      createdAt: now,
    },
  ];

  for (const item of sampleNewsItems) {
    db.insert(newsItems).values(item).run();
  }
  console.log(`Inserted ${sampleNewsItems.length} news items`);

  console.log('Seed complete!');
}

seed();
