// lib/plans.ts — single source of truth for plan rules

export type ShopPlanInfo = {
  plan: string
  planExpiresAt: Date | string | null
  active: boolean
  freeLimit?: number | null
}

export function isPlanActive(shop: ShopPlanInfo): boolean {
  if (!shop.active) return false
  if (shop.plan === 'free') return true         // free never expires
  if (!shop.planExpiresAt) return true           // no expiry = permanent
  return new Date(shop.planExpiresAt) > new Date()
}

// Returns the customer limit for this shop.
// Free plan: uses admin-set freeLimit (default 50 if null/undefined)
// Paid plans: unlimited (Infinity)
export function getCustomerLimit(shop: { plan: string; freeLimit?: number | null }): number {
  if (shop.plan !== 'free') return Infinity
  // Use ?? not || so that freeLimit=0 is respected (though 0 means no customers allowed)
  return shop.freeLimit ?? 50
}

// Returns true if a new customer can be added
export function canAddCustomer(shop: { plan: string; freeLimit?: number | null }, currentCount: number): boolean {
  const limit = getCustomerLimit(shop)
  return currentCount < limit
}
