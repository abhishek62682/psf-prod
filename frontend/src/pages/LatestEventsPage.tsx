import { useState } from "react";
import { Link } from "react-router-dom";
import useSWR from "swr";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Reveal } from "@/components/Reveal";
import { useActiveSection } from "@/hooks/useActiveSection";
import { Icon } from "@iconify/react";
import { listEvents } from "@/config/api/event.api";
import { getAssetUrl } from "@/Utils/constant";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const DAY_MONTH_FMT: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
const FULL_DATE_FMT: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };

// e.g. "12 Aug – 13 Aug 2026 · 2 days." (single date collapses to "12 Aug 2026 · 1 day.")
function formatEventDateLine(startDate?: string, endDate?: string) {
  if (!startDate && !endDate) return null;

  const start = new Date(startDate ?? endDate!);
  const end = new Date(endDate ?? startDate!);
  const sameDay = start.toDateString() === end.toDateString();
  const sameYear = start.getFullYear() === end.getFullYear();

  const days = Math.round((end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0)) / 86400000) + 1;

  const dateText = sameDay
    ? start.toLocaleDateString("en-GB", FULL_DATE_FMT)
    : sameYear
      ? `${start.toLocaleDateString("en-GB", DAY_MONTH_FMT)} – ${end.toLocaleDateString("en-GB", FULL_DATE_FMT)}`
      : `${start.toLocaleDateString("en-GB", FULL_DATE_FMT)} – ${end.toLocaleDateString("en-GB", FULL_DATE_FMT)}`;

  return `${dateText} · ${days} day${days > 1 ? "s" : ""}.`;
}

function StatRow({ stats }: { stats: { value: string; label: string }[];  }) {
  return (
    <Reveal className={`grid grid-cols-3 mx-auto gap-5 max-w-2xl`}>
      {stats.map((s) => (
        <div key={s.label} className="stat-card border border-[#111111]/[0.06] rounded-xl p-5 text-center">
          <p className="font-serif text-3xl md:text-4xl text-[#111111] mb-1">
            {s.value.replace("+", "")}
            <span className="text-accent">+</span>
          </p>
          <p className="text-xs text-[#111111]/35">{s.label}</p>
        </div>
      ))}
    </Reveal>
  );
}

function EventImageSlider({ images, alt }: { images?: string[]; alt: string }) {
  const list = images ?? [];

  if (list.length === 0) {
    return <div className="w-full h-[320px] md:h-[500px] rounded-2xl bg-[#111111]/[0.04]" />;
  }

  if (list.length === 1) {
    return (
      <img
        src={getAssetUrl(list[0])}
        alt={alt}
        className="w-full h-[320px] md:h-[500px] object-cover rounded-2xl"
        loading="lazy"
      />
    );
  }

  return <EventImageSliderInner list={list} alt={alt} />;
}

function EventImageSliderInner({ list, alt }: { list: string[]; alt: string }) {
  // Explicit nav elements (instead of the `navigation` boolean shorthand) so
  // each slider's prev/next buttons are wired unambiguously to *this*
  // Swiper instance, never a sibling event's slider on the same page.
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

  return (
    <div className="relative group/slider w-full h-[320px] md:h-[500px] rounded-2xl overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation={{ prevEl, nextEl }}
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        loop
        className="event-swiper w-full h-full"
      >
        {list.map((url) => (
          <SwiperSlide key={url}>
            <img src={getAssetUrl(url)} alt={alt} className="w-full h-full object-cover" loading="lazy" />
          </SwiperSlide>
        ))}
      </Swiper>

      <button
        ref={setPrevEl}
        type="button"
        aria-label="Previous photo"
        className="event-slider-nav-btn left-3"
      >
        <Icon icon="lucide:chevron-left" className="w-5 h-5" />
      </button>
      <button
        ref={setNextEl}
        type="button"
        aria-label="Next photo"
        className="event-slider-nav-btn right-3"
      >
        <Icon icon="lucide:chevron-right" className="w-5 h-5" />
      </button>
    </div>
  );
}

