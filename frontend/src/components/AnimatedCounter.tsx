import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  className?: string;
}

// Matches the original animateCounter(): easeOutQuart over 1800ms, triggered
// once when scrolled into view, formatted with en-IN locale grouping.
export function AnimatedCounter({ target, suffix = "", className = "" }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);

          const start = performance.now();
          const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

          const update = (now: number) => {
            const p = Math.min((now - start) / 1800, 1);
            setValue(Math.floor(easeOutQuart(p) * target));
            if (p < 1) requestAnimationFrame(update);
            else setValue(target);
          };
          requestAnimationFrame(update);
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString("en-IN")}
      {suffix && <span className="text-accent">{suffix}</span>}
    </span>
  );
}
