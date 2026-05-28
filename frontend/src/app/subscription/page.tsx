"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { BILLING_PLANS, type BillingPlanId } from "@/lib/billing/plans";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const arPayment: Record<string, string> = {
  login_required: "سجل الدخول أو أنشئ حساباً قبل اختيار الباقة حتى نربط الاشتراك بحسابك.",
  moyasar_not_configured: "بوابة الدفع غير مفعلة بعد. أضف مفتاح Moyasar السري في إعدادات الإنتاج لتفعيل الدفع.",
  moyasar_error: "تعذر إنشاء فاتورة الدفع. حاول مرة أخرى أو تواصل مع الدعم.",
  invalid_plan: "الباقة المحددة غير صحيحة. اختر إحدى الباقات المعروضة.",
  success: "تم استلام الدفع. سيتم تحديث باقتك تلقائياً عند تأكيد Moyasar للعملية.",
  pending: "عملية الدفع معلقة. سيتم تحديث باقتك عند تأكيد الدفع.",
};

const enPayment: Record<string, string> = {
  login_required: "Sign in or create an account before selecting a plan so we can link the subscription to your account.",
  moyasar_not_configured: "Payment gateway is not configured yet. Add your Moyasar secret key in production settings to enable payment.",
  moyasar_error: "Failed to create payment invoice. Try again or contact support.",
  invalid_plan: "The selected plan is invalid. Choose one of the available plans.",
  success: "Payment received. Your plan will be updated automatically once Moyasar confirms the transaction.",
  pending: "Payment is pending. Your plan will be updated once payment is confirmed.",
};

