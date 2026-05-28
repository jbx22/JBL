export type BillingPlanId = "explorer" | "business" | "founder_pro" | "enterprise";

export type BillingPlan = {
    id: BillingPlanId;
    tier: string;
    amountHalalas: number;
    descriptionAr: string;
    descriptionEn: string;
    monthlyAiRequests: number;
    allowedModels: string[];
};

export const BILLING_PLANS: Record<BillingPlanId, BillingPlan> = {
    explorer: {
        id: "explorer",
        tier: "Explorer",
        amountHalalas: 0,
        descriptionAr: "AGD LAW AI المستكشف - مجاني",
        descriptionEn: "AGD LAW AI Explorer - Free",
        monthlyAiRequests: 5,
        allowedModels: ["DeepSeek V4 Flash"],
    },
    business: {
        id: "business",
        tier: "Business",
        amountHalalas: 11000,
        descriptionAr: "AGD LAW AI باقة الأعمال - شهري",
        descriptionEn: "AGD LAW AI Business subscription - monthly",
        monthlyAiRequests: 100,
        allowedModels: ["DeepSeek V4 Flash"],
    },
    founder_pro: {
        id: "founder_pro",
        tier: "Founder Pro",
        amountHalalas: 37000,
        descriptionAr: "AGD LAW AI باقة المؤسس الاحترافية - شهري",
        descriptionEn: "AGD LAW AI Founder Pro subscription - monthly",
        monthlyAiRequests: 999999,
        allowedModels: ["DeepSeek V4 Flash"],
    },
    enterprise: {
        id: "enterprise",
        tier: "Enterprise",
        amountHalalas: 0,
        descriptionAr: "AGD LAW AI المؤسسات - تسعير مخصص",
        descriptionEn: "AGD LAW AI Enterprise - Custom pricing",
        monthlyAiRequests: 999999,
        allowedModels: ["DeepSeek V4 Flash"],
    },
};

export type TierPolicy = {
    tier: string;
    monthlyAiRequests: number;
    deepseek: boolean;
    openai: boolean;
};

export const TIER_POLICIES: Record<string, TierPolicy> = {
    Free: {
        tier: "Free",
        monthlyAiRequests: 0,
        deepseek: false,
        openai: false,
    },
    Explorer: {
        tier: "Explorer",
        monthlyAiRequests: 5,
        deepseek: true,
        openai: false,
    },
    Business: {
        tier: "Business",
        monthlyAiRequests: 100,
        deepseek: true,
        openai: false,
    },
    "Founder Pro": {
        tier: "Founder Pro",
        monthlyAiRequests: 999999,
        deepseek: true,
        openai: false,
    },
    Enterprise: {
        tier: "Enterprise",
        monthlyAiRequests: 999999,
        deepseek: true,
        openai: false,
    },
};

export function normalizeTier(tier: string | null | undefined): keyof typeof TIER_POLICIES {
    if (tier && tier in TIER_POLICIES) return tier as keyof typeof TIER_POLICIES;
    return "Free";
}

export function normalizePlanId(planId: string | null | undefined): BillingPlanId {
    if (planId === "professional") return "business";
    if (planId && planId in BILLING_PLANS) return planId as BillingPlanId;
    return "explorer";
}

export function getTierPolicy(tier: string | null | undefined): TierPolicy {
    return TIER_POLICIES[normalizeTier(tier)];
}

export function getBillingPlan(id: string | null | undefined): BillingPlan | null {
    if (!id) return null;
    return BILLING_PLANS[id as BillingPlanId] ?? BILLING_PLANS[normalizePlanId(id)] ?? null;
}

