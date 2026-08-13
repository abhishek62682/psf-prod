import { useEffect, useRef, useState } from "react";
import type { ElementType, ReactNode } from "react";

interface RevealProps {
  as?: ElementType;
  className?: string;
  img?: boolean;
  children?: ReactNode;
  [key: string]: unknown;
}

// React equivalent of the original site's IntersectionObserver-based
// .reveal/.visible (and .img-reveal/.visible) scroll-in animation.
export function Reveal({ as: Tag = "div", className = "", img = false, children, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const base = img ? "img-reveal" : "reveal";

  return (
    <Tag ref={ref} className={`${base}${visible ? " visible" : ""} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