export function LatestEventsPage() {
  const { data: events, isLoading: eventsLoading, error: eventsError } = useSWR("events", listEvents);
  const eventList = events ?? [];

  // Unique categories in the order they first appear, used for the filter nav.
  // Each category anchors to the first event of that category below.
  const categories: string[] = [];
  const categoryFirstIndex: Record<string, number> = {};
  eventList.forEach((e, i) => {
    if (!e.category) return;
    if (!(e.category in categoryFirstIndex)) {
      categoryFirstIndex[e.category] = i;
      categories.push(e.category);
    }
  });

  const active = useActiveSection(categories.map((c) => slugify(c)));

  return (
    <>
      <section className="bg-warm pt-36 pb-20 md:pt-44 md:pb-28">
        <div className="max-w-container mx-auto px-6 text-center">
          <Reveal as="p" className="label-text text-accent mb-8">
            ●&nbsp; LATEST EVENTS
          </Reveal>
          <Reveal as="h1" className="reveal-delay-1 font-serif text-[48px] md:text-[72px] lg:text-[88px] text-[#111111] leading-[1.05] tracking-tight">
            What We Do.
            <br />
            <span className="text-accent">Where It Matters.</span>
          </Reveal>
          <Reveal as="p" className="reveal-delay-2 mt-8 text-base md:text-lg text-[#111111]/50 max-w-[650px] mx-auto leading-relaxed">
            Explore how Proyakh Social Foundation delivers sustainable programs across environment, nutrition, healthcare,
            and disaster response to communities across Assam.
          </Reveal>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="bg-warm-alt py-8 border-t border-[#111111]/[0.04] sticky top-16 z-40">
          <div className="max-w-container mx-auto px-6">
            <div className="flex items-center justify-center gap-6 md:gap-10 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((c) => {
                const id = slugify(c);
                return (
                  <a
                    key={c}
                    href={`#${id}`}
                    className={`work-nav-link text-sm font-medium whitespace-nowrap py-2 ${active === id ? "active text-[#111111]" : "text-[#111111]/40"}`}
                  >
                    {c}
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {eventsLoading && (
        <section className="bg-warm py-28">
          <p className="text-center text-sm text-[#111111]/30">Loading events…</p>
        </section>
      )}
      {eventsError && (
        <section className="bg-warm py-28">
          <p className="text-center text-sm text-accent">Couldn't load events right now. Please try again later.</p>
        </section>
      )}
      {!eventsLoading && !eventsError && eventList.length === 0 && (
        <section className="bg-warm py-28">
          <p className="text-center text-sm text-[#111111]/30">No events yet — check back soon.</p>
        </section>
      )}

      {eventList.map((e, i) => {
        const imageFirst = i % 2 === 0;
        const bg = i % 2 === 0 ? "bg-warm-alt" : "bg-warm";
        const isFirstInCategory = e.category ? categoryFirstIndex[e.category] === i : false;
        const sectionId = isFirstInCategory ? slugify(e.category) : undefined;
        const dateLine = formatEventDateLine(e.eventStartDate, e.eventEndDate);
        return (
          <div key={e._id}>
            <section id={sectionId} className={`${bg} pt-28 md:pt-36 pb-16 ${i > 0 ? "border-t border-[#111111]/[0.04]" : ""}`}>
              <div className="max-w-container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                  {imageFirst && (
                    <div className="lg:col-span-6 lg:sticky lg:top-40">
                      <Reveal img className="rounded-2xl">
                        <EventImageSlider images={e.images} alt={e.title} />
                      </Reveal>
                    </div>
                  )}
                  <div className={`lg:col-span-6 ${!imageFirst ? "order-2 lg:order-1" : ""}`}>
                    {e.category && (
                      <Reveal className="mb-6">
                        <p className="label-text text-accent">{e.category.toUpperCase()}</p>
                      </Reveal>
                    )}
                    <Reveal as="h2" className={`reveal-delay-1 font-serif text-[36px] md:text-[44px] lg:text-[52px] text-[#111111] leading-[1.1] tracking-tight ${dateLine ? "mb-3" : "mb-6"}`}>
                      {e.title}
                    </Reveal>
                    {dateLine && (
                      <Reveal className="reveal-delay-1 mb-6">
                        <p className="text-sm text-[#111111]/40">{dateLine}</p>
                      </Reveal>
                    )}
                    <Reveal as="p" className="reveal-delay-2 text-base text-[#111111]/50 leading-relaxed mb-10">
                      {e.description}
                    </Reveal>
                    {e.activities && e.activities.length > 0 && (
                      <Reveal className="reveal-delay-3 space-y-0">
                        <p className="label-text text-[#111111]/25 mb-4">KEY ACTIVITIES</p>
                        {e.activities.map((a) => (
                          <div key={a.title} className="activity-item flex items-center gap-4 py-4 border-t border-[#111111]/[0.05] rounded-lg px-3">
                            <span className="w-8 h-8 rounded-lg bg-accent/8 flex items-center justify-center shrink-0">
                              <Icon icon="lucide:check-circle-2" className="w-4 h-4 text-accent" />
                            </span>
                            <div>
                              <h4 className="text-sm font-medium text-[#111111]">{a.title}</h4>
                              <p className="text-xs text-[#111111]/35 mt-0.5">{a.description}</p>
                            </div>
                          </div>
                        ))}
                      </Reveal>
                    )}
                  </div>
                  {!imageFirst && (
                    <div className="lg:col-span-6 order-1 lg:order-2 lg:sticky lg:top-40">
                      <Reveal img className="rounded-2xl">
                        <EventImageSlider images={e.images} alt={e.title} />
                      </Reveal>
                    </div>
                  )}
                </div>
              </div>
            </section>
            {e.stats && e.stats.length > 0 && (
              <section className={`${bg} pb-24 md:pb-32`}>
                <div className="max-w-container mx-auto px-6">
                  <StatRow stats={e.stats} />
                </div>
              </section>
            )}
          </div>
        );
      })}

      {/* ===== OVERALL IMPACT ===== */}
      <section className="bg-warm-alt py-28 md:py-36 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6 text-center">
          <Reveal as="p" className="label-text text-accent mb-6">
            ●&nbsp; OVERALL IMPACT
          </Reveal>
          <Reveal as="h2" className="reveal-delay-1 font-serif text-[36px] md:text-[48px] lg:text-[56px] text-[#111111] leading-[1.1] tracking-tight mb-16">
            Numbers That Tell
            <br />
            <span className="text-accent">Our Story</span>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: "lucide:users", value: "2500", label: "Lives Impacted" },
              { icon: "lucide:layout-grid", value: "25", label: "Initiatives Completed" },
              { icon: "lucide:map-pin", value: "20", label: "Communities Reached" },
              { icon: "lucide:hand-helping", value: "10", label: "Active Volunteers" },
            ].map((s, i) => (
              <Reveal key={s.label} className={i > 0 ? `reveal-delay-${i}` : ""}>
                <div className="w-12 h-12 rounded-full border border-accent/25 flex items-center justify-center mx-auto mb-5">
                  <Icon icon={s.icon} className="w-5 h-5 text-accent" />
                </div>
                <p className="font-serif text-4xl md:text-5xl text-[#111111] mb-2">
                  {s.value}
                  <span className="text-accent">+</span>
                </p>
                <p className="text-sm text-[#111111]/40">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-warm py-28 md:py-36 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal as="h2" className="font-serif text-[36px] md:text-[48px] lg:text-[56px] text-[#111111] leading-[1.1] tracking-tight mb-6">
              Support the Work
              <br />
              <span className="text-accent">That Matters Most.</span>
            </Reveal>
            <Reveal as="p" className="reveal-delay-1 text-base text-[#111111]/45 leading-relaxed mb-10 max-w-lg mx-auto">
              Every contribution directly fuels our programs on the ground. Choose a campaign to support or make a
              general donation to strengthen all our initiatives.
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
