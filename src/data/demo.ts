/** Demo data layer — powers the UI in Demo Mode (no backend attached yet). */

export interface Med {
  id: string;
  brand: string;
  generic: { en: string; fa: string };
  category: { en: string; fa: string };
  uses: { en: string[]; fa: string[] };
  forms: { en: string[]; fa: string[] };
  precautions: { en: string[]; fa: string[] };
  sideEffects: { en: string[]; fa: string[] };
  interactions: { en: string[]; fa: string[] };
}

export const MEDS: Med[] = [
  {
    id: "metformin", brand: "Metformin",
    generic: { en: "Metformin hydrochloride", fa: "متفورمین هیدروکلراید" },
    category: { en: "Antidiabetic · Biguanide", fa: "ضد دیابت · بیگوانید" },
    uses: {
      en: ["Type 2 diabetes mellitus", "Insulin resistance support", "Sometimes used in PCOS (off-label)"],
      fa: ["دیابت نوع ۲", "حمایت در مقاومت به انسولین", "گاهی در سندرم تخمدان پلی‌کیستیک (خارج از برچسب)"],
    },
    forms: { en: ["Tablet 500 / 850 / 1000 mg", "Extended-release tablet", "Oral solution"], fa: ["قرص ۵۰۰ / ۸۵۰ / ۱۰۰۰ میلی‌گرم", "قرص رهاسازی طولانی", "محلول خوراکی"] },
    precautions: {
      en: ["Kidney function should be checked before and during use", "May be paused before contrast imaging or surgery", "Alcohol increases lactic acidosis risk"],
      fa: ["عملکرد کلیه باید پیش و حین مصرف بررسی شود", "ممکن است پیش از تصویربرداری با کنتراست یا جراحی موقتاً قطع شود", "الکل خطر اسیدوز لاکتیک را افزایش می‌دهد"],
    },
    sideEffects: {
      en: ["Nausea or stomach upset", "Loose stools", "Metallic taste", "Vitamin B12 reduction with long-term use"],
      fa: ["تهوع یا ناراحتی معده", "مدفوع شل", "طعم فلزی", "کاهش ویتامین B12 در مصرف طولانی"],
    },
    interactions: {
      en: ["Iodinated contrast agents", "Alcohol (excess)", "Some diuretics may affect kidney handling"],
      fa: ["مواد کنتراست یددار", "الکل (مصرف زیاد)", "برخی دیورتیک‌ها ممکن است بر دفع کلیوی اثر بگذارند"],
    },
  },
  {
    id: "lisinopril", brand: "Lisinopril",
    generic: { en: "Lisinopril", fa: "لیزینوپریل" },
    category: { en: "ACE inhibitor", fa: "مهارکننده ACE" },
    uses: { en: ["High blood pressure", "Heart failure", "Kidney protection in diabetes"], fa: ["فشار خون بالا", "نارسایی قلب", "محافظت کلیه در دیابت"] },
    forms: { en: ["Tablet 2.5–40 mg"], fa: ["قرص ۲٫۵ تا ۴۰ میلی‌گرم"] },
    precautions: {
      en: ["Not used during pregnancy", "Potassium and creatinine are monitored", "Report any facial or throat swelling immediately"],
      fa: ["در بارداری استفاده نمی‌شود", "پتاسیم و کراتینین پایش می‌شوند", "هرگونه تورم صورت یا گلو را فوراً گزارش دهید"],
    },
    sideEffects: { en: ["Dry cough", "Dizziness on standing", "Elevated potassium"], fa: ["سرفه خشک", "سرگیجه هنگام ایستادن", "افزایش پتاسیم"] },
    interactions: { en: ["Potassium supplements", "NSAIDs like ibuprofen", "Lithium"], fa: ["مکمل‌های پتاسیم", "NSAIDها مانند ایبوپروفن", "لیتیوم"] },
  },
  {
    id: "atorvastatin", brand: "Atorvastatin",
    generic: { en: "Atorvastatin calcium", fa: "آتورواستاتین کلسیم" },
    category: { en: "Statin · Lipid-lowering", fa: "استاتین · کاهنده چربی خون" },
    uses: { en: ["High LDL cholesterol", "Cardiovascular risk reduction"], fa: ["کلسترول LDL بالا", "کاهش ریسک قلبی‌عروقی"] },
    forms: { en: ["Tablet 10–80 mg"], fa: ["قرص ۱۰ تا ۸۰ میلی‌گرم"] },
    precautions: {
      en: ["Liver enzymes may be checked", "Report unexplained muscle pain", "Avoid large amounts of grapefruit"],
      fa: ["آنزیم‌های کبدی ممکن است بررسی شوند", "درد عضلانی بدون علت را گزارش دهید", "از مصرف زیاد گریپ‌فروت پرهیز کنید"],
    },
    sideEffects: { en: ["Muscle aches", "Digestive upset", "Slight blood sugar increase"], fa: ["درد عضلانی", "ناراحتی گوارشی", "افزایش خفیف قند خون"] },
    interactions: { en: ["Grapefruit juice", "Some antibiotics & antifungals", "Other lipid drugs (fibrates)"], fa: ["آب گریپ‌فروت", "برخی آنتی‌بیوتیک‌ها و ضدقارچ‌ها", "داروهای چربی دیگر (فیبرات‌ها)"] },
  },
  {
    id: "levothyroxine", brand: "Levothyroxine",
    generic: { en: "Levothyroxine sodium", fa: "لووتیروکسین سدیم" },
    category: { en: "Thyroid hormone", fa: "هورمون تیروئید" },
    uses: { en: ["Hypothyroidism", "Thyroid hormone replacement"], fa: ["کم‌کاری تیروئید", "جایگزینی هورمون تیروئید"] },
    forms: { en: ["Tablet 25–200 mcg"], fa: ["قرص ۲۵ تا ۲۰۰ میکروگرم"] },
    precautions: {
      en: ["Take on an empty stomach, same time daily", "Separate from calcium/iron by 4 hours", "Dose is tuned by TSH testing"],
      fa: ["با معده خالی، هر روز در یک ساعت مشخص مصرف شود", "با کلسیم/آهن چهار ساعت فاصله داشته باشد", "دوز با آزمایش TSH تنظیم می‌شود"],
    },
    sideEffects: { en: ["Palpitations if dose is too high", "Insomnia", "Heat intolerance"], fa: ["تپش قلب در دوز بالا", "بی‌خوابی", "عدم تحمل گرما"] },
    interactions: { en: ["Calcium & iron supplements", "Proton pump inhibitors", "High-fiber meals"], fa: ["مکمل کلسیم و آهن", "مهارکننده‌های پمپ پروتون", "وعده‌های پرفیبر"] },
  },
  {
    id: "omeprazole", brand: "Omeprazole",
    generic: { en: "Omeprazole", fa: "امپرازول" },
    category: { en: "Proton pump inhibitor", fa: "مهارکننده پمپ پروتون" },
    uses: { en: ["Acid reflux / GERD", "Stomach and duodenal ulcers"], fa: ["رفلاکس اسید / GERD", "زخم معده و دوازدهه"] },
    forms: { en: ["Capsule 20–40 mg", "Delayed-release tablet"], fa: ["کپسول ۲۰ تا ۴۰ میلی‌گرم", "قرص رهاسازی تأخیری"] },
    precautions: {
      en: ["Best taken before the first meal", "Long courses are reviewed periodically", "Long-term use may affect magnesium and B12"],
      fa: ["بهتر است پیش از اولین وعده مصرف شود", "دوره‌های طولانی به‌صورت دوره‌ای بازبینی می‌شوند", "مصرف طولانی ممکن است منیزیم و B12 را کاهش دهد"],
    },
    sideEffects: { en: ["Headache", "Bloating", "Constipation or diarrhea"], fa: ["سردرد", "نفخ", "یبوست یا اسهال"] },
    interactions: { en: ["Clopidogrel", "Some antifungals", "Methotrexate (high dose)"], fa: ["کلوپیدوگرل", "برخی ضدقارچ‌ها", "متوترکسات (دوز بالا)"] },
  },
  {
    id: "ibuprofen", brand: "Ibuprofen",
    generic: { en: "Ibuprofen", fa: "ایبوپروفن" },
    category: { en: "NSAID · Pain & inflammation", fa: "NSAID · درد و التهاب" },
    uses: { en: ["Pain relief", "Fever reduction", "Inflammation"], fa: ["تسکین درد", "کاهش تب", "التهاب"] },
    forms: { en: ["Tablet 200–800 mg", "Oral suspension", "Topical gel"], fa: ["قرص ۲۰۰ تا ۸۰۰ میلی‌گرم", "شربت", "ژل موضعی"] },
    precautions: {
      en: ["Take with food to protect the stomach", "Caution with kidney disease or blood thinners", "Shortest effective course recommended"],
      fa: ["برای محافظت معده همراه غذا مصرف شود", "در بیماری کلیوی یا مصرف رقیق‌کننده‌های خون با احتیاط", "کوتاه‌ترین دوره مؤثر توصیه می‌شود"],
    },
    sideEffects: { en: ["Stomach irritation", "Fluid retention", "Dizziness"], fa: ["تحریک معده", "احتباس مایعات", "سرگیجه"] },
    interactions: { en: ["Blood thinners (warfarin)", "Aspirin", "ACE inhibitors"], fa: ["رقیق‌کننده‌های خون (وارفارین)", "آسپرین", "مهارکننده‌های ACE"] },
  },
  {
    id: "amoxicillin", brand: "Amoxicillin",
    generic: { en: "Amoxicillin trihydrate", fa: "آموکسی‌سیلین سه‌آبه" },
    category: { en: "Penicillin antibiotic", fa: "آنتی‌بیوتیک پنی‌سیلین" },
    uses: { en: ["Bacterial infections (ear, throat, chest)", "Part of H. pylori regimens"], fa: ["عفونت‌های باکتریال (گوش، گلو، قفسه سینه)", "بخشی از رژیم‌های هلیکوباکتر"] },
    forms: { en: ["Capsule 250–500 mg", "Oral suspension"], fa: ["کپسول ۲۵۰ تا ۵۰۰ میلی‌گرم", "شربت"] },
    precautions: {
      en: ["Complete the prescribed course", "Only works on bacterial infections", "Report any rash or breathing difficulty"],
      fa: ["دوره تجویزشده را کامل کنید", "فقط روی عفونت باکتریال اثر دارد", "هرگونه بثور یا مشکل تنفسی را گزارش دهید"],
    },
    sideEffects: { en: ["Nausea", "Diarrhea", "Skin rash (report immediately)"], fa: ["تهوع", "اسهال", "بثورات پوستی (فوراً گزارش دهید)"] },
    interactions: { en: ["Allopurinol (rash risk)", "Methotrexate", "Oral contraceptives (debatable)"], fa: ["آلوپورینول (خطر بثور)", "متوترکسات", "قرص‌های ضدبارداری (بحث‌برانگیز)"] },
  },
  {
    id: "salbutamol", brand: "Salbutamol",
    generic: { en: "Salbutamol (Albuterol)", fa: "سالبوتامول (آلبوترول)" },
    category: { en: "Bronchodilator · Rescue inhaler", fa: "گشادکننده برونش · اسپری نجات" },
    uses: { en: ["Asthma symptom relief", "Exercise-induced bronchospasm"], fa: ["تسکین علائم آسم", "برونکواسپاسم ورزشی"] },
    forms: { en: ["Inhaler 100 mcg/puff", "Nebulizer solution", "Tablet / syrup"], fa: ["اسپری ۱۰۰ میکروگرم هر پاف", "محلول نبولایزر", "قرص / شربت"] },
    precautions: {
      en: ["For symptom relief, not daily control", "Frequent need signals uncontrolled asthma", "Rinse technique matters — ask a pharmacist"],
      fa: ["برای تسکین علامت است، نه کنترل روزانه", "نیاز مکرر نشانه آسم کنترل‌نشده است", "تکنیک استفاده مهم است — از داروساز بپرسید"],
    },
    sideEffects: { en: ["Tremor", "Fast heartbeat", "Mild anxiety"], fa: ["لرزش", "ضربان قلب سریع", "اضطراب خفیف"] },
    interactions: { en: ["Beta-blockers", "Some diuretics (potassium)", "Stimulants"], fa: ["بتابلوکرها", "برخی دیورتیک‌ها (پتاسیم)", "محفزها"] },
  },
];

