
import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import Banner from "../components/Banner";
import ProductCategories from "../components/Categori";
import TakimexWebsite from "../components/Section";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      <Banner />
      <ProductCategories />
      <TakimexWebsite />
      <Footer />
    </div>
  );
}
