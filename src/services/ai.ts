/**
 * MEDAI · AI Service Layer
 * ------------------------
 * The frontend never talks to an LLM directly and never holds an API key.
 * Instead it targets a provider behind this interface:
 *
 *   Frontend → Backend API (/api/chat) → Safety Engine → LLM Provider → Response
 *
 * • If `VITE_API_URL` is set, the RemoteProvider streams from the real backend.
 * • Otherwise the MockProvider streams curated demo content so the full UX
 *   stays testable. Mock AI is clearly labelled and never claims to be real AI.
 */

import type { Lang } from "@/i18n/translations";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AISource {
  name: string;
  domain: string;
}

export interface AIReply {
  text: string;
  sources: AISource[];
  urgent: boolean;
}

export interface AIProvider {
  id: string;
  label: string;
  stream(messages: ChatMessage[], lang: Lang): AsyncGenerator<string>;
  reply(messages: ChatMessage[], lang: Lang): Promise<AIReply>;
}

/* ------------------------------------------------------------------ */
/* Safety layer (client-side mirror of the backend safety engine)      */
/* ------------------------------------------------------------------ */

const RED_FLAGS = [
  "chest pain", "cant breathe", "can't breathe", "not breathing", "severe bleeding",
  "heart attack", "stroke", "suicide", "kill myself", "choking", "unconscious",
  "درد قفسه سینه", "نفس نفس", "نمی‌توانم نفس", "خونریزی شدید", "سکته", "خودکشی", "بیهوش", "غش",
];

export function hasRedFlag(text: string): boolean {
  const t = text.toLowerCase();
  return RED_FLAGS.some((f) => t.includes(f));
}

/* ------------------------------------------------------------------ */
/* Mock knowledge base (demo mode)                                     */
/* ------------------------------------------------------------------ */

interface Intent {
  match: RegExp;
  en: string;
  fa: string;
  sources: AISource[];
}

const SRC = {
  who: { name: "World Health Organization", domain: "who.int" },
  cdc: { name: "Centers for Disease Control", domain: "cdc.gov" },
  medline: { name: "MedlinePlus", domain: "medlineplus.gov" },
  nhs: { name: "NHS Inform", domain: "nhsinform.scot" },
};