/* --------------------------- Lab catalog --------------------------- */

export interface LabTest {
  id: string;
  name: { en: string; fa: string };
  unit: string;
  low: number;
  high: number;
  explain: { en: string; fa: string };
}

export const LAB_TESTS: LabTest[] = [
  { id: "hgb", name: { en: "Hemoglobin", fa: "هموگلوبین" }, unit: "g/dL", low: 12, high: 17, explain: { en: "Carries oxygen in red blood cells. Low values can relate to iron deficiency or blood loss; high values to dehydration or altitude.", fa: "اکسیژن را در گلبول‌های قرمز حمل می‌کند. مقادیر پایین می‌تواند به کمبود آهن یا خونریزی مربوط باشد؛ مقادیر بالا به کم‌آبی یا ارتفاع." } },
  { id: "wbc", name: { en: "White Blood Cells", fa: "گلبول‌های سفید" }, unit: "×10³/µL", low: 4, high: 11, explain: { en: "Part of the immune system. High counts often accompany infection or inflammation; low counts can follow viral illness or certain medications.", fa: "بخشی از سیستم ایمنی. اعداد بالا اغلب همراه عفونت یا التهاب است؛ اعداد پایین می‌تواند پس از بیماری ویروسی یا برخی داروها باشد." } },
  { id: "plt", name: { en: "Platelets", fa: "پلاکت‌ها" }, unit: "×10³/µL", low: 150, high: 410, explain: { en: "Help blood clot. Low values increase bruising risk; very high values sometimes follow inflammation or iron deficiency.", fa: "به لخته شدن خون کمک می‌کنند. مقادیر پایین خطر کبودی را بیشتر می‌کند؛ مقادیر خیلی بالا گاهی پس از التهاب یا کمبود آهن دیده می‌شود." } },
  { id: "glu", name: { en: "Fasting Glucose", fa: "قند خون ناشتا" }, unit: "mg/dL", low: 70, high: 99, explain: { en: "Your baseline blood sugar. 100–125 is often called prediabetes; higher values warrant an HbA1c conversation.", fa: "قند خون پایه شما. ۱۰۰ تا ۱۲۵ اغلب پیش‌دیابت نامیده می‌شود؛ مقادیر بالاتر گفتگو درباره HbA1c را می‌طلبد." } },
  { id: "hba1c", name: { en: "HbA1c", fa: "همگلوبین گلیکیه" }, unit: "%", low: 4, high: 5.6, explain: { en: "Average blood sugar over ~3 months. 5.7–6.4% suggests prediabetes; 6.5%+ suggests diabetes — both need clinical confirmation.", fa: "میانگین قند خون حدود سه ماه اخیر. ۵٫۷ تا ۶٫۴٪ پیش‌دیابت و ۶٫۵٪+ دیابت را نشان می‌دهد — هر دو نیازمند تأیید بالینی‌اند." } },
  { id: "chol", name: { en: "Total Cholesterol", fa: "کلسترول تام" }, unit: "mg/dL", low: 0, high: 200, explain: { en: "Overall cholesterol load. Interpreted together with LDL, HDL and your cardiovascular risk profile.", fa: "بار کلی کلسترول. همراه با LDL، HDL و پروفایل ریسک قلبی‌عروقی شما تفسیر می‌شود." } },
  { id: "ldl", name: { en: "LDL Cholesterol", fa: "کلسترول LDL" }, unit: "mg/dL", low: 0, high: 100, explain: { en: "The \"bad\" cholesterol — main target in heart-risk prevention. Targets vary by your overall risk.", fa: "کلسترول «بد» — هدف اصلی در پیشگیری از ریسک قلبی. اهداف بسته به ریسک کلی شما متفاوت است." } },
  { id: "hdl", name: { en: "HDL Cholesterol", fa: "کلسترول HDL" }, unit: "mg/dL", low: 40, high: 100, explain: { en: "The \"good\" cholesterol — higher is generally protective. Exercise and healthy fats can help.", fa: "کلسترول «خوب» — بالاتر بودنش عموماً محافظتی است. ورزش و چربی‌های سالم کمک می‌کنند." } },
  { id: "tsh", name: { en: "TSH", fa: "TSH" }, unit: "mIU/L", low: 0.4, high: 4.2, explain: { en: "The traffic-light of thyroid function. High suggests underactive thyroid; very low suggests overactive.", fa: "چراغ راهنمای عملکرد تیروئید. بالا یعنی کم‌کاری احتمالی؛ خیلی پایین یعنی پرکاری احتمالی." } },
  { id: "vitd", name: { en: "Vitamin D", fa: "ویتامین D" }, unit: "ng/mL", low: 30, high: 100, explain: { en: "Important for bones and immunity. Deficiency is common, especially in winter and indoor lifestyles.", fa: "برای استخوان‌ها و ایمنی مهم است. کمبودش شایع است، مخصوصاً در زمستان و زندگی سرپوشیده." } },
];

