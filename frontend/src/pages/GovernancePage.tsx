import { Link } from "react-router-dom";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@iconify/react";
import generalSecretaryPankhiPriyaKalita from "@/assets/governance/general-secretary-pankhi-priya-kalita.webp";
import programmeCoordinatorRimamoniDas from "@/assets/governance/programme-coordinator-rimamoni-das.webp";
import treasurerMarijaAfrin from "@/assets/governance/treasurer-marija-afrin.webp";
import managingDirectorHemontaSaikia from "@/assets/governance/managing-director-hemonta-saikia.webp";
import chairmanMoonBorah from "@/assets/governance/chairman-moon-borah.webp";
import bibek from "@/assets/governance/bibek.webp"
import anglericky from "@/assets/governance/angle-ricky.webp"


import baharath from "@/assets/governance/bahrat.webp"
import bipasha from "@/assets/governance/bipasha.webp"
// import anushka from "@/assets/governance/anushka.webp"
import madhurima from "@/assets/governance/madhurima.webp"

interface Person {
  role: string;
  name: string;
  title: string;
  desc: string;

  image?: string;
}

const advisers: Person[] = [
  { role: "ADVISER", name: "Dr. Madhurima Goswami", title: "Adviser", desc: "Head & Associate Professor at the Chandraprabha Saikiani Centre for Women Studies, Tezpur University, Assam. ", image: madhurima },
];

const trustees: Person[] = [
  { role: "CHAIRMAN", name: "Moon Borah", title: "Founder · Director · President", desc: "Holds an M.A. in Social Work with a focus on Women and Child Development and works professionally in the field of social work.", image: chairmanMoonBorah },
  { role: "MANAGING DIRECTOR", name: "Hemonta Saikia", title: "Managing Director", desc: "Managing Director with experience in social development and education-focused initiatives in Assam.", image: managingDirectorHemontaSaikia },
  { role: "TREASURER", name: "Marija Afrin", title: "Treasurer", desc: "Responsible for supporting the Foundation's financial management, accountability, and governance.", image: treasurerMarijaAfrin },
];

const leadership: Person[] = [
  { role: "GENERAL SECRETARY", name: "Pankhi Priya Kalita", title: "General Secretary", desc: "Oversees administrative functions, coordination between departments, and ensures smooth execution of the Foundation's operations.", image: generalSecretaryPankhiPriyaKalita },
  // { role: "YOUTH & VOLUNTEER COORDINATOR", name: "Dipu Barmen", title: "Youth & Volunteer Coordinator", desc: "Manages volunteer recruitment, engagement, and coordination to ensure effective youth participation in all initiatives.", image: youthVolunteerCoordinatorDipuBarmen },
  // { role: "TRAINING COORDINATOR", name: "Biswajit Sutradhar", title: "Training Coordinator", desc: "Designs and delivers skill development workshops and training programs to empower community members with practical capabilities.", image: trainingCoordinatorBiswajitSutradhar },
  { role: "PROGRAMME COORDINATOR", name: "Rimamoni Das", title: "Programme Coordinator", desc: "Coordinates the planning, execution, and monitoring of all Foundation programs to ensure impactful and timely delivery.", image: programmeCoordinatorRimamoniDas },
  { role: "IT HEAD", name: "Bharat Dehingia", title: "IT Head", desc: "Manages the Foundation's technology infrastructure, digital tools, and IT systems to support seamless operations and growth." , image :baharath },

   { role: "Project Cordinator", name: "Bibek Bashumotary ", title: "Project Cordinator", desc: "Coordinates the planning, execution, and monitoring of all Foundation programs to ensure impactful and timely delivery.", image: bibek },
  { role: "Project Cordinator", name: " Angle Ricky Gogoi", title: "Project Cordinator", desc: "Manages the Foundation's technology infrastructure, digital tools, and IT systems to support seamless operations and growth." , image :anglericky },
  { role: "VOLUNTEER COORDINATOR", name: "Bipasha Deka", title: "Volunteer Coordinator", desc: "Holds a Master's degree in Women Studies. Coordinates volunteer recruitment, engagement, and community participation efforts.", image: bipasha },
  // { role: "ADVISER", name: "Anushka Saikia", title: "Adviser", desc: "Holds a Master's degree in Women Studies and serves as an adviser, guiding the Foundation's programs and strategic direction.", image: anushka },
];

function PersonCard({ person, index, bg = "bg-warm" }: { person: Person; index: number; bg?: string }) {
  return (
    <Reveal className={`person-card ${bg} rounded-2xl overflow-hidden ${index > 0 ? `reveal-delay-${index}` : ""}`}>
      <div className="overflow-hidden">
        {person.image ? (
          <img src={person.image} alt={person.name} className="person-photo photo-square w-full" loading="lazy" />
        ) : (
          <div className="person-photo photo-square w-full bg-[#111111]/[0.04]" aria-hidden="true" />
        )}
      </div>
      <div className="p-8">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="w-2 h-2 rounded-full bg-accent shrink-0"></span>
          <span className="label-text text-accent text-[10px]">{person.role}</span>
        </div>
        <h3 className="font-serif text-[28px] text-[#111111] leading-[1.15] mb-1">{person.name}</h3>
        <p className="text-xs text-[#111111]/30 mb-4">{person.title}</p>
        <p className="text-sm text-[#111111]/40 leading-relaxed">{person.desc}</p>
      </div>
    </Reveal>
  );
}

