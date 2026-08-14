import { Link } from "react-router-dom";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@iconify/react";

const CAREER_EMAIL = "career@proyakhfoundation.org";

const perks = [
  { icon: "lucide:heart-handshake", title: "Purpose-Driven", desc: "Work that directly impacts communities in need." },
  { icon: "lucide:users", title: "Supportive Team", desc: "Collaborate with passionate, like-minded people." },
  { icon: "lucide:trending-up", title: "Growth", desc: "Develop skills in social work and leadership." },
  { icon: "lucide:map-pin", title: "Local Impact", desc: "Work closely with communities in Assam." },
];

export function CareersPage() {
  return (
    <>
      <section className="bg-warm pt-36 pb-20 md:pt-44 md:pb-28">
        <div className="max-w-container mx-auto px-6 text-center">
          <Reveal as="p" className="label-text text-accent mb-8">
            ●&nbsp; CAREERS
          </Reveal>
          <Reveal as="h1" className="reveal-delay-1 font-serif text-[48px] md:text-[72px] lg:text-[88px] text-[#111111] leading-[1.05] tracking-tight">
            Build Your Career
            <br />
            <span className="text-accent">While Making a Difference.</span>
          </Reveal>
          <Reveal as="p" className="reveal-delay-2 mt-8 text-base md:text-lg text-[#111111]/50 max-w-[600px] mx-auto leading-relaxed">
            Join our team and contribute to meaningful social change. We're looking for passionate people who want to
            create real impact.
          </Reveal>
        </div>
      </section>

      <section className="bg-warm-alt py-24 md:py-28 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <Reveal as="p" className="label-text text-accent mb-6">
              ●&nbsp; WHY JOIN US
            </Reveal>
            <Reveal as="h2" className="reveal-delay-1 font-serif text-[32px] md:text-[44px] text-[#111111] leading-[1.1] tracking-tight">
              More Than a Job.
            </Reveal>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {perks.map((p, i) => (
              <Reveal key={p.title} className={`perk-item text-center p-6 ${i > 0 ? `reveal-delay-${i}` : ""}`}>
                <div className="w-12 h-12 rounded-full border border-accent/25 flex items-center justify-center mx-auto mb-4">
                  <Icon icon={p.icon} className="w-5 h-5 text-accent" />
                </div>
                <h4 className="font-serif text-lg text-[#111111] mb-1.5">{p.title}</h4>
                <p className="text-xs text-[#111111]/35 leading-relaxed">{p.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-warm py-28 md:py-36 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Reveal as="p" className="label-text text-accent mb-6">
              ●&nbsp; OPEN POSITIONS
            </Reveal>
            <Reveal as="h2" className="reveal-delay-1 font-serif text-[36px] md:text-[48px] lg:text-[56px] text-[#111111] leading-[1.1] tracking-tight mb-6">
              Current Openings
            </Reveal>
            <Reveal as="p" className="reveal-delay-2 text-base text-[#111111]/45 leading-relaxed">
              We're actively looking for talented individuals to join our mission. Find a role that fits your skills
              and passion.
            </Reveal>
          </div>

          <Reveal className="max-w-xl mx-auto bg-warm-alt border border-[#111111]/[0.07] rounded-2xl p-10 text-center">
            <Icon icon="lucide:coffee" className="w-8 h-8 text-accent mx-auto block mb-4" />
            <p className="text-base text-[#111111]/50 leading-relaxed">
              We're not actively hiring right now — check back soon, or reach out directly at{" "}
              <a href={`mailto:${CAREER_EMAIL}`} className="text-accent font-medium hover:underline">
                {CAREER_EMAIL}
              </a>
              .
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-warm-alt py-24 md:py-28 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <Reveal className="bg-warm border border-[#111111]/[0.07] rounded-2xl p-8 md:p-12 text-center">
              <Icon icon="lucide:send" className="w-10 h-10 text-accent mx-auto block mb-6" />
              <h2 className="font-serif text-[32px] md:text-[40px] text-[#111111] leading-[1.15] tracking-tight mb-4">Don't See the Right Fit?</h2>
              <p className="text-base text-[#111111]/45 leading-relaxed mb-8 max-w-lg mx-auto">
                We're always open to hearing from talented and passionate individuals. Send us your resume and tell us
                how you'd like to contribute.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={`mailto:${CAREER_EMAIL}`}
                  className="btn-press bg-accent text-white text-sm font-medium px-7 py-3.5 rounded-sm hover:bg-[#d93a56] hover:shadow-lg hover:shadow-accent/20 transition-all duration-400"
                >
                  Send Your Resume <span className="inline-block ml-1">→</span>
                </a>
                <Link
                  to="/contact"
                  className="btn-press border border-[#111111]/[0.1] text-[#111111] text-sm font-medium px-7 py-3.5 rounded-sm hover:border-[#111111]/20 hover:shadow-sm transition-all duration-400"
                >
                  Contact Us <span className="inline-block ml-1">→</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-warm py-28 md:py-36 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal as="p" className="label-text text-accent mb-6">
              ●&nbsp; VOLUNTEER
            </Reveal>
            <Reveal as="h2" className="reveal-delay-1 font-serif text-[36px] md:text-[48px] lg:text-[56px] text-[#111111] leading-[1.1] tracking-tight mb-6">
              Not Looking for a Job?
            </Reveal>
            <Reveal as="p" className="reveal-delay-2 text-base text-[#111111]/45 leading-relaxed mb-10 max-w-lg mx-auto">
              You don't need a formal role to make a difference. Join us as a volunteer and contribute your time,
              skills, and energy to causes that matter.
            </Reveal>
            <Reveal className="reveal-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contact"
                className="btn-press bg-[#111111] text-white text-sm font-medium px-8 py-3.5 rounded-sm hover:bg-[#1a1a1c] hover:shadow-lg hover:shadow-[#111111]/15 transition-all duration-400"
              >
                Become a Volunteer <span className="inline-block ml-1">→</span>
              </Link>
              <Link
                to="/contact"
                className="btn-press border border-[#111111]/[0.1] text-[#111111] text-sm font-medium px-8 py-3.5 rounded-sm hover:border-[#111111]/20 hover:shadow-sm transition-all duration-400"
              >
                Partner With Us <span className="inline-block ml-1">→</span>
              </Link>
            </Reveal>
            <Reveal as="p" className="reveal-delay-4 mt-8 text-sm text-accent font-medium">
              10+ Active Volunteers
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
