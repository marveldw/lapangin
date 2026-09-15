export const PLAN_NAMES = {
  FREE: 'FREE',
  BASIC: 'BASIC',
  PRO: 'PRO',
} as const;

export type PlanName = (typeof PLAN_NAMES)[keyof typeof PLAN_NAMES];

export const PLAN_COURT_LIMITS: Record<string, number | null> = {
  [PLAN_NAMES.FREE]: 1,
  [PLAN_NAMES.BASIC]: 5,
  [PLAN_NAMES.PRO]: null, // null indicates unlimited courts
};

export interface SubscriptionInfo {
  plan_id?: number | null;
  plan_name?: string | null;
  max_courts?: number | null;
  max_bookings_per_month?: number | null;
  status?: string | null;
}

/**
 * Resolves maximum courts allowed based on subscription.
 * Returns null for unlimited (PRO plan), or an integer limit (1 for FREE, 5 for BASIC).
 */
export function getMaxCourtsAllowed(subscription?: SubscriptionInfo | null): number | null {
  if (!subscription || (subscription.status && subscription.status !== 'ACTIVE')) {
    return PLAN_COURT_LIMITS[PLAN_NAMES.FREE];
  }

  const planName = (subscription.plan_name || '').trim().toUpperCase();

  // PRO plan is strictly unlimited
  if (planName === PLAN_NAMES.PRO) {
    return null;
  }

  // If subscription has a numeric max_courts value (e.g. 5 for BASIC, 1 for FREE)
  if (subscription.max_courts !== undefined && subscription.max_courts !== null) {
    return subscription.max_courts;
  }

  // Fallback by plan name lookup
  if (planName in PLAN_COURT_LIMITS) {
    return PLAN_COURT_LIMITS[planName];
  }

  // Default fallback to Free limit
  return PLAN_COURT_LIMITS[PLAN_NAMES.FREE];
}

/**
 * Check if court at a given 0-indexed position should be locked/restricted.
 */
export function isCourtRestricted(index: number, maxCourts: number | null): boolean {
  if (maxCourts === null) {
    return false; // Unlimited plans never have locked courts
  }
  return index >= maxCourts;
}

/**
 * Check if court creation quota has been reached.
 */
export function isCourtQuotaExceeded(currentCount: number, maxCourts: number | null): boolean {
  if (maxCourts === null) {
    return false; // Unlimited plans never exceed quota
  }
  return currentCount >= maxCourts;
}
