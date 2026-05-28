import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    FileSearch,
    Gavel,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import { SiteLogo } from "@/components/site-logo";

type Locale = "ar" | "en";

type Plan = {
    id: string;
    name: string;
    price: string;
    cadence: string;
    body: string;
    features: string[];
    featured?: boolean;
};

const content = {
    ar: {
        dir: "rtl",
        otherHref: "/en",
        otherLabel: "English",
        otherFlag: "🇺🇸",
        open: "تسجيل الدخول للمنصة",
        nav: ["الهوية", "كيف يعمل", "الرسالة والرؤية", "الأهداف", "الاشتراكات", "تواصل معنا"],
        badge: "منصة ذكاء عقود عربية عابرة للحدود",
        title: "الذكاء الاصطناعي العربي لقانون الأعمال الدولي",
        intro:
            "بنية تحتية قانونية ذكية للعالم العربي — تمكّن رواد الأعمال والشركات والمحترفين من صياغة وتحليل وفهم العقود الخليجية والأمريكية والأوروبية بثقة ووضوح أكبر.",
        signup: "ابدأ مجاناً",
        login: "حلّل عقدك الآن",
        identityKicker: "هوية الموقع",
        identityTitle: "AGD LAW AI ليست مكتب محاماة أو روبوت دردشة عام؛ إنها ذكاء عقود عربية عابرة للحدود.",
        pillars: [
            [
                "ذكاء العقود بالذكاء الاصطناعي",
                "حلّل العقود والاتفاقيات الدولية واستخرج المخاطر والبنود المهمة بلغة عربية واضحة قبل التوقيع.",
            ],
            [
                "مساحة عمل قانونية ذكية",
                "نظّم المستندات والمشاريع ومسارات المراجعة داخل منصة واحدة مصممة للشركات ورواد الأعمال والمتخصصين.",
            ],
            [
                "مساعد قانوني بالذكاء الاصطناعي",
                "اسأل عن عقودك الخليجية والأمريكية والأوروبية واحصل على تحليل وصياغة مدعومة بالذكاء الاصطناعي.",
            ],
        ],
        howItWorksTitle: "كيف يعمل",
        howItWorksIntro:
            "مسارات عمل عملية لفهم وتحليل وإدارة العقود الدولية بشكل أسرع وأكثر ذكاءً.",
        howItWorksItems: [
            ["مساعد AGD AI", "اطرح أسئلة على مستنداتك وشغّل مسارات تحليل متعددة الخطوات مع مراجع واضحة."],
            ["المشاريع", "نظّم ملفات الشركات والعقود الدولية داخل مساحات عمل واضحة لكل مشروع."],
            ["تحليل العقود الجدولي", "حوّل مجموعة عقود إلى جدول مراجعة قابل للتتبع والمقارنة والاقتباس."],
            ["أتمتة سير العمل القانوني", "احفظ خطوات تحليل العقود والصياغة المتكررة وشغّلها بنقرة واحدة."],
        ],
        missionTitle: "الرسالة",
        mission:
            "تمكين المتحدثين بالعربية من فهم وتحليل وإدارة العقود الدولية عبر بنية تحتية قانونية ذكية مدعومة بالذكاء الاصطناعي.",
        visionTitle: "الرؤية",
        vision:
            "أن نصبح المنصة العربية الرائدة للذكاء الاصطناعي في قانون الأعمال الدولي وذكاء العقود العابرة للحدود.",
        goalsTitle: "الأهداف",
        goals: [
            "تبسيط العقود القانونية المعقدة للمتحدثين بالعربية.",
            "تمكين الشركات من اتخاذ قرارات قانونية وتجارية أكثر ذكاءً.",
            "ربط الأنظمة القانونية الخليجية والأمريكية والأوروبية بالعالم العربي.",
            "مساعدة الشركات الناشئة والأعمال العابرة للحدود على تقليل المخاطر القانونية.",
        ],
        pricingTitle: "باقات الاشتراك",
        pricingIntro:
            "باقات مرنة لاستخدام AGD LAW AI في تحليل العقود، الصياغة الذكية، وأتمتة سير العمل القانوني.",
        choose: "اشترك الآن",
        freeCta: "ابدأ مجاناً",
        contact: "تواصل معنا",
        finalTitle: "افهم قبل أن توقّع. ارفع عقدك وابدأ بتحليل أوضح لعقود الأعمال الدولية.",
        finalCta: "جرّب AGD AI",
    },
    en: {
        dir: "ltr",
        otherHref: "/",
        otherLabel: "العربية",
        otherFlag: "🇸🇦",
        open: "Log in to app",
        nav: ["Identity", "How it works", "Mission & vision", "Goals", "Pricing", "Contact"],
        badge: "Cross-border Arabic business contract intelligence",
        title: "Arabic AI for International Business Law",
        intro:
            "AI legal infrastructure built for the Arabic world — empowering founders, businesses, and professionals to draft, analyze, and understand US, EU, and GCC contracts with confidence.",
        signup: "Start Free",
        login: "Analyze a Contract",
        identityKicker: "Website identity",
        identityTitle: "AGD LAW AI is not a law firm, generic AI chat, or legal search engine. It is cross-border Arabic business contract intelligence.",
        pillars: [
            [
                "AI Contract Intelligence",
                "Analyze international agreements, identify risks, and understand key terms before you sign.",
            ],
            [
                "AI Legal Workspace",
                "Organize contracts, projects, reviews, and repeatable workflows in one workspace built for Arabic-speaking businesses.",
            ],
            [
                "AI Legal Assistant",
                "Ask questions across GCC, US, and European agreements and get AI-powered contract analysis and drafting support.",
            ],
        ],
        howItWorksTitle: "How it works",
        howItWorksIntro:
            "A practical workflow for drafting, analyzing, and managing international contracts faster.",
        howItWorksItems: [
            ["AGD AI Assistant", "Ask questions across your documents and run multi-step contract workflows with clear citations."],
            ["Projects", "Organize company, startup, and cross-border contract files inside focused workspaces."],
            ["Contract review tables", "Turn document sets into cited review tables built for comparison and export."],
            ["Legal workflow automation", "Save repeatable contract analysis and drafting steps and run them in one click."],
        ],
        missionTitle: "Mission",
        mission:
            "Empowering Arabic speakers to understand, analyze, and manage international business contracts through intelligent AI-powered legal infrastructure.",
        visionTitle: "Vision",
        vision:
            "To become the leading Arabic AI platform for international business law and cross-border contract intelligence.",
        goalsTitle: "Goals",
        goals: [
            "Simplify complex legal contracts for Arabic speakers.",
            "Enable smarter international business decisions.",
            "Bridge Arabic, GCC, US, and European legal workflows.",
            "Help startups and businesses reduce legal risks.",
        ],
        pricingTitle: "Subscription tiers",
        pricingIntro:
            "Flexible access to AGD LAW AI for contract intelligence, AI-powered drafting, and legal workflow automation.",
        choose: "Subscribe now",
        freeCta: "Start Free",
        contact: "Contact us",
        finalTitle: "Understand before you sign. Upload an agreement and start with clearer international contract intelligence.",
        finalCta: "Try AGD AI",
    },
} satisfies Record<Locale, Record<string, unknown>>;

