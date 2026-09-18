import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import AdminRoute from "./components/routing/AdminRoute";
import ScrollToHash from "./components/routing/ScrollToHash";
import SessionSync from "./components/routing/SessionSync";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Keyboard = lazy(() => import("./pages/Keyboard"));
const Accessories = lazy(() => import("./pages/Accessories"));
const Switches = lazy(() => import("./pages/Switches"));
const Keycaps = lazy(() => import("./pages/Keycaps"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const Cart = lazy(() => import("./pages/Cart"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Addresses = lazy(() => import("./pages/Addresses"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const NotAuthorized = lazy(() => import("./pages/NotAuthorized"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductVariants = lazy(() => import("./pages/admin/AdminProductVariants"));
const AdminBrands = lazy(() => import("./pages/admin/AdminBrands"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));

function LoadingFallback() {
  return (
    <div
      style={{
        background: "var(--bg)",
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p style={{ fontFamily: "var(--font-sans)", color: "var(--text-dim)" }}>
        กำลังโหลด...
      </p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      <SessionSync />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/keyboard" element={<Keyboard />} />
          <Route path="/accessories" element={<Accessories />} />
          <Route path="/switches" element={<Switches />} />
          <Route path="/keycaps" element={<Keycaps />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/payments/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/not-authorized" element={<NotAuthorized />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="product-variants" element={<AdminProductVariants />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="payments" element={<AdminPayments />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
