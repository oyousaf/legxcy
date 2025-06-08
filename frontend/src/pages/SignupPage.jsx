import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaLock, FaUser, FaArrowLeft } from "react-icons/fa6";
import { LuMail, LuLoader, LuUserPlus } from "react-icons/lu";
import { useUserStore } from "../stores/useUserStore";

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { signup, loading } = useUserStore();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(form);
  };

  return (
    <motion.div
      className="flex flex-col min-h-screen justify-center items-center bg-gradient-to-br from-emerald-900 via-gray-900 to-emerald-950"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        className="w-full max-w-md p-8 bg-emerald-950/80 rounded-2xl shadow-2xl border border-emerald-700"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-3xl font-bold text-center text-emerald-400 mb-2">
          Create Account
        </h1>
        <p className="text-center text-emerald-200 mb-8 text-base">
          Sign up to get started!
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <FaUser className="h-5 w-5 text-emerald-300" />
            </span>
            <input
              name="name"
              type="text"
              required
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-emerald-900 border border-emerald-800 text-white placeholder-emerald-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 outline-none transition"
              placeholder="Name"
            />
          </div>
          {/* Email */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <LuMail className="h-5 w-5 text-emerald-300" />
            </span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-emerald-900 border border-emerald-800 text-white placeholder-emerald-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 outline-none transition"
              placeholder="Email"
            />
          </div>
          {/* Password */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <FaLock className="h-5 w-5 text-emerald-300" />
            </span>
            <input
              name="password"
              type="password"
              required
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-emerald-900 border border-emerald-800 text-white placeholder-emerald-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 outline-none transition"
              placeholder="Password"
            />
          </div>
          {/* Confirm Password */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <FaLock className="h-5 w-5 text-emerald-300" />
            </span>
            <input
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-emerald-900 border border-emerald-800 text-white placeholder-emerald-300 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 outline-none transition"
              placeholder="Confirm Password"
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
                Signing up...
              </>
            ) : (
              <>
                <LuUserPlus className="h-5 w-5" />
                Sign Up
              </>
            )}
          </button>
        </form>
        <div className="mt-6 text-center text-emerald-200 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-emerald-400 hover:text-emerald-300 font-medium transition"
          >
            <FaArrowLeft className="inline h-4 w-4 align-middle mr-1" />
            Back to login
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RegisterPage;