const plans = {
    ar: [
        {
            id: "explorer",
            name: "المستكشف",
            price: "مجاني",
            cadence: "",
            body: "للمستقلين والطلاب والمستخدمين الجدد",
            features: [
                "5 تحليلات عقود شهرياً",
                "شروح مبسطة للعقود بالذكاء الاصطناعي",
                "تلخيص عقود عربي ↔ إنجليزي",
                "مراجعة أساسية لعقود NDA",
                "رفع PDF و DOCX",
                "تصدير بعلامة مائية",
            ],
        },
        {
            id: "business",
            name: "الأعمال",
            price: "$29",
            cadence: "شهرياً",
            body: "للشركات الناشئة والمتاجر والوكالات والمستشارين",
            features: [
                "100 تحليل عقد شهرياً",
                "إنشاء العقود بالذكاء الاصطناعي",
                "كشف المخاطر القانونية",
                "دعم العقود العربية والإنجليزية",
                "دعم العقود الأمريكية والأوروبية والخليجية",
                "اقتراحات إعادة الصياغة",
                "تصدير احترافي للعقود",
                "دعم فني عبر البريد الإلكتروني",
            ],
        },
        {
            id: "founder_pro",
            name: "المؤسس الاحترافية",
            price: "$99",
            cadence: "شهرياً",
            body: "للمؤسسين والشركات الصغيرة والمتوسطة والشركات الدولية",
            features: [
                "تحليل غير محدود للعقود",
                "ذكاء قانوني متقدم",
                "شرح بند ببند للعقود",
                "اقتراحات تفاوض ذكية",
                "مقارنة بين عدة عقود",
                "اقتراحات Redline ذكية",
                "قوالب استثمار وشراكات",
                "دعم فني أولوية",
            ],
            featured: true,
        },
        {
            id: "enterprise",
            name: "المؤسسات",
            price: "مخصص",
            cadence: "",
            body: "لمكاتب المحاماة والشركات الكبرى والجهات الحكومية",
            features: [
                "استضافة خاصة",
                "تشغيل داخلي Self-Hosted",
                "مساحات عمل للفرق",
                "API للمطورين",
                "تدريب مخصص للذكاء الاصطناعي العربي",
                "ربط قواعد المعرفة الداخلية",
                "نظام دخول موحد SSO",
                "أدوات أمان وامتثال",
                "مدير حساب ودعم مخصص",
            ],
        },
    ],
    en: [
        {
            id: "explorer",
            name: "Explorer",
            price: "Free",
            cadence: "",
            body: "For freelancers, students, and first-time users",
            features: [
                "5 contract analyses/month",
                "Basic AI explanations",
                "Arabic ↔ English contract summaries",
                "Basic NDA review",
                "Upload PDF/DOCX",
                "Watermarked exports",
            ],
        },
        {
            id: "business",
            name: "Business",
            price: "$29",
            cadence: "/month",
            body: "For startups, consultants, ecommerce, and agencies",
            features: [
                "100 contract analyses/month",
                "AI contract drafting",
                "Risk detection",
                "Arabic + English contracts",
                "US/EU/GCC contract support",
                "AI rewrite suggestions",
                "Export clean documents",
                "Email support",
            ],
        },
        {
            id: "founder_pro",
            name: "Founder Pro",
            price: "$99",
            cadence: "/month",
            body: "For founders, SMEs, and cross-border businesses",
            features: [
                "Unlimited analyses",
                "Advanced legal intelligence",
                "Clause-by-clause explanations",
                "AI negotiation suggestions",
                "Multi-document comparison",
                "Smart redline recommendations",
                "Investor/legal templates",
                "Priority support",
            ],
            featured: true,
        },
        {
            id: "enterprise",
            name: "Enterprise",
            price: "Custom",
            cadence: "",
            body: "For law firms, enterprises, governments, and holding groups",
            features: [
                "Private deployment",
                "Self-hosted options",
                "Team workspaces",
                "API access",
                "Arabic legal fine-tuning",
                "Internal knowledge integration",
                "SSO",
                "Compliance/security controls",
                "Dedicated onboarding",
            ],
        },
    ],
} satisfies Record<Locale, Plan[]>;

