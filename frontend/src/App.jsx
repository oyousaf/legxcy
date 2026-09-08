import { Navigate, Route, Routes } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/LoadingSpinner";

import HomePage from "./pages/HomePage";

import { useUserStore } from "./stores/useUserStore";
import { useCartStore } from "./stores/useCartStore";

// Route-level code splitting: keep the landing page eager, defer the rest
const SignupPage = lazy(() => import("./pages/SignupPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const PurchaseSuccessPage = lazy(() => import("./pages/PurchaseSuccessPage"));
const PurchaseCancelPage = lazy(() => import("./pages/PurchaseCancelPage"));

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
      <div className="relative z-10 flex min-h-screen flex-col pt-20">
        <Navbar />

        <main className="flex-1">
          <Suspense fallback={<LoadingSpinner />}>
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
          </Suspense>
        </main>

        <Footer />
      </div>

      <Toaster />
      <Analytics />
    </div>
  );
}

export default App;
