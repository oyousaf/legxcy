import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaLock, FaArrowRight } from "react-icons/fa6";
import { LuLogIn, LuMail, LuLoader } from "react-icons/lu";
import Seo from "../components/Seo";
import { useUserStore } from "../stores/useUserStore";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading } = useUserStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <motion.div
      className="flex flex-col min-h-screen justify-center items-center bg-gradient-to-br from-emerald-900 via-gray-900 to-emerald-950"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Seo
        title="Login"
        description="Log in to your Legxcy account to track orders and manage your profile."
        path="/login"
        noindex
      />

      <motion.div
        className="w-full max-w-md p-8 bg-emerald-950/80 rounded-2xl shadow-2xl border border-emerald-700"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-3xl font-bold text-center text-emerald-400 mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-emerald-200 mb-8 text-base">
          Login to your account to continue
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="relative">
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <LuMail className="h-5 w-5 text-emerald-300" />
            </span>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-emerald-900 border border-emerald-800 text-white placeholder-emerald-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 outline-none transition"
              placeholder="Email"
            />
          </div>
          {/* Password */}
          <div className="relative">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <FaLock className="h-5 w-5 text-emerald-300" />
            </span>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-emerald-900 border border-emerald-800 text-white placeholder-emerald-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 outline-none transition"
              placeholder="Password"
            />
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow text-white font-semibold text-lg transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? (
              <>
                <LuLoader className="h-5 w-5 animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <LuLogIn className="h-5 w-5" />
                Login
              </>
            )}
          </button>
        </form>
        <div className="mt-6 text-center text-emerald-200 text-sm">
          No account?{" "}
          <Link
            to="/signup"
            className="text-emerald-400 hover:text-emerald-300 font-medium transition"
          >
            Sign up now <FaArrowRight className="inline h-4 w-4 align-middle" />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoginPage;
