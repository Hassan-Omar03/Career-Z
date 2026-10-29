import AuthNavbar from '../components/AuthNavbar';
import SiteFooter from '../components/SiteFooter';
import PageSeo from '../components/PageSeo';
import { VisaCenter } from '../components/visa/Visa';

// Public Visa & Recruitment Support Center (master 13.7).
export default function VisaPage() {
  return (
    <>
      <PageSeo title="Visa Center" description="Country work and visa rules, verified visa consultants and an AI visa assistant. CareerZ is never a visa agency." path="/visa" />
      <AuthNavbar />
      <main className="public-page">
        <header className="public-page-hero"><h1>Visa & Recruitment Support Center</h1><p>Work permit, visa and labour rules by country, verified visa consultants and an AI assistant that gives information only.</p></header>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px 48px' }}><VisaCenter /></div>
      </main>
      <SiteFooter />
    </>
  );
}
