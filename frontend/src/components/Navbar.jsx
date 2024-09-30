import logo from "/logo.svg";

import { Link } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";
import { FaCartShopping, FaLock } from "react-icons/fa6";
import { LuLogIn, LuLogOut } from "react-icons/lu";
import { GoHomeFill } from "react-icons/go";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";

const Navbar = () => {
  const { user, logout } = useUserStore();
  const isAdmin = user?.role === "admin";
  const { cart } = useCartStore();

  return (
    <header className="fixed top-0 left-0 w-full bg-[#003632] bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-emerald-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex felx-wrap justify-between items-center">
          <Link to="/" className="items-center space-x-2 flex">
            <img src={logo} width={100} height={40} />
          </Link>

          <nav className="flex flex-wrap items-center gap-4">
            <Link
              to={"/"}
              className="hover:text-emerald-400 transition duration-300
					 ease-in-out"
            >
              <GoHomeFill size={20} />
            </Link>
            {user && (
              <Link
                to={"/cart"}
                className="relative group transition duration-300 ease-in-out"
              >
                <FaCartShopping
                  className="inline-block mr-1 group-hover:text-emerald-400 transition duration-300 ease-in-out"
                  size={20}
                />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full px-2 py-0.5 text-xs group-hover:bg-emerald-400 transition duration-300 ease-in-out">
                    {cart.length}
                  </span>
                )}
              </Link>
            )}
            {isAdmin && (
              <Link
                className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-md font-medium transition duration-300
					 ease-in-out flex items-center"
                to={"/secret-dashboard"}
              >
                <FaLock className="inline-block mr-1" size={18} />
                <span className="hudden sm:inline">Dashboard</span>
              </Link>
            )}

            {user ? (
              <button
                className="bg-emerald-500 hover:bg-emerald-400 text-white py-2 px-4 rounded-md flex items-center transition duration-300
            ease-in-out"
                onClick={logout}
              >
                <LuLogOut size={18} />
                <span className="hidden sm:inline ml-2">Logout</span>
              </button>
            ) : (
              <>
                <Link
                  to={"/signup"}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md flex items-center transition duration-300
            ease-in-out"
                >
                  <FaUserPlus className="mr-2" size={18} />
                  Sign Up
                </Link>

                <Link
                  to={"/login"}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md flex items-center transition duration-300
            ease-in-out"
                >
                  <LuLogIn size={18} />
                  <span className="hidden sm:inline ml-2">Login</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
