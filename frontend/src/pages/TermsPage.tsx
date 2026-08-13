import { Reveal } from "@/components/Reveal";
import { Link } from "react-router-dom";

const EFFECTIVE_DATE = "13 August 2026";

const sections = [
  {
    id: "about",
    title: "1. About the Organisation",
    content: (
      <div className="space-y-2 text-sm text-[#111111]/60 leading-relaxed">
        <p><strong className="text-[#111111]/75">Organisation Name:</strong> Proyakh Social Foundation</p>
        <p><strong className="text-[#111111]/75">Registered Office:</strong> Kaki-1, Hojai, Assam, India</p>
        <p><strong className="text-[#111111]/75">Registration:</strong> Registered under Companies Act 2013, Ministry of Corporate Affairs, Govt. of India. CIN: U88900AS206NPL029973</p>
        <p><strong className="text-[#111111]/75">Email:</strong> hello@proyakhfoundation.org</p>
        <p><strong className="text-[#111111]/75">Phone:</strong> +91 60002 44871</p>
        <p><strong className="text-[#111111]/75">Website:</strong> www.proyakhfoundation.org</p>
        <p className="pt-2">
          Proyakh Social Foundation operates for charitable and social welfare purposes and may conduct projects and campaigns including, but not limited to, disaster relief, flood relief, livelihood support, education, healthcare, housing assistance, environmental initiatives, and community development.
        </p>
      </div>
    ),
  },
  {
    id: "acceptance",
    title: "2. Acceptance of Terms",
    content: (
      <div className="space-y-3 text-sm text-[#111111]/60 leading-relaxed">
        <p>By using this website, you confirm that:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>You are legally capable of entering into an agreement under applicable Indian law.</li>
          <li>The information you provide to us is accurate and truthful.</li>
          <li>You will use the website only for lawful purposes.</li>
          <li>You will not misuse, disrupt, attack, or attempt to gain unauthorised access to our website or systems.</li>
          <li>You agree to comply with these Terms and our <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "website-use",
    title: "3. Website Use",
    content: (
      <div className="space-y-4 text-sm text-[#111111]/60 leading-relaxed">
        <div>
          <p className="mb-2">You may use our website for legitimate purposes, including:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Learning about our organisation and activities.</li>
            <li>Supporting our charitable campaigns.</li>
            <li>Making donations via QR code, UPI, or bank transfer.</li>
            <li>Applying for career or volunteer opportunities.</li>
            <li>Contacting the organisation.</li>
            <li>Accessing publicly available reports, information, and resources.</li>
          </ul>
        </div>
        <div>
          <p className="mb-2">You must not:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Use the website for fraudulent or unlawful activities.</li>
            <li>Submit false, misleading, or impersonated information.</li>
            <li>Attempt to gain unauthorised access to the website, server, database, or administrative systems.</li>
            <li>Upload malicious software, viruses, or harmful code.</li>
            <li>Copy or reproduce website content for commercial purposes without permission.</li>
            <li>Interfere with the security or operation of the website.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "donations",
    title: "4. Donations",
    content: (
      <div className="space-y-3 text-sm text-[#111111]/60 leading-relaxed">
        <p>Donations made through our website are intended to support the charitable and humanitarian activities of Proyakh Social Foundation.</p>
        <p>Before making a donation, donors should carefully review the campaign description, intended purpose, donation amount, and payment information.</p>
        <p>We may use donations for the stated campaign or for closely related charitable activities where necessary, subject to applicable law.</p>
        <p>Where a campaign receives more funds than required, becomes impractical, or cannot proceed as originally planned, the NGO may redirect the funds towards another related charitable or humanitarian purpose, subject to applicable laws and donor restrictions.</p>
      </div>
    ),
  },
  {
    id: "payments",
    title: "5. Donation Payments",
    content: (
      <div className="space-y-3 text-sm text-[#111111]/60 leading-relaxed">
        <p>Donations may be made through QR code scan, UPI transfer, or direct bank transfer.</p>
        <p>The NGO does not directly store complete debit-card, credit-card, UPI PIN, CVV, internet-banking password, or other sensitive payment credentials on its servers.</p>
        <p>A donation is considered successfully completed only after our team verifies the payment proof (screenshot or receipt) submitted by the donor.</p>
        <p>The NGO shall not be responsible for payment failures caused by bank failures, internet connectivity problems, incorrect payment information, or technical problems outside the NGO's reasonable control.</p>
      </div>
    ),
  },
  {
    id: "receipts",
    title: "6. Donation Receipts & Tax Benefits",
    content: (
      <div className="space-y-3 text-sm text-[#111111]/60 leading-relaxed">
        <p>Where applicable, donors may receive a donation acknowledgement or receipt containing donor name, donation amount, date of donation, and transaction/reference number.</p>
        <p>Donors who wish to claim 80G tax exemption must provide a valid PAN number at the time of donation submission. The NGO will issue an 80G receipt subject to verification and applicable registrations.</p>
        <p>Donors are responsible for providing accurate information. Any tax benefit is subject to the donor satisfying requirements under applicable Indian tax laws. The NGO does not guarantee that every donation will qualify for a particular tax deduction.</p>
      </div>
    ),
  },
  {
    id: "refund",
    title: "7. Refund and Cancellation Policy",
    content: (
      <div className="space-y-3 text-sm text-[#111111]/60 leading-relaxed">
        <p>Because donations are voluntary contributions made for charitable purposes, donors should verify the amount and campaign information before completing a transaction.</p>
        <p>If a donor believes that a donation was made by mistake, more than once due to a technical error, without authorisation, or with an incorrect amount, the donor should contact us as soon as possible:</p>
        <div className="bg-[#111111]/[0.03] rounded-lg p-4 space-y-1">
          <p><strong className="text-[#111111]/75">Email:</strong> hello@proyakhfoundation.org</p>
          <p><strong className="text-[#111111]/75">Phone:</strong> +91 60002 44871</p>
        </div>
        <p>Refund requests will be reviewed on a case-by-case basis and processed in accordance with applicable law and the NGO's internal policies. Where a refund is approved, it may be made through the original payment method where technically and legally possible.</p>
      </div>
    ),
  },
  {
    id: "fund-utilisation",
    title: "8. Fund Utilisation",
    content: (
      <div className="space-y-3 text-sm text-[#111111]/60 leading-relaxed">
        <p>The NGO will endeavour to use donations responsibly and for legitimate charitable purposes. Funds may be used for expenses reasonably necessary to conduct charitable activities, including:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Relief materials, food, drinking water, and medical support.</li>
          <li>Transportation, logistics, and temporary shelter.</li>
          <li>Educational and livelihood assistance.</li>
          <li>Community development and staff field operations.</li>
          <li>Administrative, operational, monitoring, and reporting expenses.</li>
        </ul>
        <p>The NGO may publish campaign updates, expenditure summaries, photographs, and reports relating to its activities, subject to applicable privacy and legal requirements.</p>
      </div>
    ),
  },
  {
    id: "volunteers",
    title: "9. Volunteers & Careers",
    content: (
      <div className="space-y-3 text-sm text-[#111111]/60 leading-relaxed">
        <p>Individuals participating as volunteers or applying for career positions must provide accurate information, follow instructions from authorised NGO personnel, respect beneficiaries, and protect confidential information.</p>
        <p>Volunteers must not collect donations in the NGO's name without written or verifiable authorisation.</p>
        <p>The NGO may suspend or terminate a volunteer's or employee's participation where misconduct, fraud, harassment, misrepresentation, or violation of these Terms occurs.</p>
      </div>
    ),
  },
  {
    id: "ip",
    title: "10. Intellectual Property",
    content: (
      <div className="space-y-3 text-sm text-[#111111]/60 leading-relaxed">
        <p>Website content including logos, text, graphics, photographs, videos, campaign materials, reports, designs, and original software may be owned by or licensed to Proyakh Social Foundation.</p>
        <p>You may not reproduce, modify, distribute, sell, or commercially exploit such material without prior written permission, except where permitted under applicable law.</p>
      </div>
    ),
  },
  {
    id: "privacy",
    title: "11. Privacy",
    content: (
      <p className="text-sm text-[#111111]/60 leading-relaxed">
        Our collection, use, storage, and processing of personal information are governed by our <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>. By using our website, you acknowledge that you have read and understood the Privacy Policy.
      </p>
    ),
  },
  {
    id: "security",
    title: "12. Security",
    content: (
      <div className="space-y-3 text-sm text-[#111111]/60 leading-relaxed">
        <p>We take reasonable technical and organisational measures to protect our website and information systems. However, no online system can be guaranteed to be completely secure.</p>
        <p>Users should not share passwords, OTPs, UPI PINs, card PINs, CVVs, or other confidential financial credentials with anyone claiming to represent the NGO. The NGO will never ask donors to disclose their UPI PIN, ATM PIN, card PIN, CVV, or banking password.</p>
      </div>
    ),
  },
  {
    id: "liability",
    title: "13. Limitation of Liability",
    content: (
      <p className="text-sm text-[#111111]/60 leading-relaxed">
        To the maximum extent permitted by applicable law, the NGO shall not be liable for indirect, incidental, special, consequential, or unforeseeable losses arising from the use of the website or third-party services. Nothing in these Terms is intended to exclude or limit liability that cannot legally be excluded or limited under applicable Indian law.
      </p>
    ),
  },
  {
    id: "changes",
    title: "14. Changes to These Terms",
    content: (
      <p className="text-sm text-[#111111]/60 leading-relaxed">
        The NGO may update these Terms from time to time. The updated Terms will be published on this website with a revised "Last Updated" date. Continued use of the website after an update constitutes acceptance of the revised Terms, to the extent permitted by applicable law.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "15. Governing Law",
    content: (
      <p className="text-sm text-[#111111]/60 leading-relaxed">
        These Terms shall be governed by and interpreted in accordance with the laws applicable in India. Subject to applicable law, disputes relating to these Terms shall be subject to the jurisdiction of the competent courts having jurisdiction over the NGO's registered office in Assam.
      </p>
    ),
  },
  {
    id: "contact",
    title: "16. Contact Us",
    content: (
      <div className="space-y-2 text-sm text-[#111111]/60 leading-relaxed">
        <p>For questions, complaints, donation-related issues, refund requests, or concerns regarding these Terms, please contact:</p>
        <div className="bg-[#111111]/[0.03] rounded-lg p-4 space-y-1.5">
          <p className="font-medium text-[#111111]/75">Proyakh Social Foundation</p>
          <p>Kaki-1, Hojai, Assam, India</p>
          <p>Email: hello@proyakhfoundation.org</p>
          <p>Phone: +91 60002 44871</p>
        </div>
      </div>
    ),
  },
];

export function TermsPage() {
  return (
    <>
      <section className="bg-warm pt-36 pb-16 md:pt-44 md:pb-20">
        <div className="max-w-container mx-auto px-6 text-center">
          <Reveal as="p" className="label-text text-accent mb-8">
            ●&nbsp; LEGAL
          </Reveal>
          <Reveal as="h1" className="reveal-delay-1 font-serif text-[48px] md:text-[64px] lg:text-[80px] text-[#111111] leading-[1.05] tracking-tight">
            Terms &amp;
            <br />
            <span className="text-accent">Conditions</span>
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
              Welcome to Proyakh Social Foundation. By accessing or using our website or services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these Terms, please do not use our website or services.
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