/* --------------------------- Dashboard ----------------------------- */

export const HR_WEEK = [68, 74, 70, 76, 71, 72, 73];
export const HR_WEEK_B = [64, 70, 66, 72, 68, 69, 70];
export const SLEEP_WEEK = [6.5, 7.2, 5.8, 7.6, 7.0, 6.8, 7.4];
export const ACTIVITY_WEEK = [4200, 6800, 5300, 9100, 7400, 8412, 6200];

export const CONSULTS = [
  { id: 1, topic: { en: "Headache guidance", fa: "راهنمای سردرد" }, date: "Feb 5", dur: "6 min", tone: "neon" },
  { id: 2, topic: { en: "LDL cholesterol explained", fa: "توضیح کلسترول LDL" }, date: "Feb 3", dur: "9 min", tone: "azure" },
  { id: 3, topic: { en: "Sleep routine plan", fa: "برنامه روتین خواب" }, date: "Jan 30", dur: "12 min", tone: "violet" },
  { id: 4, topic: { en: "Metformin questions", fa: "پرسش‌های متفورمین" }, date: "Jan 27", dur: "7 min", tone: "neon" },
];

export const MED_SCHEDULE = [
  { name: "Vitamin D3", dose: "1000 IU", time: "08:00", taken: true },
  { name: "Omega-3", dose: "1000 mg", time: "13:00", taken: true },
  { name: "Magnesium", dose: "200 mg", time: "22:00", taken: false },
];

