import { useEffect, useState } from "react";

// Mirrors the original site's #scrollProgress + navbar `.scrolled` toggle:
// rAF-throttled scroll listener computing both scroll progress (0-1) and
// whether the page has scrolled past 30px.
export function useScrollState() {
  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0);
      setScrolled(scrollTop > 30);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    onScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { progress, scrolled };
}
