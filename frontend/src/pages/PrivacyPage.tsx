import { Reveal } from "@/components/Reveal";
import { Link } from "react-router-dom";

const EFFECTIVE_DATE = "13 August 2026";

const sections = [
  {
    id: "org-info",
    title: "1. Organisation Information",
    content: (
      <div className="space-y-2 text-sm text-[#111111]/60 leading-relaxed">
        <p><strong className="text-[#111111]/75">Organisation Name:</strong> Proyakh Social Foundation</p>
        <p><strong className="text-[#111111]/75">Registered Office:</strong> Kaki-1, Hojai, Assam, India</p>
        <p><strong className="text-[#111111]/75">Registration:</strong> Companies Act 2013, Ministry of Corporate Affairs, Govt. of India. CIN: U88900AS206NPL029973</p>
        <p><strong className="text-[#111111]/75">Email:</strong> hello@proyakhfoundation.org</p>
        <p><strong className="text-[#111111]/75">Phone:</strong> +91 60002 44871</p>
        <p><strong className="text-[#111111]/75">Website:</strong> www.proyakhfoundation.org</p>
      </div>
    ),
  },
  {
    id: "what-we-collect",
    title: "2. Information We Collect",
    content: (
      <div className="space-y-5 text-sm text-[#111111]/60 leading-relaxed">
        <div>
          <p className="font-medium text-[#111111]/70 mb-2">2.1 Donor Information</p>
          <p className="mb-2">When you make a donation through our website, we collect:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Full name (or "Anonymous" if you choose not to disclose).</li>
            <li>Email address and phone number.</li>
            <li>Donation amount and campaign selected.</li>
            <li>Transaction / reference number and payment method (QR, UPI, or bank transfer).</li>
            <li>Payment screenshot / proof uploaded by you.</li>
            <li>PAN number (only if you opt in to claim 80G tax exemption).</li>
            <li>Your consent regarding public display of your name on our supporters page.</li>
          </ul>
          <p className="mt-2">We do not collect or store your UPI PIN, ATM PIN, CVV, internet-banking password, or any other sensitive payment credentials.</p>
        </div>
        <div>
          <p className="font-medium text-[#111111]/70 mb-2">2.2 Contact Form Information</p>
          <p className="mb-2">When you submit a contact form, we collect:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Full name, email address.</li>
            <li>Phone number (optional).</li>
            <li>Subject and message.</li>
            <li>Area of interest: volunteer, partner, or career (optional).</li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-[#111111]/70 mb-2">2.3 Career Applications</p>
          <p>Career applications are submitted directly via email to career@proyakhfoundation.org. Any information you voluntarily include in that email (resume, cover letter, contact details) is received and stored by us for recruitment purposes only.</p>
        </div>
        <div>
          <p className="font-medium text-[#111111]/70 mb-2">2.4 Technical & Website Information</p>
          <p className="mb-2">When you visit our website, certain information may be automatically collected:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>IP address, browser type, device type, and operating system.</li>
            <li>Pages visited, date and time of access, and referring website.</li>
            <li>Error and diagnostic information.</li>
          </ul>
          <p className="mt-2">This information is used for website security, performance monitoring, and improvement.</p>
        </div>
      </div>
    ),
  },
  {
    id: "how-we-use",
    title: "3. How We Use Your Information",
    content: (
      <div className="space-y-3 text-sm text-[#111111]/60 leading-relaxed">
        <p>We use personal information only for legitimate organisational purposes, including:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Verifying and recording your donation, and updating campaign progress.</li>
          <li>Issuing donation acknowledgements and 80G receipts where applicable.</li>
          <li>Displaying your name on our public supporters page (only if you give consent).</li>
          <li>Responding to enquiries and contact form submissions.</li>
          <li>Processing career and volunteer applications.</li>
          <li>Maintaining accounting, financial, and legal records.</li>
          <li>Fraud prevention and website security.</li>
          <li>Sending campaign updates or important organisational announcements (you may opt out of non-essential communications).</li>
        </ul>
        <p>We will not use personal information for purposes unrelated to the reason for which it was collected unless permitted or required by applicable law.</p>
      </div>
    ),
  },
  {
    id: "public-display",
    title: "4. Public Display of Donor Information",
    content: (
      <div className="space-y-3 text-sm text-[#111111]/60 leading-relaxed">
        <p>When you make a donation, you can choose whether your name appears publicly on our supporters page. If you do not enable this option, you will be listed as "Anonymous".</p>
        <p>The following information may appear on our public supporters page, and only if you give explicit consent:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Your chosen display name.</li>
          <li>Donation amount.</li>
          <li>Campaign supported.</li>
          <li>Date of donation.</li>
        </ul>
        <p>Your phone number, email address, transaction ID, PAN number, and payment screenshots are <strong className="text-[#111111]/75">never displayed publicly</strong> under any circumstances.</p>
      </div>
    ),
  },
  {
    id: "sharing",
    title: "5. Sharing of Personal Information",
    content: (
      <div className="space-y-3 text-sm text-[#111111]/60 leading-relaxed">
        <p>We do not sell or rent personal information to third parties.</p>
        <p>We may share information where reasonably necessary with:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Cloud hosting and website service providers.</li>
          <li>Accounting and auditing professionals.</li>
          <li>Legal or professional advisers.</li>
          <li>Government authorities where legally required.</li>
          <li>Law-enforcement agencies where legally required.</li>
        </ul>
        <p>Where practical, we limit shared information to what is reasonably necessary for the relevant purpose.</p>
      </div>
    ),
  },
  {
    id: "beneficiary-privacy",
    title: "6. Beneficiary Privacy",
    content: (
      <div className="space-y-3 text-sm text-[#111111]/60 leading-relaxed">
        <p>We recognise that people receiving assistance may be in vulnerable circumstances. The NGO will avoid publishing unnecessary personally identifiable information about beneficiaries.</p>
        <p>Where photographs, videos, testimonials, or stories are used for awareness, documentation, or fundraising, we will seek appropriate consent. Special care is taken with children, elderly persons, disaster victims, and other vulnerable individuals.</p>
      </div>
    ),
  },
  {
    id: "data-security",
    title: "7. Data Security",
    content: (
      <div className="space-y-3 text-sm text-[#111111]/60 leading-relaxed">
        <p>We take reasonable technical and organisational measures to protect personal information, including access controls, password protection, secure hosting, and restricted administrative access.</p>
        <p>However, no internet transmission or electronic storage system can be guaranteed to be completely secure.</p>
        <p>The NGO will never ask you to disclose your UPI PIN, ATM PIN, card PIN, CVV, OTP, or internet-banking password.</p>
      </div>
    ),
  },
  {
    id: "retention",
    title: "8. Data Retention",
    content: (
      <p className="text-sm text-[#111111]/60 leading-relaxed">
        We retain personal information only for as long as reasonably necessary for the purposes for which it was collected, or where retention is required by applicable law (e.g. accounting, tax, or audit records). When information is no longer required, we securely delete or anonymise it.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "9. Your Rights",
    content: (
      <div className="space-y-3 text-sm text-[#111111]/60 leading-relaxed">
        <p>Subject to applicable law, you may request:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Information about personal data held by us.</li>
          <li>Correction of inaccurate or outdated information.</li>
          <li>Withdrawal of consent where processing is based on consent.</li>
          <li>Deletion of your data where legally permissible.</li>
        </ul>
        <p>Some requests may be subject to legal, accounting, or other legitimate restrictions. To make a privacy request, contact us using the details below.</p>
      </div>
    ),
  },
  {
    id: "cookies",
    title: "10. Cookies",
    content: (
      <div className="space-y-3 text-sm text-[#111111]/60 leading-relaxed">
        <p>Our website may use cookies or similar technologies for essential website functionality, security, session management, and analytics. You may control or disable cookies through your browser settings, though this may affect some website functionality.</p>
      </div>
    ),
  },
  {
    id: "third-party",
    title: "11. Third-Party Services",
    content: (
      <div className="space-y-3 text-sm text-[#111111]/60 leading-relaxed">
        <p>Our website may use third-party services such as cloud hosting providers, email services, and analytics services. Third-party services operate independently and have their own privacy policies. We are not responsible for the independent policies or practices of third-party platforms.</p>
        <p>Our website may contain links to external websites. You should review the privacy policy of each third-party website before submitting personal information.</p>
      </div>
    ),
  },
  {
    id: "changes",
    title: "12. Changes to This Privacy Policy",
    content: (
      <p className="text-sm text-[#111111]/60 leading-relaxed">
        We may update this Privacy Policy periodically. The updated version will be published on our website with a revised "Last Updated" date. Continued use of the website after an update constitutes acceptance of the revised Policy.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "13. Governing Law",
    content: (
      <p className="text-sm text-[#111111]/60 leading-relaxed">
        This Privacy Policy shall be governed by the laws applicable in India. Subject to applicable law, disputes relating to this Privacy Policy shall be subject to the jurisdiction of competent courts having jurisdiction over the NGO's registered office in Assam.
      </p>
    ),
  },
  {
    id: "contact",
    title: "14. Contact Us",
    content: (
      <div className="space-y-3 text-sm text-[#111111]/60 leading-relaxed">
        <p>For any privacy-related questions, complaints, or requests, please contact:</p>
        <div className="bg-[#111111]/[0.03] rounded-lg p-4 space-y-1.5">
          <p className="font-medium text-[#111111]/75">Proyakh Social Foundation</p>
          <p>Kaki-1, Hojai, Assam, India</p>
          <p>Email: hello@proyakhfoundation.org</p>
          <p>Phone: +91 60002 44871</p>
        </div>
        <p>We will endeavour to review and respond to genuine privacy complaints within a reasonable period and in accordance with applicable law.</p>
      </div>
    ),
  },
];

export function PrivacyPage() {
  return (
    <>
      <section className="bg-warm pt-36 pb-16 md:pt-44 md:pb-20">
        <div className="max-w-container mx-auto px-6 text-center">
          <Reveal as="p" className="label-text text-accent mb-8">
            ●&nbsp; LEGAL
          </Reveal>
          <Reveal as="h1" className="reveal-delay-1 font-serif text-[48px] md:text-[64px] lg:text-[80px] text-[#111111] leading-[1.05] tracking-tight">
            Privacy
           &nbsp;
            <span className="text-accent">Policy</span>
          </Reveal>
          <Reveal as="p" className="reveal-delay-2 mt-8 text-sm text-[#111111]/40 max-w-[480px] mx-auto leading-relaxed">
            Effective Date: {EFFECTIVE_DATE} &nbsp;·&nbsp; Last Updated: {EFFECTIVE_DATE}
          </Reveal>
        </div>
      </section>

      <section className="bg-warm-alt py-20 md:py-28 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <Reveal className="bg-warm border border-[#111111]/[0.06] rounded-xl px-6 py-5 mb-10 text-sm text-[#111111]/55 leading-relaxed">
              Proyakh Social Foundation is committed to protecting your privacy. This Privacy Policy explains what information we collect through our website, donation forms, contact forms, and other digital services — and how we use, store, and protect it. By using our website, you acknowledge the practices described in this Policy. See also our <Link to="/terms" className="text-accent hover:underline">Terms &amp; Conditions</Link>.
            </Reveal>

            <div className="space-y-8">
              {sections.map((s) => (
                <Reveal key={s.id} className="bg-warm border border-[#111111]/[0.06] rounded-xl p-7 md:p-8">
                  <h2 className="font-serif text-xl text-[#111111] mb-4">{s.title}</h2>
                  {s.content}
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
