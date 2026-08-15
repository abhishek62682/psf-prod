import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useScrollState } from "@/hooks/useScrollState";
import { Icon } from "@iconify/react";

const LOGO_SRC = "/wordmark-logo.png";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `nav-link text-sm font-medium ${isActive ? "text-[#111111]" : "text-[#111111]/55 hover:text-[#111111]"}`;

export function Header() {
  const { progress, scrolled } = useScrollState();
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    setAboutOpen(false);
  };

  return (
    <>
      <div
        id="scrollProgress"
        className="fixed top-0 left-0 right-0 h-[2px] bg-accent z-[70]"
        style={{ transform: `scaleX(${progress})` }}
      />

      <nav
        id="navbar"
        className={`fixed top-0 left-0 right-0 z-50 bg-warm border-b border-[#111111]/[0.04] ${scrolled ? "scrolled" : ""}`}
      >
        <div className="max-w-container mx-auto px-6 flex items-center justify-between h-22">
          <div className="flex items-center gap-3.5">
            <Link to="/" className="flex items-center gap-3 shrink-0 logo-wrap">
              <img src={LOGO_SRC} alt="Proyakh Social Foundation" className="logo-img w-24 md:w-30  object-cover" />
            
            </Link>
           
          </div>
           <div className="hidden lg:flex items-center gap-8 ml-8">
              <NavLink to="/" end className={navLinkClass}>
                Home
              </NavLink>
              <div className="relative nav-group">
                <button className="nav-link text-sm font-medium text-[#111111]/55 hover:text-[#111111] flex items-center gap-1">
                  About Us <Icon icon="lucide:chevron-down" className="w-3.5 h-3.5" />
                </button>
                <div className="nav-dropdown absolute top-full left-0 pt-3">
                  <div className="bg-warm border border-[#111111]/10 py-2 min-w-[190px] rounded-sm shadow-sm">
                    <Link to="/about" className="block px-4 py-2.5 text-sm text-[#111111]/55 hover:text-[#111111] hover:bg-[#111111]/[0.03] transition-colors duration-200">
                      Who We Are
                    </Link>
                    <Link to="/governance" className="block px-4 py-2.5 text-sm text-[#111111]/55 hover:text-[#111111] hover:bg-[#111111]/[0.03] transition-colors duration-200">
                      Governance
                    </Link>
                  </div>
                </div>
              </div>
              <NavLink to="/campaigns" className={navLinkClass}>
                Campaigns
              </NavLink>
              <NavLink to="/donors" className={navLinkClass}>
                Donors
              </NavLink>
              <NavLink to="/latest-events" className={navLinkClass}>
              
                
                <div className="relative">
                  Latest Events

                  <span className="relative text-white font-semibold text-[10px] py-0.5 rounded-[10px] px-2 -top-3 text-xs bg-[#dc2626]">New</span>
                </div>
              </NavLink>
              <NavLink to="/contact" className={navLinkClass}>
                Contact
              </NavLink>
            </div>
          <div className="flex items-center">
            <Link
              to="/donate"
              className="btn-press bg-accent text-white text-sm font-medium px-5 py-2.5 rounded-sm hover:bg-[#d93a56] hover:shadow-lg hover:shadow-accent/20 transition-all duration-400 group"
            >
              Donate Now <span className="inline-block ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-[#111111] hover:text-accent transition-colors duration-300 ml-3"
            >
              <Icon icon="lucide:menu" className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      <div id="mobileMenu" className={`mobile-menu  fixed inset-0 z-[60] bg-warm ${menuOpen ? "open" : ""}`}>
        <div className="flex items-center justify-between px-6 h-16">
          <Link to="/" className="flex items-center gap-3 logo-wrap" onClick={closeMenu}>
            <img src={LOGO_SRC} alt="Proyakh" className="logo-img w-24 object-cover" />
            
          </Link>
          <button
            onClick={closeMenu}
            className="w-10 h-10 flex items-center justify-center text-[#111111] hover:text-accent transition-colors duration-300"
          >
            <Icon icon="lucide:x" className="w-6 h-6" />
          </button>
        </div>
        <div className="px-6 pt-8 flex flex-col gap-5">
          <Link to="/" className="text-2xl font-serif text-[#111111] hover:text-accent transition-colors duration-300" onClick={closeMenu}>
            Home
          </Link>
          <div>
            <button
              onClick={() => setAboutOpen((v) => !v)}
              className="flex items-center gap-2 text-2xl font-serif text-[#111111]/50 hover:text-accent transition-colors duration-300"
            >
              About Us <Icon icon="lucide:chevron-down" className={`w-4 h-4 transition-transform duration-300 ${aboutOpen ? "rotate-180" : ""}`} />
            </button>
            {aboutOpen && (
              <div className="flex flex-col gap-4 mt-4 pl-4 border-l border-[#111111]/10">
                <Link to="/about" className="text-lg font-serif text-[#111111]/50 hover:text-accent transition-colors duration-300" onClick={closeMenu}>
                  Who We Are
                </Link>
                <Link to="/governance" className="text-lg font-serif text-[#111111]/50 hover:text-accent transition-colors duration-300" onClick={closeMenu}>
                  Governance
                </Link>
              </div>
            )}
          </div>
          <Link to="/campaigns" className="text-2xl font-serif text-[#111111]/50 hover:text-accent transition-colors duration-300" onClick={closeMenu}>
            Campaigns
          </Link>
          <Link to="/donors" className="text-2xl font-serif text-[#111111]/50 hover:text-accent transition-colors duration-300" onClick={closeMenu}>
            Donors
          </Link>
          <Link to="/latest-events" className="text-2xl font-serif text-[#111111]/50 hover:text-accent transition-colors duration-300" onClick={closeMenu}>
            <div className="relative">
                  Latest Events

                  <span className="relative font-secondary font-sans text-white font-semibold text-[10px] py-0.5 rounded-[10px] px-2 -top-3 left-2 text-xs bg-[#dc2626]">New</span>
                </div>
          </Link>
          <Link to="/contact" className="text-2xl font-serif text-[#111111]/50 hover:text-accent transition-colors duration-300" onClick={closeMenu}>
            Contact
          </Link>
          <div className="border-t border-[#111111]/10 pt-6 mt-4">
            <Link
              to="/donate"
              onClick={closeMenu}
              className="btn-press bg-accent text-white text-sm font-medium px-6 py-3.5 rounded-sm w-fit hover:bg-[#d93a56] transition-all duration-400 inline-block"
            >
              Donate Now →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
