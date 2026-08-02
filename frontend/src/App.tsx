import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import ScrollToHash from "./components/routing/ScrollToHash";
import Home from "./pages/Home";
import About from "./pages/About";
import Keyboard from "./pages/Keyboard";
import Accessories from "./pages/Accessories";
import Switches from "./pages/Switches";
import Keycaps from "./pages/Keycaps";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import SearchResults from "./pages/SearchResults";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToHash />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/keyboard" element={<Keyboard />} />
          <Route path="/accessories" element={<Accessories />} />
          <Route path="/switches" element={<Switches />} />
          <Route path="/keycaps" element={<Keycaps />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<SearchResults />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;