import useSWR from "swr";
import { Link } from "react-router-dom";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@iconify/react";
import { listCareers } from "@/config/api/career.api";
import type { Career, CareerEmploymentType } from "@/config/api/career.api";

const CAREER_EMAIL = "career@proyakhfoundation.org";

const perks = [
  { icon: "lucide:heart-handshake", title: "Purpose-Driven", desc: "Work that directly impacts communities in need." },
  { icon: "lucide:users", title: "Supportive Team", desc: "Collaborate with passionate, like-minded people." },
  { icon: "lucide:trending-up", title: "Growth", desc: "Develop skills in social work and leadership." },
  { icon: "lucide:map-pin", title: "Local Impact", desc: "Work closely with communities in Assam." },
];

const employmentTypeLabels: Record<CareerEmploymentType, string> = {
  "full-time": "Full-Time",
  "part-time": "Part-Time",
  internship: "Internship",
};

const employmentTypeStyles: Record<CareerEmploymentType, string> = {
  "full-time": "bg-accent/10 text-accent",
  "part-time": "bg-accent/10 text-accent",
  internship: "bg-lavender/30 text-[#7B6CB0]",
};

const workModeLabels: Record<Career["workMode"], string> = {
  "on-site": "On-Site",
  hybrid: "Hybrid",
  remote: "Remote",
};

const applyMailto = (c: Career) => {
  const subject = `Application for ${c.title}`;
  const body = `Hi,\n\nI am interested in applying for the ${c.title} position at Proyakh Social Foundation.\n\nPlease find my resume/details below.\n\nThanks,`;
  return `mailto:${CAREER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

export function CareersPage() {
  const { data: positions, isLoading, error } = useSWR("careers", listCareers);
  const list = positions ?? [];

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

          {isLoading && <p className="text-center text-sm text-[#111111]/30">Loading open positions…</p>}

          {error && (
            <p className="text-center text-sm text-accent">Couldn't load open positions right now. Please try again later.</p>
          )}

          {!isLoading && !error && list.length === 0 && (
            <p className="text-center text-sm text-[#111111]/30">No open positions right now. Check back soon.</p>
          )}

          <div className="space-y-6 max-w-3xl mx-auto">
            {list.map((p, i) => (
              <Reveal key={p._id} className={`vacancy-card bg-warm-alt border border-[#111111]/[0.07] rounded-2xl p-8 md:p-10 ${i > 0 ? `reveal-delay-${i}` : ""}`}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2.5 mb-4">
                      <span className={`tag ${employmentTypeStyles[p.employmentType]} px-3 py-1 rounded-sm text-[10px] font-semibold tracking-wide uppercase`}>
                        {employmentTypeLabels[p.employmentType]}
                      </span>
                      <span className="tag bg-[#111111]/[0.04] text-[#111111]/40 px-3 py-1 rounded-sm text-[10px] font-semibold tracking-wide uppercase">
                        {workModeLabels[p.workMode]}
                      </span>
                      <span className="tag bg-[#111111]/[0.04] text-[#111111]/40 px-3 py-1 rounded-sm text-[10px] font-semibold tracking-wide uppercase">
                        {p.location}
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl md:text-[28px] text-[#111111] leading-[1.15] mb-3">{p.title}</h3>
                    <p className="text-sm text-[#111111]/40 leading-relaxed mb-5">{p.description}</p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#111111]/35">
                      <span className="flex items-center gap-1.5">
                        <Icon icon={p.employmentType === "internship" ? "lucide:clock" : "lucide:briefcase"} className="w-3.5 h-3.5" />
                        {p.experience}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon icon="lucide:graduation-cap" className="w-3.5 h-3.5" />
                        {p.qualification}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 md:pt-1">
                    <a
                      href={applyMailto(p)}
                      className="btn-press bg-[#111111] text-white text-sm font-medium px-6 py-3 rounded-sm hover:bg-[#1a1a1c] hover:shadow-lg hover:shadow-[#111111]/15 transition-all duration-400 inline-flex items-center gap-2 group"
                    >
                      Apply Now
                      <Icon icon="lucide:arrow-right" className="w-4 h-4 vacancy-arrow" />
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
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
