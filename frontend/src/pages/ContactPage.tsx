import { useState } from "react";
import type { FormEvent } from "react";
import { Icon } from "@iconify/react";
import { Reveal } from "@/components/Reveal";
import { submitContact } from "@/config/api/contact.api";
import type { ContactInterest } from "@/config/api/contact.api";
import type { AxiosError } from "axios";

const chips: { key: ContactInterest; label: string }[] = [
  { key: "volunteer", label: "Become a Volunteer" },
  { key: "partner", label: "Partner With Us" },
  { key: "career", label: "Career Opportunities" },
];

export function ContactPage() {
  // Single-select — clicking a chip again clears it. No extra fields per
  // chip; the selection itself is all the backend's `interest` needs.
  const [interest, setInterest] = useState<ContactInterest | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleChip = (chip: ContactInterest) => {
    setInterest((prev) => (prev === chip ? "" : chip));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const fullName = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    setSubmitting(true);
    try {
      await submitContact({
        fullName,
        email,
        phone: phone || undefined,
        subject,
        message,
        interest: interest || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setSubmitError(axiosErr.response?.data?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setSubmitError(null);
    setInterest("");
  };

  return (
    <>
      <section className="bg-warm pt-36 pb-20 md:pt-44 md:pb-28">
        <div className="max-w-container mx-auto px-6 text-center">
          <Reveal as="p" className="label-text text-accent mb-8">
            ●&nbsp; CONTACT US
          </Reveal>
          <Reveal as="h1" className="reveal-delay-1 font-serif text-[48px] md:text-[72px] lg:text-[88px] text-[#111111] leading-[1.05] tracking-tight">
            Let's Start a
            <br />
            <span className="text-accent">Conversation.</span>
          </Reveal>
          <Reveal as="p" className="reveal-delay-2 mt-8 text-base md:text-lg text-[#111111]/50 max-w-[600px] mx-auto leading-relaxed">
            Have a question, want to collaborate, or interested in joining our team? We'd love to hear from you.
          </Reveal>
        </div>
      </section>

      <section className="bg-warm-alt py-16 md:py-20 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-5xl mx-auto">
            <Reveal className="contact-info-card bg-warm border border-[#111111]/[0.07] rounded-xl p-6 text-center">
              <div className="w-11 h-11 rounded-full border border-accent/25 flex items-center justify-center mx-auto mb-4">
                <Icon icon="lucide:phone" className="w-5 h-5 text-accent" />
              </div>
              <h4 className="font-serif text-lg text-[#111111] mb-1">Phone</h4>
              <a href="tel:+916000244871" className="text-sm text-[#111111]/40 hover:text-accent transition-colors">+91 60002 44871</a>
            </Reveal>
            <Reveal className="reveal-delay-1 contact-info-card bg-warm border border-[#111111]/[0.07] rounded-xl p-6 text-center">
              <div className="w-11 h-11 rounded-full border border-accent/25 flex items-center justify-center mx-auto mb-4">
                <Icon icon="lucide:mail" className="w-5 h-5 text-accent" />
              </div>
              <h4 className="font-serif text-lg text-[#111111] mb-1">Email</h4>
              <p className="text-sm text-[#111111]/40 break-all">hello@proyakhfoundation.org</p>
            </Reveal>
            <Reveal className="reveal-delay-2 contact-info-card bg-warm border border-[#111111]/[0.07] rounded-xl p-6 text-center">
              <div className="w-11 h-11 rounded-full border border-accent/25 flex items-center justify-center mx-auto mb-4">
                <Icon icon="lucide:map-pin" className="w-5 h-5 text-accent" />
              </div>
              <h4 className="font-serif text-lg text-[#111111] mb-1">Location</h4>
              <p className="text-sm text-[#111111]/40">Kaki-1, Hojai, Assam</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-warm-alt pb-28 md:pb-36">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <Reveal className="bg-warm border border-[#111111]/[0.07] rounded-2xl p-8 md:p-12">
              <h2 className="font-serif text-[32px] md:text-[40px] text-[#111111] leading-[1.15] tracking-tight mb-2">Send Us a Message</h2>
              <p className="text-sm text-[#111111]/40 mb-10">Fill out the form below and we'll get back to you as soon as possible.</p>

              {submitted ? (
                <div className="form-success text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                    <Icon icon="lucide:check" className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-serif text-2xl text-[#111111] mb-2">Message Sent Successfully</h3>
                  <p className="text-sm text-[#111111]/40 leading-relaxed mb-6 max-w-sm mx-auto">
                    Thank you for reaching out. Our team will review your message and get back to you shortly.
                  </p>
                  <button
                    onClick={resetForm}
                    className="btn-press border border-[#111111]/[0.1] text-[#111111] text-sm font-medium px-6 py-3 rounded-sm hover:border-[#111111]/20 hover:shadow-sm transition-all duration-400"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {submitError && (
                    <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                      <Icon icon="lucide:alert-circle" className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-600">{submitError}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block label-text text-[#111111]/40 mb-2">FULL NAME *</label>
                      <input type="text" name="name" required className="form-input w-full px-4 py-3 bg-warm-alt border border-[#111111]/[0.08] rounded-sm text-sm text-[#111111] outline-none" placeholder="Your full name" />
                    </div>
                    <div>
                      <label className="block label-text text-[#111111]/40 mb-2">EMAIL ADDRESS *</label>
                      <input type="email" name="email" required className="form-input w-full px-4 py-3 bg-warm-alt border border-[#111111]/[0.08] rounded-sm text-sm text-[#111111] outline-none" placeholder="you@example.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block label-text text-[#111111]/40 mb-2">PHONE NUMBER</label>
                      <input type="tel" name="phone" className="form-input w-full px-4 py-3 bg-warm-alt border border-[#111111]/[0.08] rounded-sm text-sm text-[#111111] outline-none" placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div>
                      <label className="block label-text text-[#111111]/40 mb-2">SUBJECT *</label>
                      <input type="text" name="subject" required className="form-input w-full px-4 py-3 bg-warm-alt border border-[#111111]/[0.08] rounded-sm text-sm text-[#111111] outline-none" placeholder="What is this about?" />
                    </div>
                  </div>
                  <div className="mb-5">
                    <label className="block label-text text-[#111111]/40 mb-2">MESSAGE *</label>
                    <textarea name="message" required rows={5} className="form-input w-full px-4 py-3 bg-warm-alt border border-[#111111]/[0.08] rounded-sm text-sm text-[#111111] outline-none resize-none" placeholder="Tell us how we can help..." />
                  </div>

                  <div className="border-t border-[#111111]/[0.05] pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <label className="label-text text-[#111111]/35">OPTIONAL — I'M ALSO INTERESTED IN</label>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {chips.map((c) => (
                        <div
                          key={c.key}
                          onClick={() => toggleChip(c.key)}
                          className={`option-chip flex items-center gap-2.5 px-4 py-2.5 border border-[#111111]/[0.08] rounded-full ${interest === c.key ? "selected" : ""}`}
                        >
                          <span className="chip-dot w-4 h-4 rounded-full border-2 border-[#111111]/[0.15] relative shrink-0 transition-all duration-300"></span>
                          <span className="text-sm text-[#111111]/50 transition-colors duration-300">{c.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-10">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-press bg-accent text-white text-sm font-medium px-8 py-4 rounded-sm hover:bg-[#d93a56] hover:shadow-lg hover:shadow-accent/20 transition-all duration-400 w-full sm:w-auto disabled:opacity-60"
                    >
                      {submitting ? "Sending..." : "Send Message"} <span className="inline-block ml-1">→</span>
                    </button>
                  </div>
                </form>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-warm py-28 md:py-36 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <Reveal as="p" className="label-text text-accent mb-6">
              ●&nbsp; FIND US
            </Reveal>
            <Reveal as="h2" className="reveal-delay-1 font-serif text-[36px] md:text-[48px] text-[#111111] leading-[1.1] tracking-tight mb-6">
              Visit Us
            </Reveal>
            <Reveal as="p" className="reveal-delay-2 text-base text-[#111111]/45 leading-relaxed">
              We're based in Kaki-1, Hojai, in the Hojai district of Assam. Feel free to reach out before visiting.
            </Reveal>
          </div>

          <Reveal className="reveal-delay-3 max-w-4xl mx-auto">
            <div className="bg-warm-alt border border-[#111111]/[0.07] rounded-2xl overflow-hidden">
              <div className="aspect-[16/7] bg-[#E8E4DD] relative">
                <iframe
                  title="Proyakh Social Foundation location — Kaki-1, Hojai, Assam"
                  src="https://www.google.com/maps?q=25.9988451,93.0090667&z=17&output=embed"
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <div className="p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-serif text-lg text-[#111111] mb-1">Proyakh Social Foundation</h4>
                  <p className="text-sm text-[#111111]/40">Kaki-1, Hojai, Assam, India</p>
                </div>
                <a
                  href="https://www.google.com/maps/place/Proyakh+Social+Foundation/@25.9988499,93.0064918,17z/data=!3m1!4b1!4m6!3m5!1s0x374573004b1ab603:0x6812fddfc75a72c4!8m2!3d25.9988451!4d93.0090667!16s%2Fg%2F11zg3sm6fv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-press border border-[#111111]/[0.1] text-[#111111] text-sm font-medium px-5 py-2.5 rounded-sm hover:border-[#111111]/20 hover:shadow-sm transition-all duration-400 inline-flex items-center gap-2 shrink-0"
                >
                  <Icon icon="lucide:external-link" className="w-4 h-4" />
                  Open in Maps
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
