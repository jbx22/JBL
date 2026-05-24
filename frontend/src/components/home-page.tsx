import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, FileSearch, Gavel, ShieldCheck, Sparkles } from "lucide-react";
import { SiteLogo } from "@/components/site-logo";

type Locale = "ar" | "en";

const content = {
    ar: {
        dir: "rtl",
        homeHref: "/",
        otherHref: "/en",
        otherLabel: "English",
        otherFlag: "🇺🇸",
        open: "افتح المنصة",
        nav: ["الهوية", "الرسالة والرؤية", "الأهداف", "الاشتراكات"],
        badge: "منصة قانونية وتجارية عربية أولا",
        title: "ذكاء قانوني عملي للمستندات، العقود، وقرارات الأعمال.",
        intro:
            "JBL BIZ LAW يساعد الفرق المهنية على فهم المستندات بسرعة، استخراج البنود المهمة، بناء مراجعات منظمة، ومشاركة النتائج بلغة عربية واضحة.",
        signup: "إنشاء حساب",
        login: "تسجيل الدخول",
        identityKicker: "هوية الموقع",
        identityTitle: "علامة مهنية هادئة، واضحة، ومبنية على الثقة.",
        pillars: [
            ["هوية المنصة", "منصة عربية للذكاء القانوني والتجاري، مصممة للمحامين والإدارات القانونية ورواد الأعمال."],
            ["وعد العلامة", "تحويل المستندات المعقدة إلى قرارات عملية قابلة للتنفيذ مع بقاء الحكم النهائي للمختص."],
            ["أسلوب العمل", "دقة، وضوح، قابلية تتبع، وتجربة عربية تراعي لغة القانون وسياق الأعمال في المنطقة."],
        ],
        missionTitle: "الرسالة",
        mission:
            "تمكين المهنيين من قراءة العقود والمستندات وتحليلها بسرعة أكبر، عبر أدوات ذكاء اصطناعي تساعد في التلخيص والمقارنة واكتشاف المخاطر دون استبدال الخبرة البشرية.",
        visionTitle: "الرؤية",
        vision:
            "أن تكون JBL BIZ LAW المنصة العربية المرجعية للعمل القانوني والتجاري المدعوم بالذكاء الاصطناعي.",
        goalsTitle: "الأهداف",
        goals: [
            "تقليل وقت مراجعة العقود والمستندات المتكررة.",
            "توحيد منهجية التحليل داخل الفرق القانونية والتجارية.",
            "رفع جودة التقارير القانونية قبل الاجتماعات أو التفاوض.",
            "إتاحة أدوات ذكاء اصطناعي مهنية باللغة العربية من اليوم الأول.",
        ],
        pricingTitle: "باقات الاشتراك",
        pricingIntro:
            "تسعير تدريجي يناسب التجربة، الفرد، الفريق، والمؤسسة مع الدفع عبر Moyasar بالريال السعودي.",
        choose: "اشترك الآن",
        freeCta: "ابدأ مجانا",
        contact: "تواصل معنا",
        finalTitle: "ابدأ بمستند واحد، ثم ابن سير عمل كامل لفريقك.",
        finalCta: "الدخول إلى المساعد",
    },
    en: {
        dir: "ltr",
        homeHref: "/en",
        otherHref: "/",
        otherLabel: "العربية",
        otherFlag: "🇸🇦",
        open: "Open app",
        nav: ["Identity", "Mission & vision", "Goals", "Pricing"],
        badge: "Arabic-first legal and business AI",
        title: "Practical legal intelligence for documents, contracts, and business decisions.",
        intro:
            "JBL BIZ LAW helps professional teams understand documents faster, extract key clauses, build structured reviews, and share results with clear legal context.",
        signup: "Create account",
        login: "Log in",
        identityKicker: "Website identity",
        identityTitle: "A calm, clear, trust-led professional brand.",
        pillars: [
            ["Platform identity", "An Arabic-first legal and business AI platform for lawyers, legal departments, and entrepreneurs."],
            ["Brand promise", "Turn complex documents into actionable decisions while keeping final judgment with the professional."],
            ["Working style", "Accuracy, clarity, traceability, and a regional legal-business experience from day one."],
        ],
        missionTitle: "Mission",
        mission:
            "Enable professionals to review contracts and documents faster through AI tools that summarize, compare, and surface risks without replacing human expertise.",
        visionTitle: "Vision",
        vision:
            "To become the reference Arabic platform for AI-supported legal and business work.",
        goalsTitle: "Goals",
        goals: [
            "Reduce time spent on repeated contract and document reviews.",
            "Standardize analysis across legal and business teams.",
            "Improve report quality before meetings and negotiations.",
            "Provide professional Arabic-first AI tools from the first day.",
        ],
        pricingTitle: "Subscription tiers",
        pricingIntro:
            "Graduated SaaS pricing for trial, individual, team, and enterprise use with Moyasar payments in SAR.",
        choose: "Subscribe now",
        freeCta: "Start free",
        contact: "Contact us",
        finalTitle: "Start with one document, then build a complete workflow for your team.",
        finalCta: "Go to assistant",
    },
} satisfies Record<Locale, Record<string, unknown>>;

