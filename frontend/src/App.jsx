import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";

import { useUserStore } from "./stores/useUserStore";
import { useCartStore } from "./stores/useCartStore";

function App() {
  const { user, checkAuth } = useUserStore();
  const { getCartItems } = useCartStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) getCartItems();
  }, [user, getCartItems]);

  return (
    <div className="relative min-h-screen bg-[#003632] text-white overflow-x-hidden">
      {/* BACKGROUND GRADIENT */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(0,54,50,0.2)_45%,rgba(0,0,0,0.1)_100%)]" />
      </div>

      {/* APP CONTENT */}
      <div className="relative z-10 pt-20">
        <Navbar />

        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/signup"
            element={!user ? <SignupPage /> : <Navigate to="/" />}
          />

          <Route
            path="/login"
            element={!user ? <LoginPage /> : <Navigate to="/" />}
          />

          <Route
            path="/secret-dashboard"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          <Route path="/category/:category" element={<CategoryPage />} />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/purchase-success"
            element={
              <ProtectedRoute>
                <PurchaseSuccessPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/purchase-cancel"
            element={
              <ProtectedRoute>
                <PurchaseCancelPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      <Toaster />
      <Analytics />
    </div>
  );
}

export default App;
