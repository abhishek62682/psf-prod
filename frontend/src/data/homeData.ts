// Shape the "Recent Supporters" ticker renders — populated live from
// GET /api/donations/recents (see src/config/api/donation.api.ts).
export interface RecentDonor {
  name: string;
  date: string;
  campaign: string;
  amount: string;
}

export const homeFaqItems = [
  {
    question: "How is my donation used?",
    answer:
      "Every donation goes directly toward funding our education, healthcare, community development, and emergency relief programs. We maintain full transparency and share detailed impact reports with our supporters.",
  },
  {
    question: "Is my donation tax-deductible?",
    answer:
      "Yes, Proyakh Social Foundation is a registered nonprofit organization. Donations are eligible for tax exemptions under Section 80G of the Income Tax Act. You will receive a donation receipt for your records.",
  },
  {
    question: "Can I volunteer with Proyakh Social Foundation?",
    answer:
      "Absolutely. We welcome volunteers who want to contribute their time and skills. Whether you can help on-ground or remotely, there are many ways to get involved. Reach out to us to learn more.",
  },
  {
    question: "How can I track the impact of my donation?",
    answer:
      "We share regular impact updates through our website, newsletter, and social media channels. You can also view real-time campaign progress and detailed reports on how funds are being utilized.",
  },
  {
    question: "Can I contribute in other ways besides donating?",
    answer:
      "Yes! You can volunteer, partner with us as an organization, help fundraise within your network, or contribute in-kind resources such as books, supplies, and equipment. Every form of support matters.",
  },
  {
    question: "How can I stay updated on your work?",
    answer:
      "Subscribe to our newsletter below, or follow us on social media for the latest updates on campaigns, impact stories, and events. We believe in keeping our community informed and engaged.",
  },
];