export interface JournalEntryT { id: number; date: string; mood: 0 | 1 | 2; note: { en: string; fa: string }; tag: { en: string; fa: string } }

export const JOURNAL: JournalEntryT[] = [
  { id: 1, date: "Feb 6", mood: 2, note: { en: "Energy much better after fixing sleep schedule.", fa: "انرژی بعد از تنظیم برنامه خواب خیلی بهتر شده." }, tag: { en: "Sleep", fa: "خواب" } },
  { id: 2, date: "Feb 5", mood: 1, note: { en: "Mild headache in the afternoon, likely screen fatigue.", fa: "سردرد خفیف عصر، احتمالاً خستگی صفحه‌نمایش." }, tag: { en: "Symptom", fa: "علامت" } },
  { id: 3, date: "Feb 3", mood: 2, note: { en: "30-minute walk after lunch — glucose felt stable.", fa: "پیاده‌روی ۳۰ دقیقه‌ای بعد از ناهار — قند پایدار به نظر می‌رسد." }, tag: { en: "Activity", fa: "فعالیت" } },
  { id: 4, date: "Feb 1", mood: 0, note: { en: "Stressful day, skipped exercise.", fa: "روز پُراسترسی بود، ورزش جا ماند." }, tag: { en: "Mood", fa: "حال" } },
];

