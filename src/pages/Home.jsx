
import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import Banner from "../components/Banner";
import ProductCategories from "../components/Categori";
// import TakimexWebsite from "../components/Section";
import  AboutSection  from "../components/AboutSection";
import  NewsSection  from "../components/NewsSection";
import FieldHighlightsSection from "../components/FieldSection";
import CerPartnersSection from "../components/Cer_PartnerSection";


export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      <Banner />
      <ProductCategories />
      <AboutSection />
      <FieldHighlightsSection />
      <CerPartnersSection />
      <NewsSection />
      <Footer />
    </div>
  );
}