const INTENTS: Intent[] = [
  {
    match: /headache|migraine|سردرد|میگرن/i,
    en: "**Headaches lasting two days** are common and often relate to tension, dehydration, poor sleep, eye strain, or caffeine changes.\n\nThings that may help:\n- Regular hydration and meals\n- A consistent sleep schedule\n- Screen breaks and neck stretches\n\n**See a clinician promptly** if the headache is sudden and severe, follows a head injury, or comes with fever, stiff neck, confusion, vision change, or weakness on one side.",
    fa: "**سردردی که دو روز ادامه دارد** شایع است و اغلب به تنش، کم‌آبی، خواب نامنظم، خستگی چشم یا تغییر مصرف کافئین مربوط می‌شود.\n\nکارهایی که ممکن است کمک کند:\n- نوشیدن آب و وعده‌های منظم\n- برنامه خواب ثابت\n- استراحت از صفحه‌نمایش و کشش گردن\n\n**به‌زودی به پزشک مراجعه کنید** اگر سردرد ناگهانی و شدید است، پس از ضربه به سر رخ داده، یا با تب، گردن‌سفتی، گیجی، تغییر بینایی یا ضعف یک طرف بدن همراه است.",
    sources: [SRC.medline, SRC.nhs],
  },
  {
    match: /ldl|cholesterol|کلسترول|تری‌گلیسرید|تری گلیسرید/i,
    en: "**LDL cholesterol** is often called the \"bad\" cholesterol because higher levels over time are linked with plaque build-up in arteries.\n\nWays clinicians commonly approach it:\n- Food pattern: more fiber, unsaturated fats, fewer trans fats\n- Movement: roughly 150 minutes of moderate activity weekly\n- Weight, smoking and blood pressure management\n\nWhether medication is appropriate depends on your overall cardiovascular risk — that's a decision for your clinician, not an algorithm.",
    fa: "**کلسترول LDL** را اغلب کلسترول «بد» می‌نامند چون سطح بالای آن در طول زمان با رسوب پلاک در عروق مرتبط است.\n\nرویکردهای رایج پزشکان:\n- الگوی غذایی: فیبر بیشتر، چربی‌های غیراشباع، چربی ترانس کمتر\n- تحرک: حدود ۱۵۰ دقیقه فعالیت متوسط در هفته\n- مدیریت وزن، سیگار و فشار خون\n\nاینکه دارو لازم است یا نه به ریسک کلی قلبی‌عروقی شما بستگی دارد — تصمیمی است که پزشک می‌گیرد، نه یک الگوریتم.",
    sources: [SRC.cdc, SRC.medline],
  },
  {
    match: /sleep|insomnia|خواب|بی‌خوابی/i,
    en: "**Quality sleep** is built on rhythm more than anything else.\n\nEvidence-backed habits:\n- Fixed wake-up time — even on weekends\n- Dim light and no bright screens in the last hour\n- Cool, dark, quiet bedroom\n- Caffeine curfew about 8 hours before bed\n\nIf poor sleep lasts beyond three months or comes with loud snoring and daytime sleepiness, speak with a clinician about a sleep evaluation.",
    fa: "**خواب باکیفیت** بیش از هر چیز روی ریتم ثابت بنا می‌شود.\n\nعادت‌های مبتنی بر شواهد:\n- ساعت بیدار شدن ثابت — حتی آخر هفته‌ها\n- نور کم و بدون صفحه‌نمایش درخشان در ساعت آخر\n- اتاق خواب خنک، تاریک و ساکت\n- قطع کافئین حدود هشت ساعت پیش از خواب\n\nاگر خواب نامناسب بیش از سه ماه ادامه داشت یا با خروپف بلند و خواب‌آلودگی روزانه همراه بود، با پزشک درباره ارزیابی خواب صحبت کنید.",
    sources: [SRC.cdc, SRC.nhs],
  },
  {
    match: /metformin|medication|medicine|pill|متفورمین|دارو/i,
    en: "**Metformin** is a first-line medication for type 2 diabetes that lowers glucose production in the liver and improves insulin sensitivity.\n\nUseful facts:\n- Usually started at a low dose with food to reduce stomach upset\n- Common side effects: nausea, loose stools — often settle within weeks\n- Long-term use may lower vitamin B12; clinicians often monitor it\n\nIt is only taken when prescribed. Doses are adjusted by your prescriber based on labs and tolerance — never change them on your own.",
    fa: "**متفورمین** داروی خط اول دیابت نوع ۲ است که تولید قند در کبد را کم و حساسیت به انسولین را بیشتر می‌کند.\n\nنکات مفید:\n- معمولاً با دوز پایین و همراه غذا شروع می‌شود تا ناراحتی معده کم شود\n- عوارض شایع: تهوع و مدفوع شل — اغلب ظرف چند هفته بهتر می‌شود\n- مصرف طولانی ممکن است ویتامین B12 را کم کند؛ پزشکان معمولاً آن را پایش می‌کنند\n\nفقط با نسخه مصرف می‌شود. تنظیم دوز بر اساس آزمایش و تحمل، کار پزشک است — هرگز خودسرانه تغییرش ندهید.",
    sources: [SRC.medline],
  },
  {
    match: /blood pressure|hypertension|فشار خون/i,
    en: "**Blood pressure around 118/76** sits comfortably in the normal range.\n\nWhat keeps it healthy:\n- Less sodium, more potassium-rich foods\n- Regular aerobic movement\n- Alcohol moderation and stress management\n\nHome readings are most useful when measured seated, rested for five minutes, arm supported at heart level. Persistent readings above 130/80 deserve a clinical conversation.",
    fa: "**فشار خون حدود ۱۱۸/۷۶** در محدوده طبیعی قرار دارد.\n\nچه چیزهایی آن را سالم نگه می‌دارد:\n- نمک کمتر، غذاهای سرشار از پتاسیم بیشتر\n- فعالیت هوازی منظم\n- اعتدال در الکل و مدیریت استرس\n\nاندازه‌گیری خانگی وقتی مفید است که نشسته، پس از پنج دقیقه استراحت و با دست در سطح قلب انجام شود. اعداد مداوم بالای ۱۳۰/۸۰ ارزش گفتگو با پزشک را دارد.",
    sources: [SRC.cdc, SRC.who],
  },
  {
    match: /fever|temperature|تب|لرز/i,
    en: "**Fever** is usually the immune system doing its job. In adults, most fevers from common infections settle within a few days.\n\nReasonable care:\n- Fluids and rest\n- Light clothing, comfortable room temperature\n\nSeek care promptly if fever exceeds 39.4°C (103°F), lasts more than three days, or comes with stiff neck, rash, breathing difficulty, severe weakness, or confusion.",
    fa: "**تب** معمولاً کار طبیعی سیستم ایمنی است. در بزرگسالان، بیشتر تب‌های ناشی از عفونت‌های شایع ظرف چند روز فروکش می‌کند.\n\nمراقبت معقول:\n- مایعات و استراحت\n- پوشش سبک و دمای مطبوع اتاق\n\nاگر تب از ۳۹٫۴ درجه بالاتر رفت، بیش از سه روز طول کشید، یا با گردن‌سفتی، بثورات، مشکل تنفسی، ضعف شدید یا گیجی همراه بود، به‌سرعت مراقبت درمانی بگیرید.",
    sources: [SRC.medline, SRC.nhs],
  },
  {
    match: /anxiety|stress|panic|اضطراب|استرس|هراس/i,
    en: "**Stress that won't switch off** deserves the same care as any physical symptom.\n\nThings with good evidence:\n- Slow breathing — four seconds in, six out, for a few minutes\n- Daily movement, even a 20-minute walk\n- Limiting late-night news and caffeine\n\nIf worry feels uncontrollable, disrupts sleep or work, or brings panic sensations, a mental-health professional can help — and that's as routine as seeing any other doctor.",
    fa: "**استرسی که خاموش نمی‌شود** همان‌قدر مراقبت می‌خواهد که هر علامت جسمی.\n\nکارهای دارای شواهد خوب:\n- تنفس آرام — چهار ثانیه دم، شش ثانیه بازدم، برای چند دقیقه\n- تحرک روزانه، حتی یک پیاده‌روی ۲۰ دقیقه‌ای\n- محدود کردن اخبار شبانه و کافئین\n\nاگر نگرانی غیرقابل‌کنترل شد، خواب یا کار را مختل کرد، یا احساس هراس آورد، یک متخصص سلامت روان می‌تواند کمک کند — این به همان اندازه عادی است که مراجعه به هر پزشک دیگری.",
    sources: [SRC.nhs, SRC.who],
  },
];

