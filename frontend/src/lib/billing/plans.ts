export type BillingPlanId = "professional" | "business" | "enterprise";

export type BillingPlan = {
    id: BillingPlanId;
    tier: string;
    amountHalalas: number;
    descriptionAr: string;
    descriptionEn: string;
};

export const BILLING_PLANS: Record<BillingPlanId, BillingPlan> = {
    professional: {
        id: "professional",
        tier: "Professional",
        amountHalalas: 9900,
        descriptionAr: "اشتراك JBL BIZ LAW المهني - شهري",
        descriptionEn: "JBL BIZ LAW Professional subscription - monthly",
    },
    business: {
        id: "business",
        tier: "Business",
        amountHalalas: 29900,
        descriptionAr: "اشتراك JBL BIZ LAW للأعمال - شهري",
        descriptionEn: "JBL BIZ LAW Business subscription - monthly",
    },
    enterprise: {
        id: "enterprise",
        tier: "Enterprise",
        amountHalalas: 99900,
        descriptionAr: "دفعة تواصل أولية لخطة JBL BIZ LAW المؤسسية",
        descriptionEn: "Initial JBL BIZ LAW Enterprise engagement payment",
    },
};

export function getBillingPlan(id: string | null | undefined): BillingPlan | null {
    if (!id) return null;
    return BILLING_PLANS[id as BillingPlanId] ?? null;
}
