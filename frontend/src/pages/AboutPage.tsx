import { Link } from "react-router-dom";
import { Reveal } from "@/components/Reveal";
import { FaqAccordion } from "@/components/FaqAccordion";
import { homeFaqItems } from "@/data/homeData";
import { Icon } from "@iconify/react";
import EYE_EVENT_IMG from "@/assets/about/eye-event.webp";
import TREE_EVENT_IMG from "@/assets/about/tree-event.webp";
import SKILL_EVENT_IMG from "@/assets/about/skill-event.webp";

const initiatives = [
  { icon: "lucide:users", title: "Community Empowerment", desc: "Advancing education, skill development, and women's empowerment to help create stronger and more self-reliant communities." },
  { icon: "lucide:heart-pulse", title: "Healthcare Access", desc: "Promoting public health awareness and helping essential medical consultations and healthcare services reach people at the grassroots level." },
  { icon: "lucide:leaf", title: "Environmental Conservation", desc: "Protecting and preserving the natural environment while encouraging communities to build a more sustainable future." },
  { icon: "lucide:shield-check", title: "Disaster Relief", desc: "Providing support and assistance to communities affected by natural disasters and other emergencies." },
];

const keyInitiatives = [
  {
    image: EYE_EVENT_IMG,
    title: "Free Healthcare Camps",
    paragraphs: [
      <>
        We have organized multiple free eye check-up and consultation camps in collaboration with{" "}
        <strong className="text-[#111111]/55">Sri Sankaradeva Nethralaya</strong>, screening hundreds of students and
        local residents to help identify and address vision-related issues.
      </>,
      "We have also conducted specialized kidney health check-ups and awareness drives to promote preventive healthcare and encourage healthier lifestyle practices.",
    ],
  },
  {
    image: TREE_EVENT_IMG,
    title: "Environmental Conservation",
    paragraphs: [
      "To encourage a greener and healthier future, we regularly organize community cleanliness drives and environmental awareness activities.",
      <>
        In celebration of <strong className="text-[#111111]/55">World Environment Day</strong>, we successfully
        distributed approximately <strong className="text-accent font-medium">700 tree saplings</strong> to members of
        the community.
      </>,
    ],
  },
  {
    image: SKILL_EVENT_IMG,
    title: "SKILL DEVELOPMENT",
    paragraphs: [
      "We regularly organize skill development workshops designed to encourage self-reliance and provide people with opportunities to develop practical skills.",
      <>
        We also promote <strong className="text-[#111111]/55">clothing sustainability</strong> by collecting and
        distributing usable garments to underprivileged families. Unusable textiles are responsibly recycled to
        minimize waste, reduce pollution, and lower carbon emissions.
      </>,
    ],
  },
];

const values = [
  { icon: "lucide:shield-check", title: "Integrity", desc: "We maintain high standards of transparency and accountability across our activities and operations." },
  { icon: "lucide:heart", title: "Compassion", desc: "We approach our work with empathy, respect, and a genuine desire to support people in need." },
  { icon: "lucide:sprout", title: "Sustainability", desc: "We strive to develop initiatives that create lasting impact while strengthening communities and protecting the environment." },
  { icon: "lucide:handshake", title: "Collaboration", desc: "We believe meaningful change happens when people work together — with communities, institutions, and organizations." },
];

