import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ProductListing from "../components/products/ProductListing";

function Switches() {
  return (
    <>
      <Navbar />
      <ProductListing title="สินค้าทั้งหมด" categoryName="Switches" />
      <Footer />
    </>
  );
}

export default Switches;