const content = {
  ar: {
    dir: "rtl",
    title: "باقات الاشتراك",
    subtitle: "اختر الباقة المناسبة لاحتياجاتك القانونية والذكاء الاصطناعي",
    currentPlan: (tier: string) => `باقتك الحالية: ${tier}. استخدام الذكاء الاصطناعي متاح للعضوية المدفوعة فقط، ويعمل داخل AGD LAW AI عبر DeepSeek V4 Flash.`,
    currentBadge: "الباقة الحالية",
    subscribe: "اشترك الآن",
    redirecting: "جارٍ التحويل إلى Moyasar",
    poweredBy: "تتم معالجة المدفوعات عبر Moyasar. بعد نجاح الدفع يتم تحديث الباقة تلقائياً.",
    plans: [
      {
        id: "explorer" as BillingPlanId,
        name: "المستكشف",
        audience: "للمستقلين والطلاب والمستخدمين الجدد",
        price: "مجاني",
        cadence: "",
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
        id: "business" as BillingPlanId,
        name: "الأعمال",
        audience: "للشركات الناشئة والمتاجر والوكالات والمستشارين",
        price: "$29",
        cadence: "شهرياً",
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
        id: "founder_pro" as BillingPlanId,
        name: "المؤسس الاحترافية",
        audience: "للمؤسسين والشركات الصغيرة والمتوسطة والشركات الدولية",
        price: "$99",
        cadence: "شهرياً",
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
        id: "enterprise" as BillingPlanId,
        name: "المؤسسات",
        audience: "لمكاتب المحاماة والشركات الكبرى والجهات الحكومية",
        price: "مخصص",
        cadence: "",
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
  },
  en: {
    dir: "ltr",
    title: "Subscription Tiers",
    subtitle: "Choose the plan that fits your legal and AI needs",
    currentPlan: (tier: string) => `Your current plan: ${tier}. AI usage is available for paid memberships and works inside AGD LAW AI via DeepSeek V4 Flash.`,
    currentBadge: "Current Plan",
    subscribe: "Subscribe Now",
    redirecting: "Redirecting to Moyasar",
    poweredBy: "Payments are processed via Moyasar. Your plan updates automatically after successful payment.",
    plans: [
      {
        id: "explorer" as BillingPlanId,
        name: "Explorer",
        audience: "For freelancers, students, and first-time users",
        price: "Free",
        cadence: "",
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
        id: "business" as BillingPlanId,
        name: "Business",
        audience: "For startups, consultants, ecommerce, and agencies",
        price: "$29",
        cadence: "/month",
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
        id: "founder_pro" as BillingPlanId,
        name: "Founder Pro",
        audience: "For founders, SMEs, and cross-border businesses",
        price: "$99",
        cadence: "/month",
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
        id: "enterprise" as BillingPlanId,
        name: "Enterprise",
        audience: "For law firms, enterprises, governments, and holding groups",
        price: "Custom",
        cadence: "",
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
  },
};

export default function SubscriptionPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, authLoading } = useAuth();
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState<string | null>(null);
  const currentTier = profile?.tier || "Free";
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const payment = searchParams.get("payment");
  const selectedPlan = searchParams.get("plan");

  const locale =
    pathname === "/en" ||
    pathname?.startsWith("/en/") ||
    searchParams.get("lang") === "en"
      ? "en"
      : "ar";

  const t = content[locale];
  const paymentMsgs: Record<string, string> = locale === "ar" ? arPayment : enPayment;

  const orderedPlans = selectedPlan
    ? [...t.plans].sort((a, b) => {
        if (a.id === selectedPlan) return -1;
        if (b.id === selectedPlan) return 1;
        return 0;
      })
    : t.plans;

  const handleSubscribe = async (planId: BillingPlanId) => {
    if (!authLoading && !isAuthenticated) {
      const callbackUrl = `/subscription?plan=${planId}${locale === "en" ? "&lang=en" : ""}`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}${locale === "en" ? "&lang=en" : ""}`);
      return;
    }

    if (planId === "enterprise") {
      router.push(locale === "en" ? "/en/contact" : "/contact");
      return;
    }

    setLoading(planId);
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/billing/moyasar/checkout";

    const planInput = document.createElement("input");
    planInput.type = "hidden";
    planInput.name = "plan";
    planInput.value = planId;
    form.appendChild(planInput);

    const localeInput = document.createElement("input");
    localeInput.type = "hidden";
    localeInput.name = "locale";
    localeInput.value = locale;
    form.appendChild(localeInput);

    document.body.appendChild(form);
    form.submit();
    setTimeout(() => setLoading(null), 5000);
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-8 md:px-8" dir={t.dir}>
      <div className="rounded-md border border-[#ded6c3] bg-[#fdfcf8] p-6">
        <p className="text-sm font-bold text-[#8d7330]">{t.title}</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#151827]">
          {t.subtitle}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#55565c]">
          {t.currentPlan(currentTier)}
        </p>
      </div>

      {payment && paymentMsgs[payment] && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {paymentMsgs[payment]}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-4">
        {orderedPlans.map((plan) => {
          const def = BILLING_PLANS[plan.id];
          const isCurrent = currentTier.toLowerCase() === def.tier.toLowerCase();
          const featured = plan.featured || plan.id === selectedPlan;
          const isEnterprise = plan.id === "enterprise";
          return (
            <div
              key={plan.id}
              className={`flex flex-col rounded-md border p-6 ${
                featured
                  ? "border-[#c9a84c] bg-[#1a1a2e] text-white shadow-lg"
                  : "border-[#ded6c3] bg-white text-[#151827]"
              }`}
            >
              <p className={`text-sm font-bold ${featured ? "text-[#c9a84c]" : "text-[#8d7330]"}`}>{plan.audience}</p>
              <h3 className="mt-2 text-2xl font-extrabold">{plan.name}</h3>
              <div className="mt-5">
                <span className="text-3xl font-extrabold">{plan.price}</span>
                {plan.cadence && (
                  <span className={`mx-2 text-sm ${featured ? "text-white/70" : "text-[#666]"}`}>
                    {plan.cadence}
                  </span>
                )}
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm leading-6">
                    <Check
                      size={16}
                      className={`mt-1 shrink-0 ${featured ? "text-[#c9a84c]" : "text-[#2e7d63]"}`}
                      aria-hidden="true"
                    />
                    <span className={featured ? "text-white/85" : "text-[#4d4f57]"}>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                disabled={isCurrent || loading === plan.id || authLoading}
                onClick={() => handleSubscribe(plan.id)}
                className={`mt-7 flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-bold transition ${
                  isCurrent
                    ? "cursor-not-allowed bg-gray-200 text-gray-500"
                    : featured
                      ? "bg-[#c9a84c] text-[#151827] hover:bg-[#d9ba65]"
                      : "border border-[#1a1a2e] text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white"
                }`}
              >
                {loading === plan.id ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> {t.redirecting}
                  </>
                ) : isCurrent ? (
                  t.currentBadge
                ) : isEnterprise ? (
                  <>{locale === "ar" ? "تواصل معنا" : "Contact Sales"}</>
                ) : (
                  <>
                    {t.subscribe} <ArrowLeft size={14} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-500">
        {t.poweredBy}
      </p>
    </div>
  );
}
