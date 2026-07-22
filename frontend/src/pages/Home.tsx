import Navbar from "../components/layout/Navbar";
import Hero from "../components/hero/Hero";
import CategorySection from "../components/categories/CategorySection";
import BestSellers from "../components/products/BestSellers";
import Footer from "../components/layout/Footer";

function Home() {
  return (
    <>
      <Navbar/>
      <Hero />
      <CategorySection />
      <BestSellers />
      <Footer />
    </>
  );
}

export default Home;