import { useState } from "react";
import { Icon } from "@iconify/react";
import { Reveal } from "@/components/Reveal";

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
  className?: string;
}

// Matches the original toggleFaq(): only one item open at a time, closing
// the previously-open one whenever a new one is opened.
export function FaqAccordion({ items, className = "" }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={`divide-y divide-[#111111]/10 ${className}`}>
      {items.map((item, i) => {
        const isActive = openIndex === i;
        const delayClass = i > 0 && i <= 6 ? `reveal-delay-${Math.min(i, 3)}` : "";
        return (
          <Reveal key={item.question} className={`faq-item ${delayClass} ${isActive ? "active" : ""}`}>
            <button
              className="faq-toggle w-full flex items-center justify-between py-5 text-left group"
              onClick={() => setOpenIndex(isActive ? null : i)}
            >
              <span className="text-base font-medium text-[#111111] pr-6 transition-colors duration-300 group-hover:text-[#111111]/70">
                {item.question}
              </span>
              <span className="faq-icon w-7 h-7 rounded-full border border-[#111111]/12 flex items-center justify-center shrink-0">
                <Icon icon="lucide:plus" className="w-4 h-4 text-[#111111]/40" />
              </span>
            </button>
            <div className={`faq-answer ${isActive ? "open" : ""}`} style={{ maxHeight: isActive ? "300px" : "0px" }}>
              <p className="text-sm text-[#111111]/40 leading-relaxed pb-5">{item.answer}</p>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
