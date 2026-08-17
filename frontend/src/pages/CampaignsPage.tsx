import { Link } from "react-router-dom";
import useSWR from "swr";
import { Reveal } from "@/components/Reveal";
import { ProgressBar } from "@/components/ProgressBar";
import { listCampaigns } from "@/config/api/campaign.api";
import { getAssetUrl } from "@/Utils/constant";

const formatAmount = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function CampaignsPage() {
  const { data, isLoading, error } = useSWR("campaigns-limit-50", () => listCampaigns({ limit: 50 }));
  const campaigns = data?.campaigns ?? [];

  return (
    <>
      <section className="bg-warm pt-36 pb-20 md:pt-44 md:pb-28">
        <div className="max-w-container mx-auto px-6 text-center">
          <Reveal as="p" className="label-text text-accent mb-8">
            ●&nbsp; CAMPAIGNS
          </Reveal>
          <Reveal as="h1" className="reveal-delay-1 font-serif text-[48px] md:text-[72px] lg:text-[88px] text-[#111111] leading-[1.05] tracking-tight">
            Support a Cause.
            <br />
            <span className="text-accent">Change a Life.</span>
          </Reveal>
          <Reveal as="p" className="reveal-delay-2 mt-8 text-base md:text-lg text-[#111111]/50 max-w-[600px] mx-auto leading-relaxed">
            Every contribution, no matter how small, helps us bring meaningful change to communities that need it most.
          </Reveal>
        </div>
      </section>

      {isLoading && (
        <section className="bg-warm-alt py-16 border-t border-[#111111]/[0.04]">
          <p className="text-center text-sm text-[#111111]/30">Loading campaigns…</p>
        </section>
      )}

      {error && (
        <section className="bg-warm-alt py-16 border-t border-[#111111]/[0.04]">
          <p className="text-center text-sm text-accent">Couldn't load campaigns right now. Please try again later.</p>
        </section>
      )}

      {/* ===== ALL CAMPAIGNS GRID ===== */}
      {!isLoading && !error && (
        <section className="bg-warm py-28 md:py-36 border-t border-[#111111]/[0.04]">
          <div className="max-w-container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <Reveal as="p" className="label-text text-accent mb-6">
                ●&nbsp; ACTIVE CAMPAIGNS
              </Reveal>
              <Reveal as="h2" className="reveal-delay-1 font-serif text-[36px] md:text-[48px] lg:text-[56px] text-[#111111] leading-[1.1] tracking-tight mb-6">
                Choose a Cause to Support
              </Reveal>
              <Reveal as="p" className="reveal-delay-2 text-base text-[#111111]/45 leading-relaxed">
                Browse our active campaigns and support the initiatives that resonate with you.
              </Reveal>
            </div>

            {campaigns.length === 0 && (
              <p className="text-center text-sm text-[#111111]/30">No active campaigns at the moment. Check back soon.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((c, i) => (
                <Reveal
                  key={c._id}
                  className={`campaign-card card-lift rounded-sm overflow-hidden group relative ${
                    c.isFeatured ? "border-2 border-accent" : "border border-[#111111]/[0.07] hover:border-[#111111]/12"
                  } ${i % 3 > 0 ? `reveal-delay-${i % 3}` : ""}`}
                >
                  {c.isFeatured && (
                    <span className="label-text bg-accent text-white px-3 py-1 rounded-sm absolute top-4 right-4 z-10 text-[10px]">Featured</span>
                  )}
                  <Link to={`/campaigns/${c._id}`} className="block overflow-hidden">
                    <img
                      src={getAssetUrl(c.coverImage) || `https://picsum.photos/seed/${c.slug}/600/380.jpg`}
                      alt={c.title}
                      className="campaign-img w-full h-[200px] md:h-[220px] object-cover"
                      loading="lazy"
                    />
                  </Link>
                  <div className={`p-6 ${c.isFeatured ? "bg-accent/[0.02]" : ""}`}>
                    <h3 className="font-serif text-xl text-[#111111] mb-2 text-center">
                      <Link to={`/campaigns/${c._id}`} className="hover:text-accent transition-colors duration-300">
                        {c.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-[#111111]/40 leading-relaxed mb-5 text-center">{c.shortDescription}</p>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-[#111111]/50">{formatAmount(c.raisedAmount)} Raised</span>
                        <span className="text-accent font-medium">{c.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#111111]/[0.06] rounded-full overflow-hidden">
                        <ProgressBar target={`${c.progress}%`} />
                      </div>
                      <p className="text-xs text-[#111111]/25 mt-1.5 text-center">of {formatAmount(c.goalAmount)} goal</p>
                    </div>
                    <div className="text-center">
                      {c.progress >= 100 ? (
                        <p className="text-sm font-medium text-accent">Goal Reached 🎉</p>
                      ) : (
                        <Link to={`/donate?campaignId=${c._id}`} className="text-sm font-medium text-accent hover:text-[#d93a56] transition-colors duration-300">
                          Support This Campaign <span className="inline-block ml-1">→</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {campaigns.length > 0 && (
              <Reveal as="p" className="text-center text-xs text-[#111111]/25 mt-12 tracking-wide">
                100% secure contributions &nbsp;•&nbsp; Trusted by our supporters &nbsp;•&nbsp; Tax-deductible donations
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* ===== HOW YOUR SUPPORT HELPS ===== */}
      <section className="bg-warm-alt py-28 md:py-36 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6 text-center">
          <Reveal as="p" className="label-text text-accent mb-6">
            HOW YOUR SUPPORT HELPS
          </Reveal>
          <Reveal as="h2" className="reveal-delay-1 font-serif text-[36px] md:text-[48px] lg:text-[56px] text-[#111111] leading-[1.1] tracking-tight mb-20">
            Making a Difference Is Simple
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-6 max-w-4xl mx-auto">
            {[
              { n: "01", title: "Choose a Cause", desc: "Browse our campaigns and select the one that resonates with you." },
              { n: "02", title: "Make a Contribution", desc: "Donate securely through UPI, QR code, or bank transfer." },
              { n: "03", title: "We Verify & Execute", desc: "Your contribution is verified and directed to the campaign." },
              { n: "04", title: "See Your Impact", desc: "Receive updates on how your support made a difference." },
            ].map((s, i) => (
              <Reveal key={s.n} className={i > 0 ? `reveal-delay-${i}` : ""}>
                <div className="step-circle w-14 h-14 rounded-full border-2 border-accent flex items-center justify-center mb-6 mx-auto cursor-default">
                  <span className="font-sans font-semibold text-accent text-sm transition-colors duration-400">{s.n}</span>
                </div>
                <h3 className="font-serif text-2xl text-[#111111] mb-2">{s.title}</h3>
                <p className="text-sm text-[#111111]/40 leading-relaxed">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-warm py-28 md:py-36">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal as="h2" className="font-serif text-[36px] md:text-[48px] lg:text-[56px] text-[#111111] leading-[1.1] tracking-tight mb-6">
              Can't find a cause?
              <br />
              <span className="text-accent">Start your own.</span>
            </Reveal>
            <Reveal as="p" className="reveal-delay-1 text-base text-[#111111]/45 leading-relaxed mb-10 max-w-lg mx-auto">
              Have an idea for a campaign? We'd love to hear from you. Let's work together to create meaningful change.
            </Reveal>
            <Reveal className="reveal-delay-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contact"
                className="btn-press bg-accent text-white text-sm font-medium px-8 py-3.5 rounded-sm hover:bg-[#d93a56] hover:shadow-lg hover:shadow-accent/20 transition-all duration-400"
              >
                Get in Touch <span className="inline-block ml-1">→</span>
              </Link>
              <Link
                to="/contact"
                className="btn-press bg-[#111111] text-white text-sm font-medium px-8 py-3.5 rounded-sm hover:bg-[#1a1a1c] hover:shadow-lg hover:shadow-[#111111]/15 transition-all duration-400"
              >
                Become a Volunteer <span className="inline-block ml-1">→</span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