export function AboutPage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="bg-warm pt-36 pb-20 md:pt-44 md:pb-28">
        <div className="max-w-container mx-auto px-6 text-center">
          <Reveal as="p" className="label-text text-accent mb-8">
            ●&nbsp; ABOUT US
          </Reveal>
          <Reveal as="h1" className="reveal-delay-1 font-serif text-[48px] md:text-[72px] lg:text-[88px] text-[#111111] leading-[1.05] tracking-tight">
            Service is our identity,
            <br />
            <span className="text-accent">humanity is our strength.</span>
          </Reveal>
        </div>
      </section>

      {/* ===== OUR STORY ===== */}
      <section id="story" className="bg-warm-alt py-28 md:py-36 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-5">
              <Reveal as="p" className="label-text text-accent mb-6">
                ●&nbsp; OUR STORY
              </Reveal>
              <Reveal as="h2" className="reveal-delay-1 font-serif text-[36px] md:text-[44px] lg:text-[52px] text-[#111111] leading-[1.1] tracking-tight mb-6">
                From Humble
                <br />
                Beginnings.
              </Reveal>
              <Reveal className="reveal-delay-2 space-y-4 text-[#111111]/45 leading-relaxed">
                <p>
                  Established on <strong className="text-[#111111]/60">February 8, 2025</strong>, Proyakh Social
                  Foundation is a dedicated non-profit organization based in{" "}
                  <strong className="text-[#111111]/60">Kaki-1, Hojai, Assam</strong>.
                </p>
                <p>
                  Guided by our core philosophy, we are committed to building a healthy, aware, self-reliant, and
                  humane society by actively engaging young people in social responsibility.
                </p>
                <p>
                  Since our inception, we have worked tirelessly to address some of the most pressing challenges
                  facing rural communities in Assam — from limited educational resources and malnutrition to
                  inadequate healthcare access and environmental challenges.
                </p>
                <p>
                  We also promote social justice, gender equality, and human rights, while supporting vulnerable
                  communities through education, healthcare, environmental conservation, women and child welfare, and
                  skill development initiatives.
                </p>
              </Reveal>
            </div>
            <Reveal className="reveal-delay-2 lg:col-span-7">
              <Reveal img className="rounded-sm">
                <img src="/images/ENVIRONMENT%20DAY-2025.webp" alt="World Environment Day 2026" className="w-full h-[380px] md:h-[480px] object-cover" loading="lazy" />
              </Reveal>
              <p className="text-xs text-[#111111]/30 mt-3 text-center italic">World Environment Day, 2026</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== MISSION & OBJECTIVES ===== */}
      <section id="mission" className="bg-warm py-28 md:py-36">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Reveal as="p" className="label-text text-accent mb-6">
              ●&nbsp; MISSION &amp; OBJECTIVES
            </Reveal>
            <Reveal as="h2" className="reveal-delay-1 font-serif text-[36px] md:text-[48px] lg:text-[56px] text-[#111111] leading-[1.1] tracking-tight mb-6">
              Creating Positive,
              <br />
              Lasting Change.
            </Reveal>
            <Reveal as="p" className="reveal-delay-2 text-base text-[#111111]/45 leading-relaxed">
              Our mission is to create positive and lasting social change by encouraging community participation,
              raising awareness about important social issues, and connecting people with government welfare schemes.
              We believe that every individual deserves an equal opportunity to learn, grow, and live with dignity.
            </Reveal>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {initiatives.map((v, i) => (
              <Reveal key={v.title} className={`initiative-card border border-[#111111]/[0.07] rounded-sm p-7 hover:border-[#111111]/12 ${i > 0 ? `reveal-delay-${i}` : ""}`}>
                <div className="w-11 h-11 rounded-full border border-accent/25 flex items-center justify-center mb-5">
                  <Icon icon={v.icon} className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-serif text-xl text-[#111111] mb-2">{v.title}</h3>
                <p className="text-sm text-[#111111]/40 leading-relaxed">{v.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== KEY INITIATIVES ===== */}
      <section className="bg-warm-alt py-28 md:py-36 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Reveal as="p" className="label-text text-accent mb-6">
              ●&nbsp; KEY INITIATIVES
            </Reveal>
            <Reveal as="h2" className="reveal-delay-1 font-serif text-[36px] md:text-[48px] lg:text-[56px] text-[#111111] leading-[1.1] tracking-tight mb-6">
              Making a Real Difference.
            </Reveal>
            <Reveal as="p" className="reveal-delay-2 text-base text-[#111111]/45 leading-relaxed">
              Since our inception, our dedicated team of volunteers has successfully carried out several
              community-driven initiatives.
            </Reveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {keyInitiatives.map((k, i) => (
              <Reveal key={k.title} className={`bg-warm border border-[#111111]/[0.07] rounded-sm overflow-hidden ${i > 0 ? `reveal-delay-${i}` : ""}`}>
                <img src={k.image} alt={k.title} className="w-full h-[220px] object-cover" loading="lazy" />
                <div className="p-8">
                  <h3 className="font-serif text-2xl text-[#111111] mb-4">{k.title}</h3>
                  <div className="space-y-3 text-sm text-[#111111]/40 leading-relaxed">
                    {k.paragraphs.map((p, j) => (
                      <p key={j}>{p}</p>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== VISION & VALUES ===== */}
      <section className="bg-warm py-28 md:py-36">
        <div className="max-w-container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <Reveal as="p" className="label-text text-accent mb-6">
                ●&nbsp; OUR VISION
              </Reveal>
              <Reveal as="h2" className="reveal-delay-1 font-serif text-[36px] md:text-[44px] text-[#111111] leading-[1.1] tracking-tight mb-8">
                Building a Better
                <br />
                Future, Together.
              </Reveal>
              <Reveal className="reveal-delay-2 space-y-4 text-[#111111]/45 leading-relaxed">
                <p>Proyakh Social Foundation remains deeply committed to its three core pillars:</p>
                <p className="font-serif text-xl text-[#111111] italic">"Human Service, Skill Development, and Environmental Protection."</p>
                <p>
                  As we continue to grow, we envision expanding our humanitarian and social welfare initiatives beyond
                  our current communities and eventually reaching the international level, creating positive and
                  sustainable change across borders.
                </p>
                <p>
                  Our vision is to build a society where individuals and communities have the opportunities, resources,
                  awareness, and support they need to live with dignity and build a better future.
                </p>
              </Reveal>
            </div>
            <div>
              <Reveal as="p" className="reveal-delay-1 label-text text-accent mb-6">
                ●&nbsp; OUR VALUES
              </Reveal>
              <div className="space-y-5">
                {values.map((v, i) => (
                  <Reveal key={v.title} className={`value-box border border-[#111111]/[0.07] rounded-sm p-6 flex items-start gap-5 reveal-delay-${i + 2}`}>
                    <div className="w-10 h-10 rounded-full border border-[#111111]/[0.08] flex items-center justify-center shrink-0 bg-warm-alt">
                      <Icon icon={v.icon} className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg text-[#111111] mb-1">{v.title}</h4>
                      <p className="text-sm text-[#111111]/40 leading-relaxed">{v.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

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