export const REMINDERS_INIT = [
  { id: 1, type: 0, title: { en: "Dr. Ahmadi — Cardiology", fa: "دکتر احمدی — قلب و عروق" }, when: "Feb 12 · 10:30", done: false },
  { id: 2, type: 1, title: { en: "Magnesium 200 mg", fa: "منیزیم ۲۰۰ میلی‌گرم" }, when: "Tonight · 22:00", done: false },
  { id: 3, type: 2, title: { en: "Repeat lipid panel", fa: "تکرار پنل چربی خون" }, when: "Feb 20 · Lab", done: false },
  { id: 4, type: 3, title: { en: "20-min evening walk", fa: "پیاده‌روی ۲۰ دقیقه‌ای عصر" }, when: "Daily · 19:00", done: true },
];

/* ------------------------------ Admin ------------------------------ */

export interface AdminUser { id: number; name: string; email: string; role: string; plan: "Pro" | "Free" | "Team"; joined: string; status: "active" | "suspended" }

export const ADMIN_USERS: AdminUser[] = [
  { id: 1, name: "Sara Karimi", email: "sara.k@medai.health", role: "super", plan: "Team", joined: "2024-03-02", status: "active" },
  { id: 2, name: "Daniel Osei", email: "d.osei@medai.health", role: "admin", plan: "Team", joined: "2024-06-14", status: "active" },
  { id: 3, name: "Leila Hosseini", email: "leila.h@gmail.com", role: "analyst", plan: "Pro", joined: "2025-01-20", status: "active" },
  { id: 4, name: "Marcus Webb", email: "mwebb@outlook.com", role: "support", plan: "Free", joined: "2025-04-11", status: "suspended" },
  { id: 5, name: "Niloofar Ahmadi", email: "niloofar.a@yahoo.com", role: "medical", plan: "Pro", joined: "2025-07-08", status: "active" },
  { id: 6, name: "Jonas Keller", email: "jonas.k@web.de", role: "analyst", plan: "Free", joined: "2025-09-19", status: "active" },
  { id: 7, name: "Priya Nair", email: "priya.n@gmail.com", role: "support", plan: "Pro", joined: "2025-11-02", status: "active" },
  { id: 8, name: "Omid Rezaei", email: "omid.r@gmail.com", role: "admin", plan: "Team", joined: "2025-12-21", status: "suspended" },
];