const howItWorksImages = [
    "/screenshots/assistant.jpg",
    "/screenshots/projects.jpg",
    "/screenshots/tabular-review.jpg",
    "/screenshots/workflows.jpg",
];

function localizedPath(locale: Locale, path: string) {
    return locale === "ar" ? path : `/en${path}`;
}

function localizedAppPath(locale: Locale, path: string) {
    if (locale === "ar") return path;
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}lang=en`;
}

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

function SubscribeButton({
    plan,
    locale,
    label,
}: {
    plan: Plan;
    locale: Locale;
    label: string;
}) {
    if (plan.id === "explorer" || plan.id === "enterprise") {
        return (
            <Link
                href={localizedAppPath(locale, "/signup")}
                className="mt-7 inline-flex w-full items-center justify-center rounded-md border border-[#1a1a2e] px-4 py-3 text-sm font-bold text-[#1a1a2e] transition hover:bg-[#1a1a2e] hover:text-white"
            >
                {label}
            </Link>
        );
    }

    return (
        <Link
            href={localizedAppPath(locale, `/subscription?plan=${plan.id}`)}
            className={`mt-7 inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-bold transition ${
                plan.featured
                    ? "bg-[#c9a84c] text-[#151827] hover:bg-[#d9ba65]"
                    : "border border-[#1a1a2e] text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white"
            }`}
        >
            {label}
        </Link>
    );
}

export function HomePage({ locale = "ar" }: { locale?: Locale }) {
    const t = content[locale];
    const Icon = locale === "ar" ? ArrowLeft : ArrowRight;
    const navTargets = ["#identity", "#how-it-works", "#mission", "#goals", "#pricing", localizedPath(locale, "/contact")];
    const align = locale === "ar" ? "text-right" : "text-left";

    return (
        <main className="min-h-screen bg-[#f7f5ef] text-[#151827]" dir={t.dir as string}>
            <header className="border-b border-[#ded6c3] bg-[#fdfcf8]/95">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
                    <SiteLogo asLink size="md" />
                    <nav className="hidden items-center gap-7 text-sm font-semibold text-[#45423b] lg:flex">
                        {(t.nav as string[]).map((item, index) => (
                            <a key={item} href={navTargets[index]} className="hover:text-[#1a1a2e]">
                                {item}
                            </a>
                        ))}
                    </nav>
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher locale={locale} />
                        <Link
                            href={localizedAppPath(locale, "/login?callbackUrl=/assistant")}
                            className="inline-flex items-center gap-2 rounded-md bg-[#1a1a2e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2b2d4d]"
                        >
                            {t.open as string}
                            <Icon size={16} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </header>

            <section className="bg-[#fdfcf8]">
                <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:py-20">
                    <div className={`flex flex-col justify-center ${align}`}>
                        <p className="mb-5 inline-flex w-fit items-center gap-2 rounded-md border border-[#d6c68f] bg-[#fbf4db] px-3 py-1 text-sm font-semibold text-[#7b6220]">
                            <Sparkles size={16} aria-hidden="true" />
                            {t.badge as string}
                        </p>
                        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-[#151827] md:text-6xl">
                            {t.title as string}
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-9 text-[#4b4b52]">{t.intro as string}</p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href={localizedAppPath(locale, "/signup")}
                                className="inline-flex items-center gap-2 rounded-md bg-[#c9a84c] px-5 py-3 text-sm font-bold text-[#151827] transition hover:bg-[#d9ba65]"
                            >
                                {t.signup as string}
                                <Icon size={16} aria-hidden="true" />
                            </Link>
                            <Link
                                href={localizedAppPath(locale, "/login")}
                                className="inline-flex items-center gap-2 rounded-md border border-[#1a1a2e] px-5 py-3 text-sm font-bold text-[#1a1a2e] transition hover:bg-[#1a1a2e] hover:text-white"
                            >
                                {t.login as string}
                            </Link>
                            <Link
                                href={localizedPath(locale, "/contact")}
                                className="inline-flex items-center gap-2 rounded-md border border-[#c9a84c] px-5 py-3 text-sm font-bold text-[#7b6220] transition hover:bg-[#fbf4db]"
                            >
                                {t.contact as string}
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center justify-center rounded-md border border-[#ded6c3] bg-white p-0 shadow-sm">
                        <img
                            src="/agd-hero-logo.png"
                            alt="AGD LAW AI"
                            className="h-auto max-h-[560px] w-full rounded-md object-contain"
                        />
                    </div>
                </div>
            </section>

            <section id="identity" className="mx-auto max-w-7xl px-5 py-16 md:px-8">
                <p className="text-sm font-bold text-[#8d7330]">{t.identityKicker as string}</p>
                <h2 className="mt-3 max-w-3xl text-3xl font-extrabold text-[#151827] md:text-4xl">
                    {t.identityTitle as string}
                </h2>
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

            <section id="how-it-works" className="bg-[#fdfcf8]">
                <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
                    <div className="max-w-3xl">
                        <p className="text-sm font-bold text-[#8d7330]">{t.howItWorksTitle as string}</p>
                        <h2 className="mt-3 text-3xl font-extrabold text-[#151827] md:text-4xl">
                            {t.howItWorksIntro as string}
                        </h2>
                    </div>
                    <div className="mt-9 grid gap-5 lg:grid-cols-2">
                        {(t.howItWorksItems as string[][]).map(([title, body], index) => (
                            <article key={title} className="overflow-hidden rounded-md border border-[#ded6c3] bg-white">
                                <div className="bg-[#e4e7eb] p-4 md:p-6">
                                    <img
                                        src={howItWorksImages[index]}
                                        alt={title}
                                        className="aspect-[16/11] w-full rounded-md object-cover object-top shadow-sm"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-2xl font-extrabold text-[#151827]">{title}</h3>
                                    <p className="mt-3 leading-8 text-[#55565c]">{body}</p>
                                </div>
                            </article>
                        ))}
                    </div>
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
                        <h2 className="mt-3 text-3xl font-extrabold text-[#151827] md:text-4xl">
                            {t.pricingIntro as string}
                        </h2>
                    </div>
                    <div className="mt-9 grid gap-4 lg:grid-cols-4">
                        {plans[locale].map((plan) => (
                            <article
                                key={plan.id}
                                className={`rounded-md border p-6 ${
                                    plan.featured
                                        ? "border-[#c9a84c] bg-[#1a1a2e] text-white shadow-lg"
                                        : "border-[#ded6c3] bg-white text-[#151827]"
                                }`}
                            >
                                <p className={`text-sm font-bold ${plan.featured ? "text-[#c9a84c]" : "text-[#8d7330]"}`}>
                                    {plan.body}
                                </p>
                                <h3 className="mt-2 text-2xl font-extrabold">{plan.name}</h3>
                                <div className="mt-5">
                                    <span className="text-3xl font-extrabold">{plan.price}</span>
                                    <span className={`mx-2 text-sm ${plan.featured ? "text-white/70" : "text-[#666]"}`}>
                                        {plan.cadence}
                                    </span>
                                </div>
                                <ul className="mt-6 space-y-3">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2 text-sm leading-6">
                                            <Check
                                                size={16}
                                                className={`mt-1 shrink-0 ${plan.featured ? "text-[#c9a84c]" : "text-[#2e7d63]"}`}
                                                aria-hidden="true"
                                            />
                                            <span className={plan.featured ? "text-white/85" : "text-[#4d4f57]"}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <SubscribeButton
                                    plan={plan}
                                    locale={locale}
                                    label={
                                        plan.id === "free"
                                            ? (t.freeCta as string)
                                            : (t.choose as string)
                                    }
                                />
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#1a1a2e] text-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-8">
                    <h2 className="max-w-3xl text-3xl font-extrabold">{t.finalTitle as string}</h2>
                    <Link
                        href={localizedAppPath(locale, "/login?callbackUrl=/assistant")}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-[#1a1a2e] transition hover:bg-[#f2ead7]"
                    >
                        {t.finalCta as string}
                        <Icon size={16} aria-hidden="true" />
                    </Link>
                </div>
            </section>
        </main>
    );
}
