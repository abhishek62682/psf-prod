import type { RecentDonor } from "@/data/homeData";

function DonorCard({ donor }: { donor: RecentDonor }) {
  return (
    <div className="ticker-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-[#111111]">{donor.name}</span>
        <span className="text-accent font-semibold text-sm">{donor.amount}</span>
      </div>
      <p className="text-xs text-[#111111]/35 leading-relaxed mb-2.5">{donor.campaign}</p>
      <p className="text-[11px] text-[#111111]/25">{donor.date}</p>
    </div>
  );
}

// Duplicates the row once (matches original) so the CSS marquee animation
// loops seamlessly.
export function DonorTicker({ donors, reverse = false }: { donors: RecentDonor[]; reverse?: boolean }) {
  const doubled = [...donors, ...donors];
  return (
    <div className="ticker-viewport mb-4">
      <div className="ticker-viewport-left"></div>
      <div className="ticker-viewport-right"></div>
      <div className={`ticker-track ${reverse ? "ticker-track-reverse" : ""}`}>
        {doubled.map((donor, i) => (
          <DonorCard key={`${donor.name}-${i}`} donor={donor} />
        ))}
      </div>
    </div>
  );
}
