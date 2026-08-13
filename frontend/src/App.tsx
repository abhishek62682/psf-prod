import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { HomePage } from "@/pages/HomePage";
import { AboutPage } from "@/pages/AboutPage";
import { OurWorkPage } from "@/pages/OurWorkPage";
import { GovernancePage } from "@/pages/GovernancePage";
import { CampaignsPage } from "@/pages/CampaignsPage";
import { CampaignDetailPage } from "@/pages/CampaignDetailPage";
import { DonorsPage } from "@/pages/DonorsPage";
import { CareersPage } from "@/pages/CareersPage";
import { ContactPage } from "@/pages/ContactPage";
import { DonatePage } from "@/pages/DonatePage";
import { TermsPage } from "@/pages/TermsPage";
import { PrivacyPage } from "@/pages/PrivacyPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/our-work" element={<OurWorkPage />} />
          <Route path="/governance" element={<GovernancePage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
          <Route path="/donors" element={<DonorsPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