const FALLBACK: Intent = {
  match: /.*/,
  en: "That's a thoughtful health question. Here's how I can be most useful:\n\n- **Describe symptoms** with when they started and how they've changed\n- **Ask about medications** — uses, precautions, interactions\n- **Share lab values** and I'll explain them against reference ranges\n\nI'll give you clear, source-grounded information and tell you honestly when something needs a clinician's judgment rather than a chat answer.",
  fa: "پرسش خوبی درباره سلامت است. بهترین راه‌هایی که می‌توانم کمک کنم:\n\n- **علائم را توصیف کنید** — چه زمانی شروع شده و چطور تغییر کرده‌اند\n- **درباره داروها بپرسید** — موارد مصرف، احتیاط‌ها، تداخلات\n- **مقادیر آزمایش را بفرستید** تا در برابر محدوده مرجع توضیحشان دهم\n\nاطلاعات شفاف و مستند می‌دهم و صادقانه می‌گویم کجا قضاوت پزشک لازم است، نه پاسخ یک چت.",
  sources: [SRC.who, SRC.medline],
};

const URGENT_TEXT: Record<Lang, string> = {
  en: "What you're describing could be urgent. **Please contact emergency services or go to the nearest emergency department now** rather than waiting for a chat response.\n\nWhile waiting for help:\n- Stay with another person if possible\n- Avoid eating or drinking in case a procedure is needed\n- Note the time symptoms started — clinicians always ask",
  fa: "آنچه توصیف کرده‌اید ممکن است فوری باشد. **لطفاً همین حالا با اورژانس تماس بگیرید یا به نزدیک‌ترین بخش اورژانس بروید** و منتظر پاسخ چت نمانید.\n\nتا رسیدن کمک:\n- در صورت امکان تنها نباشید\n- در صورت احتمال نیاز به اقدام درمانی، چیزی نخورید و ننوشید\n- زمان شروع علائم را یادداشت کنید — پزشکان همیشه می‌پرسند",
};

/* ------------------------------------------------------------------ */
/* Mock provider — streams curated demo answers                        */
/* ------------------------------------------------------------------ */

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class MockAIProvider implements AIProvider {
  id = "mock";
  label = "Mock AI (demo)";

  private build(messages: ChatMessage[], lang: Lang): AIReply {
    const last = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
    if (hasRedFlag(last)) {
      return { text: URGENT_TEXT[lang], sources: [SRC.who], urgent: true };
    }
    const intent = INTENTS.find((i) => i.match.test(last)) ?? FALLBACK;
    return { text: lang === "fa" ? intent.fa : intent.en, sources: intent.sources, urgent: false };
  }

  async *stream(messages: ChatMessage[], lang: Lang): AsyncGenerator<string> {
    const reply = this.build(messages, lang);
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    await delay(reduced ? 0 : 500 + Math.random() * 500);
    const tokens = reply.text.split(/(\s+)/);
    for (const tok of tokens) {
      yield tok;
      if (!reduced && tok.trim()) await delay(14 + Math.random() * 30);
    }
  }

  async reply(messages: ChatMessage[], lang: Lang): Promise<AIReply> {
    return this.build(messages, lang);
  }
}

/* ------------------------------------------------------------------ */
/* Remote provider — real backend (FastAPI) with graceful fallback     */
/* ------------------------------------------------------------------ */

export class RemoteAIProvider implements AIProvider {
  id = "remote";
  label = "Backend AI";
  private fallback = new MockAIProvider();

  constructor(private baseUrl: string) {}

  async *stream(messages: ChatMessage[], lang: Lang): AsyncGenerator<string> {
    try {
      const res = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, lang, stream: true }),
      });
      if (!res.ok || !res.body) throw new Error(`Backend ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        yield decoder.decode(value, { stream: true });
      }
    } catch {
      yield* this.fallback.stream(messages, lang);
    }
  }

  async reply(messages: ChatMessage[], lang: Lang): Promise<AIReply> {
    try {
      const res = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, lang, stream: false }),
      });
      if (!res.ok) throw new Error(`Backend ${res.status}`);
      return (await res.json()) as AIReply;
    } catch {
      return this.fallback.reply(messages, lang);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Provider resolution                                                 */
/* ------------------------------------------------------------------ */

let cached: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cached) return cached;
  const base = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");
  cached = base ? new RemoteAIProvider(base) : new MockAIProvider();
  return cached;
}

export function isDemoMode(): boolean {
  return !(import.meta.env.VITE_API_URL as string | undefined);
}
