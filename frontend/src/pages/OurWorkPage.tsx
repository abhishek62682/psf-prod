import { Link } from "react-router-dom";
import { Reveal } from "@/components/Reveal";
import { useActiveSection } from "@/hooks/useActiveSection";
import { Icon } from "@iconify/react";
import nutritionImage from "@/assets/our-work/nutrition-community-meal.webp";
import floodImage from "@/assets/our-work/flood.jpeg"
import eyeCampImage from "@/assets/our-work/eyecamp.webp"
import envDayImage from "@/assets/our-work/envday-01.webp"

interface Activity {
  icon: string;
  title: string;
  desc: string;
}

interface WorkSection {
  id: string;
  icon: string;
  label: string;
  title: React.ReactNode;
  body: string;
  image: string;
  imageAlt: string;
  activities: Activity[];
  stats: { value: string; label: string }[];
  bg: string;
  imageFirst: boolean;
}

const sections: WorkSection[] = [
  {
    id: "environment",
    icon: "lucide:leaf",
    label: "ENVIRONMENT & SUSTAINABILITY",
    title: "Protecting Our Planet, Together",
    body: "We run tree plantation drives, clean-up campaigns, and awareness programs to protect the environment and build climate-resilient communities. Our environmental initiatives focus on sustainable practices that safeguard the ecosystems our communities depend on.",
    image: envDayImage,
    imageAlt: "Environment Day tree plantation drive",
    activities: [
      { icon: "lucide:trees", title: "Tree Plantation Drives", desc: "Organizing community plantation events to restore green cover." },
      { icon: "lucide:recycle", title: "Clean-Up Campaigns", desc: "Mobilizing volunteers to clear waste from public spaces and water bodies." },
      { icon: "lucide:megaphone", title: "Environmental Awareness", desc: "Educating communities on sustainable living and climate action." },
    ],
    stats: [
      { value: "1000+", label: "Trees Planted" },
      { value: "10+", label: "Clean-Up Drives" },
      { value: "5+", label: "Communities Engaged" },
    ],
    bg: "bg-warm-alt",
    imageFirst: true,
  },
  {
    id: "nutrition",
    icon: "lucide:apple",
    label: "NUTRITION & FOOD SUPPORT",
    title: (
      <>
        Nourishing Communities,
        <br />
        One Meal at a Time
      </>
    ),
    body: "Nutritious meals and food packages help children and families stay healthy and energized. Our nutrition programs target malnutrition in rural areas and ensure that no one in our communities goes hungry.",
    image: nutritionImage,
    imageAlt: "Nutrition program",
    activities: [
      { icon: "lucide:utensils", title: "Community Meal Programs", desc: "Organizing regular meal distribution drives for families in need." },
      { icon: "lucide:megaphone", title: "Nutrition Awareness Drives", desc: "Educating families about balanced diets and local nutritional resources." },
      { icon: "lucide:salad", title: "Midday Meal Support", desc: "Supplementing government midday meal programs in underserved schools." },
    ],
    stats: [
      { value: "300+", label: "Meals Served" },
      { value: "5+", label: "Communities Reached" },
      { value: "4+", label: "Drives Conducted" },
    ],
    bg: "bg-warm",
    imageFirst: false,
  },
  {
    id: "healthcare",
    icon: "lucide:stethoscope",
    label: "HEALTHCARE & WELLNESS",
    title: (
      <>
        Bringing Healthcare
        <br />
        to Doorsteps
      </>
    ),
    body: "Mobile clinics, health camps, and medical support reach families in remote villages. We partner with healthcare institutions to ensure that quality medical attention is accessible to those who need it most.",
    image: eyeCampImage,
    imageAlt: "Healthcare camp",
    activities: [
      { icon: "lucide:heart-pulse", title: "Health Camps and Screenings", desc: "Free eye check-ups, kidney screenings, and general health consultations." },
      { icon: "lucide:pill", title: "Medicines and Referrals", desc: "Distributing essential medicines and connecting patients to specialized care." },
      { icon: "lucide:shield-plus", title: "Awareness on Hygiene", desc: "Educating communities on sanitation, clean water, and preventive health practices." },
    ],
    stats: [
      { value: "400+", label: "Patients Screened" },
      { value: "6+", label: "Health Camps" },
      { value: "2+", label: "Hospital Partners" },
    ],
    bg: "bg-warm-alt",
    imageFirst: true,
  },
  {
    id: "disaster",
    icon: "lucide:shield-alert",
    label: "DISASTER RESPONSE",
    title: (
      <>
        Standing With Communities
        <br />
        In Their Darkest Hours
      </>
    ),
    body: "Rapid relief for flood-affected communities and long-term rehabilitation support. When disaster strikes, our team mobilizes quickly to provide essential supplies, shelter, and assistance to help families rebuild their lives.",
    image: floodImage,
    imageAlt: "Disaster relief",
    activities: [
      { icon: "lucide:package-check", title: "Emergency Relief Kits", desc: "Distributing food, water, clothing, and essential supplies to affected families." },
      { icon: "lucide:tent", title: "Temporary Shelter Support", desc: "Helping displaced families find safe temporary shelter and basic amenities." },
      { icon: "lucide:hammer", title: "Community Rebuilding", desc: "Long-term support to help communities recover, rebuild, and become more resilient." },
    ],
    stats: [
      { value: "200+", label: "Families Assisted" },
      { value: "3+", label: "Relief Operations" },
      { value: "₹1.35L+", label: "Relief Distributed" },
    ],
    bg: "bg-warm",
    imageFirst: false,
  },
];

