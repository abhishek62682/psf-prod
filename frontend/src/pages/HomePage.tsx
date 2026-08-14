import useSWR from "swr";
import { Link } from "react-router-dom";
import { Reveal } from "@/components/Reveal";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ProgressBar } from "@/components/ProgressBar";
import { DonorTicker } from "@/components/DonorTicker";
import { FaqAccordion } from "@/components/FaqAccordion";
import { homeFaqItems } from "@/data/homeData";
import type { RecentDonor } from "@/data/homeData";
import { getRecentDonations } from "@/config/api/donation.api";
import type { PublicDonation } from "@/config/api/donation.api";
import { listCampaigns } from "@/config/api/campaign.api";
import { getAssetUrl } from "@/Utils/constant";
import { Icon } from "@iconify/react";
import VOLUNTEER from "@/assets/home/volunteer.webp"
import PSF_OFFICE from "@/assets/home/psf-office.webp"
const LOGO_SRC = "/images/logo.webp";

const formatAmount = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const toRecentDonor = (d: PublicDonation): RecentDonor => ({
  name: d.name,
  date: formatDate(d.date),
  campaign: d.campaign?.title ?? "General Donation",
  amount: formatAmount(d.amount),
});

export function HomePage() {
  const { data: recentDonations } = useSWR("recent-donations", () => getRecentDonations(20));
  const recentDonors = (recentDonations ?? []).map(toRecentDonor);

  const { data: campaignsData } = useSWR("home-campaigns", () => listCampaigns({ limit: 3 }));
  const heroCampaigns = campaignsData?.campaigns ?? [];

  const row1 = recentDonors.slice(0, 10);
  const row2 = recentDonors.slice(10, 20);

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="bg-warm pt-36 pb-20 md:pt-44 md:pb-24 relative overflow-hidden">
        <div className="hero-logo-bg">
          <img src={LOGO_SRC} alt="" className="w-full h-full object-cover rounded-full" />
        </div>
        <div className="max-w-container mx-auto px-6 text-center hero-content">
          <Reveal>
            <p className="label-text text-accent mb-8">●&nbsp; PROYAKH SOCIAL FOUNDATION</p>
          </Reveal>
          <Reveal as="h1" className="reveal-delay-1 font-serif text-[48px] md:text-[72px] lg:text-[88px] text-[#111111] leading-[1.05] tracking-tight">
            Creating Hope.
            <br />
            <span className="text-accent">
              <em>Empowering Lives.</em>
            </span>
            <br />
            Building a Better Tomorrow.
          </Reveal>
          <Reveal as="p" className="reveal-delay-2 mt-8 text-base md:text-lg text-[#111111]/50 max-w-[600px] mx-auto leading-relaxed">
            Proyakh Social Foundation works alongside communities to create meaningful change through education, healthcare,
            relief initiatives, and sustainable social development.
          </Reveal>
          <Reveal className="reveal-delay-3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/donate"
              className="group btn-press bg-accent text-white text-sm font-medium px-8 py-3.5 rounded-sm hover:bg-[#d93a56] hover:shadow-lg hover:shadow-accent/20 transition-all duration-400"
            >
              Donate Now <span className="inline-block ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <a target="_blank"
              href="https://www.instagram.com/proyakh008/?hl=en"
              className="group btn-press bg-[#111111] text-white text-sm font-medium px-8 py-3.5 rounded-sm hover:bg-[#1a1a1c] hover:shadow-lg hover:shadow-[#111111]/15 transition-all duration-400"
            >
              Explore Our Work <span className="inline-block ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </Reveal>
          <Reveal as="p" className="reveal-delay-4 mt-8 text-sm text-[#111111]/30">
            Every contribution brings us one step closer to lasting change.
          </Reveal>
        </div>
      </section>

      {/* ===== HERO CAMPAIGN CARDS ===== */}
      <section id="campaigns" className="bg-warm pb-28 md:pb-36">
        <div className="max-w-container mx-auto px-6">
          {heroCampaigns.length === 0 ? (
            <p className="text-center text-sm text-[#111111]/30">No active campaigns at the moment. Check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {heroCampaigns.map((c, i) => (
                <Reveal
                  key={c._id}
                  className={`${i > 0 ? `reveal-delay-${i}` : ""} ${
                    c.isFeatured
                      ? "card-highlighted border-2 border-accent rounded-sm overflow-hidden group relative"
                      : "card-lift border border-[#111111]/[0.07] rounded-sm overflow-hidden group hover:border-[#111111]/12"
                  }`}
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
                      ) : c.isFeatured ? (
                        <Link
                          to={`/donate?campaignId=${c._id}`}
                          className="group btn-press bg-accent text-white text-sm font-medium px-6 py-2.5 rounded-sm hover:bg-[#d93a56] hover:shadow-lg hover:shadow-accent/20 transition-all duration-400 inline-block"
                        >
                          Support Now <span className="inline-block ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
                        </Link>
                      ) : (
                        <Link to={`/donate?campaignId=${c._id}`} className="group text-sm font-medium text-accent hover:text-[#d93a56] transition-colors duration-300">
                          Support This Campaign <span className="inline-block ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
          <Reveal as="p" className="reveal-delay-3 text-center text-xs text-[#111111]/25 mt-8 tracking-wide">
            100% secure contributions &nbsp;•&nbsp; Trusted by our supporters
          </Reveal>
        </div>
      </section>

      {/* ===== IMPACT STATS ===== */}
      <section className="bg-warm-alt py-28 md:py-36">
        <div className="max-w-container mx-auto px-6 text-center">
          <Reveal as="h2" className="font-serif text-[40px] md:text-[56px] lg:text-[64px] text-[#111111] leading-tight tracking-tight mb-20">
            Creating Impact <span className="text-accent">Together</span>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 max-w-4xl mx-auto">
            <Reveal>
              <div className="w-12 h-12 rounded-full border border-[#111111]/[0.08] flex items-center justify-center mx-auto mb-5 icon-circle hover:border-accent/30">
                <Icon icon="lucide:users" className="w-5 h-5 text-accent" />
              </div>
              <p className="font-serif text-4xl md:text-5xl text-[#111111] mb-2">
                <AnimatedCounter target={2500} suffix="+" />
              </p>
              <p className="text-sm text-[#111111]/40">Lives Impacted</p>
            </Reveal>
            <Reveal className="reveal-delay-1">
              <div className="w-12 h-12 rounded-full border border-[#111111]/[0.08] flex items-center justify-center mx-auto mb-5 icon-circle hover:border-accent/30">
                <Icon icon="lucide:layout-grid" className="w-5 h-5 text-accent" />
              </div>
              <p className="font-serif text-4xl md:text-5xl text-[#111111] mb-2">
                <AnimatedCounter target={25} suffix="+" />
              </p>
              <p className="text-sm text-[#111111]/40">Community Initiatives</p>
            </Reveal>
            <Reveal className="reveal-delay-2">
              <div className="w-12 h-12 rounded-full border border-[#111111]/[0.08] flex items-center justify-center mx-auto mb-5 icon-circle hover:border-accent/30">
                <Icon icon="lucide:heart" className="w-5 h-5 text-accent" />
              </div>
              <p className="font-serif text-4xl md:text-5xl text-[#111111] mb-2">
                <AnimatedCounter target={500} suffix="+" />
              </p>
              <p className="text-sm text-[#111111]/40">Supporters</p>
            </Reveal>
            <Reveal className="reveal-delay-3">
              <div className="w-12 h-12 rounded-full border border-[#111111]/[0.08] flex items-center justify-center mx-auto mb-5 icon-circle hover:border-accent/30">
                <Icon icon="lucide:hand-helping" className="w-5 h-5 text-accent" />
              </div>
              <p className="font-serif text-4xl md:text-5xl text-[#111111] mb-2">
                <AnimatedCounter target={10} suffix="+" />
              </p>
              <p className="text-sm text-[#111111]/40">Active Volunteers</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== WHO WE ARE ===== */}
      <section id="about" className="bg-warm py-28 md:py-36">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <Reveal as="p" className="label-text text-accent mb-6">
              ●&nbsp; WHO WE ARE
            </Reveal>
            <Reveal as="h2" className="reveal-delay-1 font-serif text-[36px] md:text-[48px] lg:text-[56px] text-[#111111] leading-[1.1] tracking-tight mb-6">
              Small Actions, Big Change.
            </Reveal>
            <Reveal as="p" className="reveal-delay-2 text-base text-[#111111]/45 leading-relaxed">
              Proyakh Social Foundation is committed to uplifting underserved communities and creating opportunities for a
              better, more equitable tomorrow. We work closely with communities across Assam and the Northeast, addressing
              real needs through education, healthcare, and sustainable development.
            </Reveal>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-14">
            {[
              { icon: "lucide:target", title: "Mission-Driven", desc: "Every initiative is guided by a clear purpose to create lasting community impact." },
              { icon: "lucide:heart-handshake", title: "Community-First", desc: "We work with communities, not just for them — building trust and ownership." },
              { icon: "lucide:shield-check", title: "Transparent", desc: "Full accountability in how every contribution is used and reported." },
              { icon: "lucide:sprout", title: "Sustainable", desc: "Focused on long-term solutions rather than short-term relief alone." },
            ].map((v, i) => (
              <Reveal key={v.title} className={`value-box border border-[#111111]/[0.07] rounded-sm p-6 text-center ${i > 0 ? `reveal-delay-${i}` : ""}`}>
                <div className="w-10 h-10 rounded-full border border-accent/25 flex items-center justify-center mx-auto mb-4">
                  <Icon icon={v.icon} className="w-5 h-5 text-accent" />
                </div>
                <h4 className="font-serif text-lg text-[#111111] mb-1.5">{v.title}</h4>
                <p className="text-sm text-[#111111]/40 leading-relaxed">{v.desc}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="reveal-delay-2 max-w-3xl mx-auto relative">
            <Reveal img className="rounded-sm">
              <img src={PSF_OFFICE} alt="Proyakh Social Foundation office" className="w-full h-[340px] md:h-[440px] object-cover" loading="lazy" />
            </Reveal>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-accent text-white px-6 py-4 rounded-sm transition-transform duration-500 ease-smooth hover:scale-[1.02]">
              <p className="font-serif text-xl leading-tight text-center">
                Working in
                <br />
                20+ Communities
              </p>
            </div>
          </Reveal>
          <Reveal className="reveal-delay-3 text-center mt-10">
            <Link to="/about" className="link-underline text-sm font-medium text-accent hover:text-[#d93a56] transition-colors duration-300">
              Learn More About Us <span className="inline-block ml-1">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ===== OUR FOCUS AREAS ===== */}
      <section id="focus" className="bg-warm-alt py-28 md:py-36">
        <div className="max-w-container mx-auto px-6 text-center">
          <Reveal as="p" className="label-text text-accent mb-6">
            ●&nbsp; OUR FOCUS AREAS
          </Reveal>
          <Reveal as="h2" className="reveal-delay-1 font-serif text-[36px] md:text-[48px] lg:text-[60px] text-[#111111] leading-[1.1] tracking-tight mb-14">
            Working Where Support Matters Most
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { icon: "lucide:graduation-cap", title: "Education", desc: "Helping children and young people access quality education and learning opportunities." },
              { icon: "lucide:stethoscope", title: "Healthcare", desc: "Supporting health initiatives that bring essential healthcare and awareness to communities." },
              { icon: "lucide:tree-pine", title: "Community Development", desc: "Creating opportunities and resources that help communities grow stronger." },
              { icon: "lucide:shield-check", title: "Emergency Relief", desc: "Standing with families and communities during difficult times and emergencies." },
            ].map((f, i) => (
              <Reveal key={f.title} className={`card-lift border border-[#111111]/[0.07] rounded-sm p-7 hover:border-[#111111]/12 group text-center ${i > 0 ? `reveal-delay-${i}` : ""}`}>
                <div className="w-11 h-11 rounded-full border border-[#111111]/[0.08] flex items-center justify-center mx-auto mb-5 transition-colors duration-400 ease-smooth group-hover:border-accent/30">
                  <Icon icon={f.icon} className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-serif text-2xl text-[#111111] mb-3">{f.title}</h3>
                <p className="text-sm text-[#111111]/40 leading-relaxed mb-5">{f.desc}</p>
                <Link to="/latest-events" className="focus-link text-sm font-medium text-accent">
                  Learn More <span className="inline-block ml-1">→</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW SUPPORT WORKS ===== */}
      <section className="bg-warm py-28 md:py-36">
        <div className="max-w-container mx-auto px-6 text-center">
          <Reveal as="p" className="label-text text-accent mb-6">
            HOW YOUR SUPPORT HELPS
          </Reveal>
          <Reveal as="h2" className="reveal-delay-1 font-serif text-[36px] md:text-[48px] lg:text-[60px] text-[#111111] leading-[1.1] tracking-tight mb-20">
            Making a Difference Is Simple
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-6 max-w-4xl mx-auto">
            {[
              { n: "01", title: "Choose a Cause", desc: "Explore our campaigns and support the cause you care about most." },
              { n: "02", title: "Make a Contribution", desc: "Donate through UPI, QR code, or bank transfer." },
              { n: "03", title: "Verified & Transparent", desc: "Your contribution is verified responsibly by our team." },
              { n: "04", title: "See Your Impact", desc: "Your support helps fund meaningful community initiatives." },
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

     

      {/* ===== RECENT SUPPORTERS — TICKER ===== */}
      <section id="supporters" className="bg-warm py-28 md:py-36">
        <div className="max-w-container mx-auto px-6 text-center mb-14">
          <Reveal as="p" className="label-text text-accent mb-6">
            ●&nbsp; RECENT SUPPORTERS
          </Reveal>
          <Reveal as="h2" className="reveal-delay-1 font-serif text-[36px] md:text-[48px] lg:text-[56px] text-[#111111] leading-[1.1] tracking-tight">
            People Who Care
          </Reveal>
        </div>

        {row1.length === 0 ? (
          <p className="text-center text-sm text-[#111111]/30">No verified donations yet — be the first to support us.</p>
        ) : (
          <>
            <Reveal className="reveal-delay-2">
              <DonorTicker donors={row1} />
            </Reveal>
            {row2.length > 0 && (
              <Reveal className="reveal-delay-3">
                <DonorTicker donors={row2} reverse />
              </Reveal>
            )}
          </>
        )}
      </section>

      {/* ===== TRANSPARENCY ===== */}
      <section className="bg-warm-alt py-28 md:py-36 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6 text-center">
          <Reveal as="p" className="label-text text-accent mb-6">
            OUR COMMITMENT
          </Reveal>
          <Reveal as="h2" className="reveal-delay-1 font-serif text-[36px] md:text-[48px] lg:text-[56px] text-[#111111] leading-[1.1] tracking-tight mb-16">
            Transparency. Responsibility.
            <br />
            Impact That Lasts.
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-3xl mx-auto">
            {[
              { icon: "lucide:eye", title: "Transparent Use", desc: "We ensure responsible use of every contribution." },
              { icon: "lucide:badge-check", title: "Verified Support", desc: "Every donation is verified before being counted." },
              { icon: "lucide:users", title: "Community First", desc: "We work with communities, not just for them." },
            ].map((c, i) => (
              <Reveal key={c.title} className={i > 0 ? `reveal-delay-${i}` : ""}>
                <div className="w-12 h-12 rounded-full border border-[#111111]/[0.08] flex items-center justify-center mx-auto mb-5 icon-circle hover:border-accent/30">
                  <Icon icon={c.icon} className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-serif text-xl text-[#111111] mb-2">{c.title}</h3>
                <p className="text-sm text-[#111111]/40 leading-relaxed">{c.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== VOLUNTEER ===== */}
      <section className="bg-warm py-28 md:py-36">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <Reveal img className="rounded-sm mb-12">
              <img src={VOLUNTEER} alt="Volunteers" className="w-full h-[340px] md:h-[440px] object-cover" loading="lazy" />
            </Reveal>
            <div className="text-center">
              <Reveal as="h2" className="reveal-delay-1 font-serif text-[36px] md:text-[48px] lg:text-[56px] text-[#111111] leading-[1.1] tracking-tight mb-6">
                Change doesn't always begin with money.
              </Reveal>
              <Reveal as="p" className="reveal-delay-2 text-base text-[#111111]/45 leading-relaxed mb-10 max-w-lg mx-auto">
                Your time, skills, ideas, and energy can make an equally meaningful difference.
              </Reveal>
              <Reveal className="reveal-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/contact"
                  className="btn-press bg-[#111111] text-white text-sm font-medium px-7 py-3.5 rounded-sm hover:bg-[#1a1a1c] hover:shadow-lg hover:shadow-[#111111]/15 transition-all duration-400"
                >
                  Become a Volunteer <span className="inline-block ml-1">→</span>
                </Link>
                <Link
                  to="/contact"
                  className="btn-press border border-[#111111]/[0.1] text-[#111111] text-sm font-medium px-7 py-3.5 rounded-sm hover:border-[#111111]/20 hover:shadow-sm transition-all duration-400"
                >
                  Partner With Us <span className="inline-block ml-1">→</span>
                </Link>
              </Reveal>
              <Reveal as="p" className="reveal-delay-4 mt-8 text-sm text-accent font-medium">
                10+ Active Volunteers
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PARTNERS ===== */}
      {/* <section className="bg-warm-alt py-24 md:py-28 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6 text-center">
          <Reveal as="p" className="label-text text-[#111111]/25 mb-6">
            PARTNERING FOR IMPACT
          </Reveal>
          <Reveal as="h2" className="reveal-delay-1 font-serif text-[28px] md:text-[36px] text-[#111111] leading-tight tracking-tight mb-14">
            Together with Our Partners
          </Reveal>
          <Reveal className="reveal-delay-2 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            <div className="partner-logo text-[#111111]/12 font-serif text-xl italic tracking-wide cursor-default">Partner One</div>
            <div className="partner-logo text-[#111111]/12 font-sans text-sm font-semibold tracking-[0.15em] uppercase cursor-default">PARTNER TWO</div>
            <div className="partner-logo text-[#111111]/12 font-serif text-xl tracking-wide cursor-default">Partner Three</div>
            <div className="partner-logo text-[#111111]/12 font-sans text-sm font-semibold tracking-[0.15em] uppercase cursor-default">PARTNER FOUR</div>
            <div className="partner-logo text-[#111111]/12 font-serif text-xl italic tracking-wide cursor-default">Partner Five</div>
            <div className="partner-logo text-[#111111]/12 font-sans text-sm font-semibold tracking-[0.15em] uppercase cursor-default">PARTNER SIX</div>
          </Reveal>
        </div>
      </section> */}

      {/* ===== FAQ ===== */}
      <section className="bg-lavender py-28 md:py-36">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <Reveal as="p" className="label-text text-[#111111]/35 mb-6">
              FAQ
            </Reveal>
            <Reveal as="h2" className="reveal-delay-1 font-serif text-[40px] md:text-[52px] text-[#111111] leading-[1.1] tracking-tight mb-6">
              Have Questions?
            </Reveal>
            <Reveal as="p" className="reveal-delay-2 text-base text-[#111111]/40 leading-relaxed mb-8">
              Here are some common questions about our work and how you can help.
            </Reveal>
            <Reveal
              as={Link}
              to="/contact"
              className="reveal-delay-3 btn-press bg-[#111111] text-white text-sm font-medium px-6 py-3 rounded-sm hover:bg-[#1a1a1c] hover:shadow-lg transition-all duration-400 inline-block"
            >
              Get in Touch <span className="inline-block ml-1">→</span>
            </Reveal>
          </div>
          <div className="max-w-3xl mx-auto">
            <FaqAccordion items={homeFaqItems} />
          </div>
        </div>
      </section>
    </>
  );
}