const plans = {
    ar: [
        { id: "free", name: "الأساسي", price: "مجاني", cadence: "للبداية", body: "للتجربة المهنية الخفيفة", features: ["مساعد قانوني وتجاري أساسي", "مشاريع محدودة", "نماذج سير عمل جاهزة"] },
        { id: "professional", name: "المهني", price: "99 ر.س", cadence: "شهريا", body: "للمحامين والمستشارين", features: ["مراجعات مستندات أكثر", "تحليل عقود وجداول مقارنة", "أولوية في المعالجة"], featured: true },
        { id: "business", name: "الأعمال", price: "299 ر.س", cadence: "شهريا", body: "للشركات والفرق الصغيرة", features: ["مساحات عمل مشتركة", "صلاحيات أعضاء الفريق", "تقارير ملخصة للإدارة"] },
        { id: "enterprise", name: "المؤسسي", price: "حسب الاحتياج", cadence: "اتفاق سنوي", body: "للجهات ذات المتطلبات الخاصة", features: ["حوكمة وأمن متقدم", "تكاملات مخصصة", "دعم إعداد وتدريب"] },
    ],
    en: [
        { id: "free", name: "Basic", price: "Free", cadence: "starter", body: "For light professional trials", features: ["Core legal-business assistant", "Limited projects", "Ready workflow templates"] },
        { id: "professional", name: "Professional", price: "SAR 99", cadence: "monthly", body: "For lawyers and consultants", features: ["More document reviews", "Contract and comparison analysis", "Priority processing"], featured: true },
        { id: "business", name: "Business", price: "SAR 299", cadence: "monthly", body: "For companies and small teams", features: ["Shared workspaces", "Team permissions", "Management summaries"] },
        { id: "enterprise", name: "Enterprise", price: "Custom", cadence: "annual agreement", body: "For specialized requirements", features: ["Advanced governance and security", "Custom integrations", "Setup and training support"] },
    ],
} satisfies Record<Locale, Plan[]>;

type Plan = {
    id: string;
    name: string;
    price: string;
    cadence: string;
    body: string;
    features: string[];
    featured?: boolean;
};

function LanguageSwitcher({ locale }: { locale: Locale }) {
    const t = content[locale];
    return (
        <Link
            href={t.otherHref as string}
            className="inline-flex items-center gap-2 rounded-md border border-[#d8cfbd] bg-white px-3 py-2 text-sm font-semibold text-[#1a1a2e] transition hover:bg-[#f6f1e6]"
        >
            <span aria-hidden="true">{t.otherFlag as string}</span>
            <span>{t.otherLabel as string}</span>
        </Link>
    );
}

