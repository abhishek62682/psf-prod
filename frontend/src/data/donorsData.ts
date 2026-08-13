// Donor list itself is now populated live from GET /api/donations (see
// src/config/api/donation.api.ts) — this file only keeps the display
// helpers shared by the donor row UI.

export const formatCurrency = (amount: number) => "₹" + amount.toLocaleString("en-IN");

const trimTrailingZeros = (value: number): string => {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
};

// Thousand -> Lakh -> Crore. Used for the "Total Raised" stat only —
// individual donation rows keep the exact amount.
export const formatCurrencyShort = (amount: number): string => {
  const value = Math.max(0, amount);

  if (value >= 1_00_00_000) return `₹${trimTrailingZeros(value / 1_00_00_000)} Cr`;
  if (value >= 1_00_000) return `₹${trimTrailingZeros(value / 1_00_000)} Lakh`;
  if (value >= 1_000) return `₹${trimTrailingZeros(value / 1_000)} Thousand`;
  return formatCurrency(value);
};

export const formatDonorDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export const getInitials = (name: string) => {
  if (name === "Anonymous") return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name[0].toUpperCase();
};

const avatarColors = [
  "bg-accent/10 text-accent",
  "bg-lavender/30 text-[#7B6CB0]",
  "bg-[#111111]/[0.06] text-[#111111]/50",
  "bg-accent/15 text-accent",
  "bg-lavender/20 text-[#8B7EC8]",
];

export const getAvatarColor = (name: string) => {
  if (name === "Anonymous") return "bg-[#111111]/[0.06] text-[#111111]/30";
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};