export const SAFETY_EVENTS = [
  { id: 1, sev: 0, title: { en: "Emergency phrase detected — routed to crisis guidance", fa: "عبارت اورژانسی شناسایی شد — به راهنمای بحران هدایت شد" }, time: "12 min ago", resolved: false },
  { id: 2, sev: 1, title: { en: "User asked for insulin dosage change — blocked & referred", fa: "درخواست تغییر دوز انسولین — مسدود و ارجاع داده شد" }, time: "48 min ago", resolved: false },
  { id: 3, sev: 2, title: { en: "Model confidence low on rare interaction — hedge injected", fa: "اطمینان مدل در تداخل نادر پایین بود — نقد احتیاط درج شد" }, time: "2 h ago", resolved: true },
  { id: 4, sev: 2, title: { en: "Citation missing for medication claim — response regenerated", fa: "ارجاع برای ادعای دارویی موجود نبود — پاسخ بازتولید شد" }, time: "5 h ago", resolved: true },
  { id: 5, sev: 3, title: { en: "Rate limit hit from single IP (60 req/min)", fa: "عبور از سقف نرخ برای یک IP (۶۰ درخواست در دقیقه)" }, time: "9 h ago", resolved: true },
  { id: 6, sev: 1, title: { en: "Request to confirm a cancer diagnosis — declined safely", fa: "درخواست تأیید تشخیص سرطان — با امانت رد شد" }, time: "14 h ago", resolved: false },
];

