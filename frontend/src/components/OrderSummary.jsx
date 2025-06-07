import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import { Link, useNavigate } from "react-router-dom";
import { LuMoveRight } from "react-icons/lu";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";
import { useState } from "react";

const stripePromise = loadStripe(
  "pk_test_51Nlrp0A9BSuAkHfX3E7SUPOcMzmJuMkku6WWMsa9wydvFQ685G8Q4KXYtHorBXCV6geXrFKjZPuzuAeNBQVtcsOR001WipQOgF"
);

const OrderSummary = () => {
  const { total, subtotal, coupon, isCouponApplied, cart } = useCartStore();
  const { user, checkingAuth } = useUserStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const savings = subtotal - total;
  const formattedSubtotal = subtotal.toFixed(2);
  const formattedTotal = total.toFixed(2);
  const formattedSavings = savings.toFixed(2);

  const handlePayment = async () => {
    if (loading) return;
    setLoading(true);
    if (!user) {
      toast.error("Please log in to proceed to checkout.");
      navigate("/login");
      setLoading(false);
      return;
    }
    const stripe = await stripePromise;

    // Get user's Supabase access token for secure backend validation
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    try {
      const res = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({
          products: cart,
          couponCode: coupon ? coupon.code : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || "Failed to start checkout.");
        setLoading(false);
        return;
      }

      const sessionData = await res.json();

      if (sessionData.id) {
        const result = await stripe.redirectToCheckout({
          sessionId: sessionData.id,
        });

        if (result.error) {
          toast.error(result.error.message || "Stripe error");
        }
      } else {
        toast.error("Failed to start checkout.");
      }
    } catch (err) {
      toast.error("Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-xl font-semibold text-emerald-400">Order summary</p>

      <div className="space-y-4">
        <div className="space-y-2">
          <dl className="flex items-center justify-between gap-4">
            <dt className="text-base font-normal text-gray-300">
              Original price
            </dt>
            <dd className="text-base font-medium text-white">
              £{formattedSubtotal}
            </dd>
          </dl>

          {savings > 0 && (
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-300">Savings</dt>
              <dd className="text-base font-medium text-emerald-400">
                -£{formattedSavings}
              </dd>
            </dl>
          )}

          {coupon && isCouponApplied && (
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-300">
                Coupon ({coupon.code})
              </dt>
              <dd className="text-base font-medium text-emerald-400">
                -{coupon.discountPercentage}%
              </dd>
            </dl>
          )}
          <dl className="flex items-center justify-between gap-4 border-t border-gray-600 pt-2">
            <dt className="text-base font-bold text-white">Total</dt>
            <dd className="text-base font-bold text-emerald-400">
              £{formattedTotal}
            </dd>
          </dl>
        </div>

        <motion.button
          className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePayment}
          disabled={!user || checkingAuth || loading}
        >
          {checkingAuth
            ? "Checking user..."
            : loading
            ? "Processing..."
            : "Proceed to Checkout"}
        </motion.button>

        {!user && (
          <div className="flex items-center justify-center text-red-400 text-sm mt-2">
            Please{" "}
            <Link to="/login" className="underline ml-1 text-emerald-300">
              log in
            </Link>{" "}
            to place your order.
          </div>
        )}

        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-normal text-gray-400">or</span>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 underline hover:text-emerald-300 hover:no-underline"
          >
            Continue Shopping
            <LuMoveRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderSummary;
