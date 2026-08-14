import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Reveal } from "@/components/Reveal";
import { useFetch } from "@/hooks/useFetch";
import { formatCurrency, formatCurrencyShort, formatDonorDate, getInitials, getAvatarColor } from "@/data/donorsData";
import { listDonations } from "@/config/api/donation.api";
import { Icon } from "@iconify/react";

const PER_PAGE = 20;

export function DonorsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const listRef = useRef<HTMLDivElement | null>(null);

  // Debounce the search box so every keystroke doesn't hit the API.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, error } = useFetch(
    () => listDonations({ page, limit: PER_PAGE, search: search || undefined }),
    [page, search]
  );

  const donations = data?.donations ?? [];
  const stats = data?.stats ?? null;
  const pagination = data?.pagination ?? null;
  const loading = isLoading;

  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;
  const start = ((pagination?.page ?? 1) - 1) * PER_PAGE;

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pageNumbers: (number | "…")[] = [];
  if (totalPages > 7) {
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pageNumbers.push(i);
      else if (i === page - 2 || i === page + 2) pageNumbers.push("…");
    }
  } else {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  }

  return (
    <>
      <section className="bg-warm pt-36 pb-20 md:pt-44 md:pb-28">
        <div className="max-w-container mx-auto px-6 text-center">
          <Reveal as="p" className="label-text text-accent mb-8">
            ●&nbsp; DONORS
          </Reveal>
          <Reveal as="h1" className="reveal-delay-1 font-serif text-[48px] md:text-[72px] lg:text-[88px] text-[#111111] leading-[1.05] tracking-tight">
            People Who
            <br />
            <span className="text-accent">Care.</span>
          </Reveal>
          <Reveal as="p" className="reveal-delay-2 mt-8 text-base md:text-lg text-[#111111]/50 max-w-[600px] mx-auto leading-relaxed">
            Every contribution matters. We're grateful to each supporter who believes in building a better tomorrow.
          </Reveal>
        </div>
      </section>

      <section id="supporters" className="bg-warm-alt py-16 md:py-24 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6">
          <Reveal className="max-w-xl mx-auto mb-12">
            <div className="relative">
              <Icon icon="lucide:search" className="w-5 h-5 text-[#111111]/25 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="search-input w-full pl-12 pr-4 py-3.5 bg-warm border border-[#111111]/[0.08] rounded-sm text-sm text-[#111111] placeholder-[#111111]/30 outline-none"
                placeholder="Search supporters..."
              />
            </div>
          </Reveal>

          <Reveal className="reveal-delay-1 flex flex-wrap items-center justify-center gap-8 md:gap-12 mb-12">
            <div className="text-center">
              <p className="font-serif text-3xl md:text-4xl text-[#111111]">{stats ? `${stats.totalSupporters}+` : "—"}</p>
              <p className="text-xs text-[#111111]/35 mt-1">Total Supporters</p>
            </div>
            <div className="w-px h-10 bg-[#111111]/[0.08] hidden md:block"></div>
            <div className="text-center">
              <p className="font-serif text-3xl md:text-4xl text-accent">{stats ? formatCurrencyShort(stats.totalRaised) : "—"}</p>
              <p className="text-xs text-[#111111]/35 mt-1">Total Raised</p>
            </div>
            <div className="w-px h-10 bg-[#111111]/[0.08] hidden md:block"></div>
            <div className="text-center">
              <p className="font-serif text-3xl md:text-4xl text-[#111111]">{stats ? stats.totalCampaigns : "—"}</p>
              <p className="text-xs text-[#111111]/35 mt-1">Campaigns Supported</p>
            </div>
          </Reveal>

          <div className="max-w-3xl mx-auto" ref={listRef}>
            {loading ? (
              <div className="text-center py-20">
                <Icon icon="lucide:loader-2" className="w-6 h-6 text-[#111111]/20 animate-spin inline-block" />
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-sm text-[#111111]/30">Couldn't load supporters. Please try again shortly.</p>
              </div>
            ) : donations.length === 0 ? (
              <div className="text-center py-20">
                <Icon icon="lucide:search-x" className="w-10 h-10 text-[#111111]/15 mx-auto block mb-4" />
                <p className="text-sm text-[#111111]/30">No supporters found matching your search.</p>
              </div>
            ) : (
              <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
                <div className="min-w-[640px]">
                  <div className="grid grid-cols-12 gap-4 px-4 md:px-6 py-3 mb-2">
                    <div className="col-span-4">
                      <span className="label-text text-[#111111]/25 text-[10px]">SUPPORTER</span>
                    </div>
                    <div className="col-span-4">
                      <span className="label-text text-[#111111]/25 text-[10px]">CAMPAIGN</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="label-text text-[#111111]/25 text-[10px]">AMOUNT</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="label-text text-[#111111]/25 text-[10px]">DATE</span>
                    </div>
                  </div>

                  <div className="border-t border-[#111111]/[0.06]">
                    {donations.map((donor, i) => (
                      <div
                        key={`${donor.name}-${start + i}`}
                        className="donor-row donor-fade-in grid grid-cols-12 gap-4 items-center px-4 md:px-6 py-4 border-b border-[#111111]/[0.04] rounded-sm cursor-default"
                        style={{ animationDelay: `${i * 0.03}s` }}
                      >
                        <div className="col-span-4 flex items-center gap-3">
                          <div className={`avatar-circle w-9 h-9 rounded-full ${getAvatarColor(donor.name)} text-xs shrink-0`}>{getInitials(donor.name)}</div>
                          <span className="text-sm font-medium text-[#111111] truncate">{donor.name}</span>
                        </div>
                        <div className="col-span-4">
                          <span className="text-sm text-[#111111]/40 truncate block">{donor.campaign?.title ?? "General Donation"}</span>
                        </div>
                        <div className="col-span-2 text-right">
                          <span className="text-sm font-medium text-[#111111]">{formatCurrency(donor.amount)}</span>
                        </div>
                        <div className="col-span-2 text-right">
                          <span className="text-xs text-[#111111]/30">{formatDonorDate(donor.date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && totalPages > 1 && donations.length > 0 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="page-btn w-9 h-9 rounded-sm border border-[#111111]/[0.08] flex items-center justify-center text-[#111111]/40"
                >
                  <Icon icon="lucide:chevron-left" className="w-4 h-4" />
                </button>
                {pageNumbers.map((p, i) =>
                  p === "…" ? (
                    <span key={`ellipsis-${i}`} className="w-6 h-9 flex items-center justify-center text-[#111111]/20 text-sm">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`page-btn w-9 h-9 rounded-sm border border-[#111111]/[0.08] flex items-center justify-center text-sm font-medium ${
                        p === page ? "active" : "text-[#111111]/50"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  className="page-btn w-9 h-9 rounded-sm border border-[#111111]/[0.08] flex items-center justify-center text-[#111111]/40"
                >
                  <Icon icon="lucide:chevron-right" className="w-4 h-4" />
                </button>
              </div>
            )}

            {!loading && !error && donations.length > 0 && (
              <p className="text-center text-xs text-[#111111]/25 mt-6">
                Showing {start + 1}–{Math.min(start + PER_PAGE, total)} of {total} supporters
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-warm py-28 md:py-36 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal as="h2" className="font-serif text-[36px] md:text-[48px] lg:text-[56px] text-[#111111] leading-[1.1] tracking-tight mb-6">
              Join the list of
              <br />
              <span className="text-accent">people who care.</span>
            </Reveal>
            <Reveal as="p" className="reveal-delay-1 text-base text-[#111111]/45 leading-relaxed mb-10 max-w-lg mx-auto">
              Your support, no matter the amount, directly impacts communities in need. Every rupee counts.
            </Reveal>
            <Reveal className="reveal-delay-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/donate"
                className="btn-press bg-accent text-white text-sm font-medium px-8 py-3.5 rounded-sm hover:bg-[#d93a56] hover:shadow-lg hover:shadow-accent/20 transition-all duration-400"
              >
                Donate Now <span className="inline-block ml-1">→</span>
              </Link>
              <Link
                to="/campaigns"
                className="btn-press bg-[#111111] text-white text-sm font-medium px-8 py-3.5 rounded-sm hover:bg-[#1a1a1c] hover:shadow-lg hover:shadow-[#111111]/15 transition-all duration-400"
              >
                View Campaigns <span className="inline-block ml-1">→</span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
