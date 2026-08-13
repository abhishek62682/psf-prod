import { useEffect, useRef, useState } from "react";

// Matches the original progress-bar fill: starts at 0%, animates to
// `target` once scrolled into view (200ms delay, then CSS transition).
export function ProgressBar({ target, className = "" }: { target: string; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState("0%");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setWidth(target), 200);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <div ref={ref} className={`progress-bar h-full bg-accent rounded-full ${className}`} style={{ width }} />;
}