export function GovernancePage() {
  return (
    <>
      <section className="bg-warm pt-36 pb-20 md:pt-44 md:pb-28">
        <div className="max-w-container mx-auto px-6 text-center">
          <Reveal as="p" className="label-text text-accent mb-8">
            ●&nbsp; GOVERNANCE
          </Reveal>
          <Reveal as="h1" className="reveal-delay-1 font-serif text-[48px] md:text-[72px] lg:text-[88px] text-[#111111] leading-[1.05] tracking-tight">
            The People
            <br />
            <span className="text-accent">Behind the Mission.</span>
          </Reveal>
          <Reveal as="p" className="reveal-delay-2 mt-8 text-base md:text-lg text-[#111111]/50 max-w-[600px] mx-auto leading-relaxed">
            A dedicated team of trustees, advisors, and leaders working together to guide and strengthen our Foundation's impact.
          </Reveal>
        </div>
      </section>

      <section className="bg-warm-alt py-28 md:py-36 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Reveal as="p" className="label-text text-accent mb-6">
              ●&nbsp; OUR ADVISER
            </Reveal>
            <Reveal as="h2" className="reveal-delay-1 font-serif text-[36px] md:text-[48px] lg:text-[56px] text-[#111111] leading-[1.1] tracking-tight mb-6">
              Academic Guidance
            </Reveal>
            <Reveal as="p" className="reveal-delay-2 text-base text-[#111111]/45 leading-relaxed">
              Bringing academic and subject-matter expertise to guide the Foundation's programs and direction.
            </Reveal>
          </div>
          <div className="grid grid-cols-1 max-w-sm mx-auto">
            {advisers.map((p, i) => (
              <PersonCard key={p.name} person={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-warm py-28 md:py-36 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Reveal as="p" className="label-text text-accent mb-6">
              ●&nbsp; BOARD OF TRUSTEES
            </Reveal>
            <Reveal as="h2" className="reveal-delay-1 font-serif text-[36px] md:text-[48px] lg:text-[56px] text-[#111111] leading-[1.1] tracking-tight mb-6">
              Guiding Our Foundation
            </Reveal>
            <Reveal as="p" className="reveal-delay-2 text-base text-[#111111]/45 leading-relaxed">
              Meet the people responsible for guiding Proyakh Social Foundation's mission, governance, and long-term direction.
            </Reveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {trustees.map((p, i) => (
              <PersonCard bg={"bg-white"} key={p.name} person={p} index={i} />
            ))}
          </div>
        </div>
      </section>

    

      <section className="bg-warm-alt py-28 md:py-36 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Reveal as="p" className="label-text text-accent mb-6">
              ●&nbsp; LEADERSHIP TEAM
            </Reveal>
            <Reveal as="h2" className="reveal-delay-1 font-serif text-[36px] md:text-[48px] lg:text-[56px] text-[#111111] leading-[1.1] tracking-tight mb-6">
              On the Ground,
              <br />
              Making It Happen.
            </Reveal>
            <Reveal as="p" className="reveal-delay-2 text-base text-[#111111]/45 leading-relaxed">
              Our leadership and coordination team works together to plan initiatives, engage communities, coordinate volunteers, and carry Proyakh's mission forward.
            </Reveal>
          </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto place-items-center">
            {leadership.map((p, i) => (
              <PersonCard key={p.name} person={p} index={i} />
            ))}
          </div>
          <Reveal className="reveal-delay-6 mt-14 text-center">
            <div className="inline-flex items-center gap-3 bg-warm border border-[#111111]/[0.06] rounded-full px-6 py-3">
              <Icon icon="lucide:users" className="w-4 h-4 text-accent" />
              <span className="text-sm text-[#111111]/45">
                <strong className="text-[#111111] font-medium">10</strong> members across governance &amp; leadership
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-warm py-28 md:py-36 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal as="h2" className="font-serif text-[36px] md:text-[48px] lg:text-[56px] text-[#111111] leading-[1.1] tracking-tight mb-6">
              Want to be part of
              <br />
              <span className="text-accent">our team?</span>
            </Reveal>
            <Reveal as="p" className="reveal-delay-1 text-base text-[#111111]/45 leading-relaxed mb-10 max-w-lg mx-auto">
              We're always looking for passionate individuals who want to contribute to meaningful social change.
            </Reveal>
            <Reveal className="reveal-delay-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contact"
                className="btn-press bg-accent text-white text-sm font-medium px-8 py-3.5 rounded-sm hover:bg-[#d93a56] hover:shadow-lg hover:shadow-accent/20 transition-all duration-400"
              >
                Get in Touch <span className="inline-block ml-1">→</span>
              </Link>
              <Link
                to="/careers"
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
