import logo from "/logo.png";
import { Link, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { FaUserPlus, FaCartShopping, FaLock } from "react-icons/fa6";
import { LuLogIn, LuLogOut } from "react-icons/lu";
import { GoHomeFill } from "react-icons/go";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useState } from "react";
import ProfileModal from "./ProfileModal";

const MotionLink = motion.create(Link);
const MotionButton = motion.button;

const hoverTap = {
  whileHover: { scale: 1.06 },
  whileTap: { scale: 0.96 },
};

export default function Navbar() {
  const { user, profile, logout } = useUserStore();
  const isAdmin = profile?.role === "admin";
  const { cart } = useCartStore();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  // Clicking "Home" while already on "/" doesn't trigger a route change,
  // so the app-wide scroll-to-top-on-navigate effect never fires - scroll
  // up manually in that case.
  const handleHomeClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }
  };

  return (
    <header
      className="
      fixed inset-x-0 top-0 z-40
      bg-[#003632]/80 backdrop-blur-xl
      border-b border-emerald-800
      overflow-x-clip
    "
    >
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* LOGO */}
          <Link to="/" onClick={handleHomeClick} className="flex items-center">
            <img
              src={logo}
              alt="Legxcy"
              width={100}
              height={40}
              draggable={false}
              className="select-none"
            />
          </Link>

          {/* NAV ACTIONS */}
          <nav className="flex items-center gap-3">
            <MotionLink
              to="/"
              onClick={handleHomeClick}
              {...hoverTap}
              className="rounded-md p-2 text-white/80 hover:text-emerald-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label="Home"
            >
              <GoHomeFill size={20} />
            </MotionLink>

            {user && (
              <MotionLink
                to="/cart"
                {...hoverTap}
                className="relative rounded-md p-2 text-white/80 hover:text-emerald-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-label="Cart"
              >
                <FaCartShopping size={20} />
                {cart.length > 0 && (
                  <span
                    className="
                    absolute -top-1.5 -right-1.5
                    rounded-full bg-emerald-500
                    px-1.5 py-0.5 text-[10px] font-semibold text-white
                  "
                  >
                    {cart.length}
                  </span>
                )}
              </MotionLink>
            )}

            {isAdmin && (
              <MotionLink
                to="/secret-dashboard"
                {...hoverTap}
                className="
                  hidden sm:flex items-center gap-1
                  rounded-md bg-emerald-700 px-3 py-1.5
                  text-sm font-medium text-white
                  hover:bg-emerald-600
                "
              >
                <FaLock size={16} />
                Dashboard
              </MotionLink>
            )}

            {user ? (
              <>
                <MotionButton
                  {...hoverTap}
                  onClick={() => setProfileModalOpen(true)}
                  className="
                    hidden sm:block rounded-md px-3 py-1.5
                    text-sm text-white/90
                    hover:underline
                    focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-400
                  "
                >
                  {profile?.name ?? user.email}
                  {isAdmin && <b> (Admin)</b>}
                </MotionButton>

                <MotionButton
                  {...hoverTap}
                  onClick={logout}
                  className="
                    flex items-center gap-2
                    rounded-md bg-emerald-500 px-4 py-2
                    text-sm font-medium text-white
                    hover:bg-emerald-400
                  "
                >
                  <LuLogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </MotionButton>
              </>
            ) : (
              <>
                <MotionLink
                  to="/signup"
                  {...hoverTap}
                  className="
                    flex items-center gap-2
                    rounded-md bg-emerald-600 px-4 py-2
                    text-sm font-medium text-white
                    hover:bg-emerald-700
                  "
                >
                  <FaUserPlus size={16} />
                  Sign Up
                </MotionLink>

                <MotionLink
                  to="/login"
                  {...hoverTap}
                  className="
                    flex items-center gap-2
                    rounded-md bg-gray-600 px-4 py-2
                    text-sm font-medium text-white
                    hover:bg-gray-700
                  "
                >
                  <LuLogIn size={16} />
                  <span className="hidden sm:inline">Login</span>
                </MotionLink>
              </>
            )}
          </nav>
        </div>
      </div>

      {profileModalOpen && (
        <ProfileModal
          open={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
    </header>
  );
}