const navLabels: Record<string, string> = {
  environment: "Environment",
  nutrition: "Nutrition",
  healthcare: "Healthcare",
  disaster: "Disaster Response",
};

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

export function OurWorkPage() {
  const active = useActiveSection(sections.map((s) => s.id));

  return (
    <>
      <section className="bg-warm pt-36 pb-20 md:pt-44 md:pb-28">
        <div className="max-w-container mx-auto px-6 text-center">
          <Reveal as="p" className="label-text text-accent mb-8">
            ●&nbsp; OUR WORK
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

      <section className="bg-warm-alt py-8 border-t border-[#111111]/[0.04] sticky top-16 z-40">
        <div className="max-w-container mx-auto px-6">
          <div className="flex items-center justify-center gap-6 md:gap-10 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`work-nav-link text-sm font-medium whitespace-nowrap py-2 ${active === s.id ? "active text-[#111111]" : "text-[#111111]/40"}`}
              >
                {navLabels[s.id]}
              </a>
            ))}
          </div>
        </div>
      </section>

      {sections.map((s, si) => (
        <div key={s.id}>
          <section id={s.id} className={`${s.bg} pt-28 md:pt-36 pb-16 ${si > 0 ? "border-t border-[#111111]/[0.04]" : ""}`}>
            <div className="max-w-container mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                {s.imageFirst && (
                  <div className="lg:col-span-6 lg:sticky lg:top-40">
                    <Reveal img className="rounded-2xl">
                      <img src={s.image} alt={s.imageAlt} className="w-full h-[320px] md:h-[500px] w-full object-cover rounded-2xl" loading="lazy" />
                    </Reveal>
                  </div>
                )}
                <div className={`lg:col-span-6 ${!s.imageFirst ? "order-2 lg:order-1" : ""}`}>
                  <Reveal className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full border border-accent/25 flex items-center justify-center shrink-0">
                      <Icon icon={s.icon} className="w-5 h-5 text-accent" />
                    </div>
                    <p className="label-text text-accent">{s.label}</p>
                  </Reveal>
                  <Reveal as="h2" className="reveal-delay-1 font-serif text-[36px] md:text-[44px] lg:text-[52px] text-[#111111] leading-[1.1] tracking-tight mb-6">
                    {s.title}
                  </Reveal>
                  <Reveal as="p" className="reveal-delay-2 text-base text-[#111111]/50 leading-relaxed mb-10">
                    {s.body}
                  </Reveal>
                  <Reveal className="reveal-delay-3 space-y-0">
                    <p className="label-text text-[#111111]/25 mb-4">KEY ACTIVITIES</p>
                    {s.activities.map((a) => (
                      <div key={a.title} className="activity-item flex items-center gap-4 py-4 border-t border-[#111111]/[0.05] rounded-lg px-3">
                        <span className="w-8 h-8 rounded-lg bg-accent/8 flex items-center justify-center shrink-0">
                          <Icon icon={a.icon} className="w-4 h-4 text-accent" />
                        </span>
                        <div>
                          <h4 className="text-sm font-medium text-[#111111]">{a.title}</h4>
                          <p className="text-xs text-[#111111]/35 mt-0.5">{a.desc}</p>
                        </div>
                      </div>
                    ))}
                  </Reveal>
                </div>
                {!s.imageFirst && (
                  <div className="lg:col-span-6 order-1 lg:order-2 lg:sticky lg:top-40">
                    <Reveal img className="rounded-2xl">
                      <img src={s.image} alt={s.imageAlt} className="w-full h-[320px] md:h-[420px] object-cover rounded-2xl" loading="lazy" />
                    </Reveal>
                  </div>
                )}
              </div>
            </div>
          </section>
          <section className={`${s.bg} pb-24 md:pb-32`}>
            <div className="max-w-container mx-auto px-6">
              <StatRow stats={s.stats}  />
            </div>
          </section>
        </div>
      ))}

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