export const KNOWLEDGE_DOCS = [
  { id: 1, src: "WHO Guidelines", name: "Cardiovascular prevention 2025", ver: "v3.2", chunks: 1540, status: "Indexed" },
  { id: 2, src: "MedlinePlus", name: "Medication monographs pack", ver: "v8.0", chunks: 9824, status: "Indexed" },
  { id: 3, src: "CDC", name: "Immunization schedules", ver: "v2.1", chunks: 612, status: "Indexed" },
  { id: 4, src: "NHS Inform", name: "Symptom guidance library", ver: "v5.4", chunks: 4211, status: "Updating" },
  { id: 5, src: "Internal", name: "Safety policy handbook", ver: "v1.9", chunks: 388, status: "Indexed" },
];

export const AUDIT_LOGS = [
  { actor: "sara.k@medai.health", action: "knowledge.reindex", target: "NHS symptom library", time: "2026-02-08 14:22" },
  { actor: "d.osei@medai.health", action: "user.suspend", target: "mwebb@outlook.com", time: "2026-02-08 11:07" },
  { actor: "system", action: "safety.event.auto", target: "crisis-phrase-route", time: "2026-02-08 09:45" },
  { actor: "niloofar.a@yahoo.com", action: "content.publish", target: "Sleep hygiene guide v2", time: "2026-02-07 17:31" },
  { actor: "omid.r@gmail.com", action: "settings.update", target: "rate_limit=60rpm", time: "2026-02-07 15:02" },
  { actor: "sara.k@medai.health", action: "role.grant", target: "analyst → jonas.k@web.de", time: "2026-02-06 10:58" },
];

export const ADMIN_GROWTH = [12, 19, 24, 31, 42, 58, 71, 86, 104, 128, 151, 183];
export const ADMIN_USAGE = [42, 68, 55, 91, 77, 120, 98];
export const ADMIN_LATENCY = [182, 174, 196, 168, 171, 158, 163, 149, 155, 142, 147, 139];

export const NOTIFS = [
  { id: 1, title: { en: "Safety digest ready", fa: "گزارش ایمنی آماده است" }, body: { en: "Weekly safety review: 6 events, 0 unresolved critical.", fa: "مرور هفتگی ایمنی: ۶ رویداد، بدون بحرانی حل‌نشده." }, time: "2 h ago", unread: true },
  { id: 2, title: { en: "Knowledge base updated", fa: "پایگاه دانش به‌روز شد" }, body: { en: "MedlinePlus monographs re-indexed to v8.0.", fa: "مونوگراف‌های MedlinePlus به نسخه ۸ بازنمایه‌سازی شد." }, time: "6 h ago", unread: true },
  { id: 3, title: { en: "New admin added", fa: "مدیر جدید افزوده شد" }, body: { en: "omid.r@gmail.com granted Admin role.", fa: "نقش مدیر به omid.r@gmail.com اعطا شد." }, time: "1 d ago", unread: false },
];