function SubscribeButton({ plan, locale, label }: { plan: Plan; locale: Locale; label: string }) {
    if (plan.id === "free") {
        return (
            <Link href="/signup" className="mt-7 inline-flex w-full items-center justify-center rounded-md border border-[#1a1a2e] px-4 py-3 text-sm font-bold text-[#1a1a2e] transition hover:bg-[#1a1a2e] hover:text-white">
                {label}
            </Link>
        );
    }

    return (
        <form action="/api/billing/moyasar/checkout" method="post" className="mt-7">
            <input type="hidden" name="plan" value={plan.id} />
            <input type="hidden" name="locale" value={locale} />
            <button
                type="submit"
                className={`inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-bold transition ${
                    plan.featured
                        ? "bg-[#c9a84c] text-[#151827] hover:bg-[#d9ba65]"
                        : "border border-[#1a1a2e] text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white"
                }`}
            >
                {label}
            </button>
        </form>
    );
}

export function HomePage({ locale = "ar" }: { locale?: Locale }) {
    const t = content[locale];
    const Icon = locale === "ar" ? ArrowLeft : ArrowRight;

    return (
        <main className="min-h-screen bg-[#f7f5ef] text-[#151827]" dir={t.dir as string}>
            <header className="border-b border-[#ded6c3] bg-[#fdfcf8]/95">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
                    <SiteLogo asLink size="md" />
                    <nav className="hidden items-center gap-7 text-sm font-semibold text-[#45423b] lg:flex">
                        {(t.nav as string[]).map((item, index) => (
                            <a key={item} href={["#identity", "#mission", "#goals", "#pricing"][index]} className="hover:text-[#1a1a2e]">
                                {item}
                            </a>
                        ))}
                    </nav>
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher locale={locale} />
                        <Link href="/assistant" className="inline-flex items-center gap-2 rounded-md bg-[#1a1a2e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2b2d4d]">
                            {t.open as string}
                            <Icon size={16} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </header>

            <section className="bg-[#fdfcf8]">
                <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:py-20">
                    <div className="flex flex-col justify-center">
                        <p className="mb-5 inline-flex w-fit items-center gap-2 rounded-md border border-[#d6c68f] bg-[#fbf4db] px-3 py-1 text-sm font-semibold text-[#7b6220]">
                            <Sparkles size={16} aria-hidden="true" />
                            {t.badge as string}
                        </p>
                        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-[#151827] md:text-6xl">
                            {t.title as string}
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-9 text-[#4b4b52]">{t.intro as string}</p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link href="/signup" className="inline-flex items-center gap-2 rounded-md bg-[#c9a84c] px-5 py-3 text-sm font-bold text-[#151827] transition hover:bg-[#d9ba65]">
                                {t.signup as string}
                                <Icon size={16} aria-hidden="true" />
                            </Link>
                            <Link href="/login" className="inline-flex items-center gap-2 rounded-md border border-[#1a1a2e] px-5 py-3 text-sm font-bold text-[#1a1a2e] transition hover:bg-[#1a1a2e] hover:text-white">
                                {t.login as string}
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center justify-center rounded-md border border-[#ded6c3] bg-white p-8 shadow-sm">
                        <img src="/jbl-logo.png" alt="JBL BIZ LAW" className="h-auto max-h-[420px] w-full max-w-[520px] object-contain" />
                    </div>
                </div>
            </section>

            <section id="identity" className="mx-auto max-w-7xl px-5 py-16 md:px-8">
                <p className="text-sm font-bold text-[#8d7330]">{t.identityKicker as string}</p>
                <h2 className="mt-3 max-w-3xl text-3xl font-extrabold text-[#151827] md:text-4xl">{t.identityTitle as string}</h2>
                <div className="mt-8 grid gap-4 md:grid-cols-3">
                    {(t.pillars as string[][]).map(([title, body], index) => {
                        const PillarIcon = [Gavel, ShieldCheck, FileSearch][index];
                        return (
                            <article key={title} className="rounded-md border border-[#ded6c3] bg-white p-6">
                                <PillarIcon size={24} className="mb-5 text-[#2e7d63]" aria-hidden="true" />
                                <h3 className="text-xl font-bold text-[#151827]">{title}</h3>
                                <p className="mt-4 leading-8 text-[#55565c]">{body}</p>
                            </article>
                        );
                    })}
                </div>
            </section>

            <section id="mission" className="bg-white">
                <div className="mx-auto grid max-w-7xl gap-5 px-5 py-16 md:grid-cols-2 md:px-8">
                    <article className="rounded-md border border-[#ded6c3] p-7">
                        <p className="text-sm font-bold text-[#8d7330]">{t.missionTitle as string}</p>
                        <p className="mt-4 text-lg leading-9 text-[#55565c]">{t.mission as string}</p>
                    </article>
                    <article className="rounded-md border border-[#ded6c3] p-7">
                        <p className="text-sm font-bold text-[#8d7330]">{t.visionTitle as string}</p>
                        <p className="mt-4 text-lg leading-9 text-[#55565c]">{t.vision as string}</p>
                    </article>
                </div>
            </section>

            <section id="goals" className="mx-auto max-w-7xl px-5 py-16 md:px-8">
                <div className="grid gap-8 md:grid-cols-[0.7fr_1.3fr]">
                    <h2 className="text-3xl font-extrabold text-[#151827]">{t.goalsTitle as string}</h2>
                    <div className="grid gap-3">
                        {(t.goals as string[]).map((goal) => (
                            <div key={goal} className="flex items-start gap-3 rounded-md border border-[#ded6c3] bg-white p-4">
                                <Check size={20} className="mt-1 shrink-0 text-[#2e7d63]" aria-hidden="true" />
                                <p className="leading-7 text-[#42444c]">{goal}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="pricing" className="bg-[#fdfcf8]">
                <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
                    <div className="max-w-3xl">
                        <p className="text-sm font-bold text-[#8d7330]">{t.pricingTitle as string}</p>
                        <h2 className="mt-3 text-3xl font-extrabold text-[#151827] md:text-4xl">{t.pricingIntro as string}</h2>
                    </div>
                    <div className="mt-9 grid gap-4 lg:grid-cols-4">
                        {plans[locale].map((plan) => (
                            <article key={plan.id} className={`rounded-md border p-6 ${plan.featured ? "border-[#c9a84c] bg-[#1a1a2e] text-white shadow-lg" : "border-[#ded6c3] bg-white text-[#151827]"}`}>
                                <p className={`text-sm font-bold ${plan.featured ? "text-[#c9a84c]" : "text-[#8d7330]"}`}>{plan.body}</p>
                                <h3 className="mt-2 text-2xl font-extrabold">{plan.name}</h3>
                                <div className="mt-5">
                                    <span className="text-3xl font-extrabold">{plan.price}</span>
                                    <span className={`mx-2 text-sm ${plan.featured ? "text-white/70" : "text-[#666]"}`}>{plan.cadence}</span>
                                </div>
                                <ul className="mt-6 space-y-3">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2 text-sm leading-6">
                                            <Check size={16} className={`mt-1 shrink-0 ${plan.featured ? "text-[#c9a84c]" : "text-[#2e7d63]"}`} aria-hidden="true" />
                                            <span className={plan.featured ? "text-white/85" : "text-[#4d4f57]"}>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <SubscribeButton plan={plan} locale={locale} label={plan.id === "free" ? (t.freeCta as string) : plan.id === "enterprise" ? (t.contact as string) : (t.choose as string)} />
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#1a1a2e] text-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-8">
                    <h2 className="max-w-3xl text-3xl font-extrabold">{t.finalTitle as string}</h2>
                    <Link href="/assistant" className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-[#1a1a2e] transition hover:bg-[#f2ead7]">
                        {t.finalCta as string}
                        <Icon size={16} aria-hidden="true" />
                    </Link>
                </div>
            </section>
        </main>
    );
}
