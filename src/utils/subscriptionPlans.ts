import { useContext } from "react";
import { DataContext } from "~/store/GlobalState";

/** Display order for subscription tiers (matches backend plan names). */
export const PLAN_ORDER = [
  "Free",
  "Pro",
  "Pro Plus",
  "Business",
  "Enterprise",
] as const;

export type PlanName = (typeof PLAN_ORDER)[number];

/**
 * Hook to access subscription plans from global state
 */
export const useGetSubscriptionPlans = () => {
  const { state } = useContext(DataContext);

  return {
    subscriptionPlans: state?.subscriptionPlans,
    isLoading: !state?.subscriptionPlans,
  };
};

export const useGetCurrentSubscription = () => {
  const { state } = useContext(DataContext);

  return {
    currentSubscription: state?.currentSubscription,
    isLoading: !state?.currentSubscription,
  };
};

/** Matches GET /subscriptions/plans response items */
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  fee: number;
  credits: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlansResponse {
  data: SubscriptionPlan[];
  success: boolean;
  message?: string;
}

const normalizePlanName = (name: string): string => {
  const key = name.trim().toLowerCase();
  const map: Record<string, string> = {
    free: "Free",
    pro: "Pro",
    "pro plus": "Pro Plus",
    business: "Business",
    enterprise: "Enterprise",
  };
  return map[key] ?? name.trim();
};

/**
 * Benefits shown on plan cards — sourced from the API `benefits` array only.
 */
export const getPlanBenefits = (plan: SubscriptionPlan): string[] => {
  return (plan.benefits || []).filter(
    (benefit) => typeof benefit === "string" && benefit.trim().length > 0
  );
};

export const normalizeSubscriptionPlan = (
  plan: SubscriptionPlan
): SubscriptionPlan => ({
  ...plan,
  name: normalizePlanName(plan.name),
  description: plan.description?.trim() ?? "",
  benefits: getPlanBenefits(plan),
});

export const normalizeSubscriptionPlans = (
  plans: SubscriptionPlan[]
): SubscriptionPlan[] => plans.map(normalizeSubscriptionPlan);

export const subscriptionPlanUtils = {
  getPlanTierIndex: (planName: string): number => {
    const normalized = normalizePlanName(planName);
    const index = PLAN_ORDER.indexOf(normalized as PlanName);
    return index === -1 ? -1 : index;
  },

  isPopularPlan: (plan: SubscriptionPlan): boolean => {
    return normalizePlanName(plan.name) === "Business";
  },

  getPlanFeatures: (plan: SubscriptionPlan): string[] => {
    return getPlanBenefits(plan);
  },

  /** Sort: Free → Pro → Pro Plus → Business → Enterprise, then by fee */
  sortPlansByPrice: (plans: SubscriptionPlan[]): SubscriptionPlan[] => {
    return [...plans].sort((a, b) => {
      const aIndex = subscriptionPlanUtils.getPlanTierIndex(a.name);
      const bIndex = subscriptionPlanUtils.getPlanTierIndex(b.name);

      if (aIndex !== -1 && bIndex !== -1 && aIndex !== bIndex) {
        return aIndex - bIndex;
      }

      return a.fee - b.fee;
    });
  },
};

/** @deprecated Use normalizeSubscriptionPlans */
export const transformPricingData = normalizeSubscriptionPlans;
