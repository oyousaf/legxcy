import { MdBarChart } from "react-icons/md";
import { FaPlusCircle } from "react-icons/fa";
import { LuShoppingBasket } from "react-icons/lu";
import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

import AnalyticsTab from "../components/AnalyticsTab";
import AddProductForm from "../components/AddProductForm";
import ProductsList from "../components/ProductsList";
import { useProductStore } from "../stores/useProductStore";
import { useUserStore } from "../stores/useUserStore";

const tabs = [
  { id: "add", label: "Add Product", icon: FaPlusCircle },
  { id: "products", label: "Products", icon: LuShoppingBasket },
  { id: "analytics", label: "Analytics", icon: MdBarChart },
];

const skeletonClass = "animate-pulse bg-gray-700 rounded-lg h-20 mb-4 w-full";

function TabErrorBoundary({ children }) {
  const [error, setError] = useState(null);
  try {
    if (error) throw error;
    return children;
  } catch (err) {
    return (
      <div className="p-6 bg-red-800 text-white rounded-lg text-center">
        <p className="font-bold">Something went wrong!</p>
        <p className="text-sm">{err.message}</p>
        <button
          className="mt-4 px-4 py-2 bg-emerald-600 rounded"
          onClick={() => setError(null)}
        >
          Try again
        </button>
      </div>
    );
  }
}

const AdminPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    return tabs.some(t => t.id === tab) ? tab : "add";
  }, [location.search]);

  const [activeTab, setActiveTab] = useState(getTabFromURL);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set("tab", activeTab);
    navigate({ search: params.toString() }, { replace: true });
    // eslint-disable-next-line
  }, [activeTab]);

  const { fetchAllProducts } = useProductStore();
  const { user, profile, checkingAuth } = useUserStore();

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  useEffect(() => {
    if (!checkingAuth && (!user || profile?.role !== "admin")) {
      navigate("/", { replace: true });
    }
  }, [checkingAuth, user, profile, navigate]);

  const handleTabKeyDown = (e, tabId) => {
    if (e.key === "Enter" || e.key === " ") {
      setActiveTab(tabId);
    }
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const idx = tabs.findIndex(t => t.id === activeTab);
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const nextIdx = (idx + dir + tabs.length) % tabs.length;
      setActiveTab(tabs[nextIdx].id);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-16">
        <motion.h1
          className="text-4xl font-bold mb-8 text-emerald-400 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Admin Dashboard
        </motion.h1>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-selected={activeTab === tab.id}
              tabIndex={0}
              className={`flex items-center px-4 py-2 mx-2 rounded-md transition-colors duration-200 outline-none focus:ring-2 focus:ring-emerald-400 ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-700 text-gray-300 hover:bg-emerald-600"
              }`}
              disabled={checkingAuth || !user || !profile}
              onKeyDown={e => handleTabKeyDown(e, tab.id)}
              aria-label={tab.label}
              role="tab"
            >
              <tab.icon className="mr-2 h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {checkingAuth || !user || !profile ? (
          <div>
            <div className={skeletonClass} />
            <div className={skeletonClass} />
            <div className={skeletonClass} />
          </div>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabErrorBoundary>
                {activeTab === "add" && <AddProductForm />}
                {activeTab === "products" && <ProductsList />}
                {activeTab === "analytics" && <AnalyticsTab />}
              </TabErrorBoundary>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
