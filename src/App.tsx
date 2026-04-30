import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLenis } from "lenis/react";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { LenisProvider } from "./components/LenisProvider";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Studio from "./pages/Studio";
import ProductDetail from "./pages/ProductDetail";
import CreatorKit from "./pages/CreatorKit";
import Custom from "./pages/Custom";
import Contact from "./pages/Contact";
import Merch from "./pages/Merch";
import MerchDetail from "./pages/MerchDetail";
import Silence from "./pages/Silence";
import Philosophy from "./pages/Philosophy";
import Checkout from "./pages/Checkout";
import OrderConfirmed from "./pages/OrderConfirmed";
import OrderHistory from "./pages/OrderHistory";
import OrderDetail from "./pages/OrderDetail";

function ScrollToTop() {
  const { pathname } = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
  }, [pathname, lenis]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <LenisProvider>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col bg-background text-foreground">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/merchandise" element={<Merch />} />
                  <Route path="/merchandise/:slug" element={<MerchDetail />} />
                  <Route path="/creator-kit" element={<CreatorKit />} />
                  <Route path="/studio" element={<Studio />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/custom" element={<Custom />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/silence" element={<Silence />} />
                  <Route path="/philosophy" element={<Philosophy />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders/:orderNumber/confirmed" element={<OrderConfirmed />} />
                  <Route path="/orders/:orderNumber" element={<OrderDetail />} />
                  <Route path="/account/orders" element={<OrderHistory />} />
                  {/* Fallback for other routes in this demo */}
                  <Route path="*" element={<Home />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </LenisProvider>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
