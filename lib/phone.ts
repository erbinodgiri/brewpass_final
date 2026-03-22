// Normalize any Nepal phone format to 10-digit local format
// +9779856066112 → 9856066112
// 9779856066112  → 9856066112
// 09856066112    → 9856066112
// 9856066112     → 9856066112 (unchanged)

export function normalizePhone(phone: string): string {
  // Remove spaces, dashes, parentheses
  let p = phone.replace(/[\s\-().]/g, '').trim()

  // Remove leading +
  if (p.startsWith('+')) p = p.slice(1)

  // Remove Nepal country code 977
  if (p.startsWith('977')) p = p.slice(3)

  // Remove leading 0
  if (p.startsWith('0')) p = p.slice(1)

  return p
}
