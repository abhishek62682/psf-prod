import { Link } from "react-router-dom";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@iconify/react";

const LOGO_SRC = "/images/logo.webp";

export function Footer() {
  return (
    <footer className="bg-warm-dark pt-20 pb-10">
      <div className="max-w-container mx-auto px-6">
        <Reveal className="text-center mb-16">
          <a href="#" className="inline-flex flex-col items-center gap-4 mb-6 logo-wrap">
            <img src={LOGO_SRC} alt="Proyakh Social Foundation" className="logo-img footer-logo rounded-full object-cover" />
            <span className="footer-name text-[#111111]">Proyakh Social Foundation</span>
          </a>
          <p className="text-sm text-[#111111]/40 leading-relaxed max-w-md mx-auto mb-8">
            Together, we can create meaningful change and build a better tomorrow for every community.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a target="_blank" href="https://www.instagram.com/proyakh008/?hl=en" rel="noopener noreferrer" className="social-icon w-9 h-9 rounded-full border border-[#111111]/10 flex items-center justify-center text-[#111111]/35">
              <Icon icon="lucide:instagram" className="w-4 h-4" />
            </a>
            <a
              href="https://www.facebook.com/people/Proyakh-Social-Foundation/61587000836247/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon w-9 h-9 rounded-full border border-[#111111]/10 flex items-center justify-center text-[#111111]/35"
            >
              <Icon icon="lucide:facebook" className="w-4 h-4" />
            </a>
            <a
              href="https://www.youtube.com/@proyakhsocialfoundation"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon w-9 h-9 rounded-full border border-[#111111]/10 flex items-center justify-center text-[#111111]/35"
            >
              <Icon icon="mdi:youtube" className="w-4 h-4" />
            </a>
          </div>
        </Reveal>

        <div className="flex flex-wrap justify-center gap-x-14 gap-y-10 pb-16 border-t border-[#111111]/[0.06] pt-12 max-w-3xl mx-auto">
          <Reveal className="text-center">
            <h4 className="label-text text-[#111111]/40 mb-5">Explore</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="footer-link text-sm text-[#111111]/35">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/campaigns" className="footer-link text-sm text-[#111111]/35">
                  Campaigns
                </Link>
              </li>
              <li>
                <Link to="/donors" className="footer-link text-sm text-[#111111]/35">
                  Donors
                </Link>
              </li>
              <li>
                <Link to="/contact" className="footer-link text-sm text-[#111111]/35">
                  Contact
                </Link>
              </li>
            </ul>
          </Reveal>
          <Reveal className="text-center reveal-delay-1">
            <h4 className="label-text text-[#111111]/40 mb-5">About</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="footer-link text-sm text-[#111111]/35">
                  Who We Are
                </Link>
              </li>
              <li>
                <Link to="/latest-events" className="footer-link text-sm text-[#111111]/35">
                  Latest Events
                </Link>
              </li>
              <li>
                <Link to="/governance" className="footer-link text-sm text-[#111111]/35">
                  Governance
                </Link>
              </li>
            </ul>
          </Reveal>
          <Reveal className="text-center reveal-delay-2">
            <h4 className="label-text text-[#111111]/40 mb-5">Get Involved</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/donate" className="footer-link text-sm text-[#111111]/35">
                  Donate Now
                </Link>
              </li>
            </ul>
          </Reveal>
          <Reveal className="text-center reveal-delay-3">
            <h4 className="label-text text-[#111111]/40 mb-5">Contact Us</h4>
            <ul className="space-y-3">
<li className="text-sm text-[#111111]/35">
  <a href="tel:+916000244871" className="text-inherit no-underline">
    +91 60002 44871
  </a>
</li>
              <li>
                <a href="mailto:hello@proyakhfoundation.org" className="footer-link text-sm text-[#111111]/35 break-words">
                  hello@<wbr />proyakhfoundation.org
                </a>
              </li>
              <li>
                <a href="mailto:career@proyakhfoundation.org" className="footer-link text-sm text-[#111111]/35 break-words">
                  career@<wbr />proyakhfoundation.org
                </a>
              </li>
              <li className="text-sm text-[#111111]/35">Kaki-1, Hojai, Assam</li>
            </ul>
          </Reveal>
        </div>

        <div className="text-center pt-8 max-w-3xl mx-auto space-y-2">
          <p className="text-xs text-[#111111]/20">© 2026 Proyakh Social Foundation. All rights reserved.</p>
          <p className="text-[11px] text-[#111111]/20">
            REGD. UNDER COMPANIES ACT 2013, MINISTRY OF CORPORATE AFFAIRS, GOVT. OF ASSAM. CIN-U88900AS206NPL029973
          </p>
          <div className="flex items-center justify-center gap-4 pt-1">
            <Link to="/terms" className="text-[11px] text-[#111111]/25 hover:text-[#111111]/45 transition-colors">Terms &amp; Conditions</Link>
            <span className="text-[#111111]/15">·</span>
            <Link to="/privacy" className="text-[11px] text-[#111111]/25 hover:text-[#111111]/45 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
