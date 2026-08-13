import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (n?: number | null): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n ?? 0)

// Rounds to 2 decimal places and drops them entirely when the result is a
// whole number, so 20.00 -> "20" but 5.5 -> "5.50" (consistent precision,
// no trailing ".00" clutter).
const trimTrailingZeros = (value: number): string => {
  const rounded = Math.round(value * 100) / 100
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2)
}

// Indian short-number format: Thousand -> Lakh -> Crore, computed dynamically
// from the actual amount (never hardcoded). Below ₹1,000 falls back to the
// exact formatted amount since a short form wouldn't be meaningfully shorter.
// This is the single source of truth for amount display across the app —
// use it instead of formatCurrency wherever a value is just being shown
// (not edited).
export const formatIndianCurrencyShort = (n?: number | null): string => {
  const amount = Math.max(0, n ?? 0)

  if (amount >= 1_00_00_000) return `₹${trimTrailingZeros(amount / 1_00_00_000)} Cr`
  if (amount >= 1_00_000) return `₹${trimTrailingZeros(amount / 1_00_000)} Lakh`
  if (amount >= 1_000) return `₹${trimTrailingZeros(amount / 1_000)} Thousand`
  return formatCurrency(amount)
}
