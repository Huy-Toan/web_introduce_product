
import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import Banner from "../components/Banner";
import ProductCategories from "../components/Categori";
import TakimexWebsite from "../components/Section";
import UserChatBox from "../components/UserChatBox";
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      <Banner />
      <ProductCategories />
      <TakimexWebsite />
        <UserChatBox />
      <Footer />
    </div>
  );
}
