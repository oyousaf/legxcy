import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoTrash } from "react-icons/go";
import { FaStar } from "react-icons/fa6";
import { useProductStore } from "../stores/useProductStore";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";

const FILTERS = [
  { label: "All", value: "" },
  { label: "Hub-Drive Motor", value: "hub" },
  { label: "Mid-Drive Motor", value: "mid" },
];

const ProductsList = () => {
  const { deleteProduct, toggleFeaturedProduct, products } = useProductStore();
  const { profile } = useUserStore();
  const [filter, setFilter] = useState("");

  const isAdmin = profile?.role === "admin";
  const getId = (product) => product.id ?? product._id;

  const filteredProducts = filter
    ? products.filter((p) => p.category === filter)
    : products;

  return (
    <motion.div
      className="bg-emerald-800 shadow-lg rounded-lg p-4 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      tabIndex={0}
    >
      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition ${
              filter === value
                ? "bg-emerald-600 border-emerald-400 text-white"
                : "bg-emerald-900 border-emerald-700 text-emerald-300 hover:bg-emerald-700"
            }`}
            aria-pressed={filter === value}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Product Cards */}
      <div className="grid gap-6 grid-cols-1">
        <AnimatePresence>
          {filteredProducts.length === 0 ? (
            <motion.div
              className="col-span-full text-center py-8 text-gray-300 text-lg"
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              No products found.
            </motion.div>
          ) : (
            filteredProducts.map((product, i) => (
              <motion.div
                key={getId(product)}
                className="relative bg-emerald-900 rounded-xl shadow p-0 overflow-hidden"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                layout
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 8px 32px 0 rgba(16,185,129,0.25)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Invisible Action Bar (just floating icons) */}
                <div
                  className="absolute flex justify-between items-center left-0 right-0 top-0 px-3 pt-3 z-10 pointer-events-none"
                  style={{ minHeight: "48px" }}
                >
                  <div className="pointer-events-auto">
                    <button
                      onClick={() => {
                        if (!isAdmin) {
                          toast.error("Admin access required.");
                          return;
                        }
                        toggleFeaturedProduct(getId(product));
                      }}
                      className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors duration-200
                        ${
                          product.isFeatured
                            ? "bg-yellow-400 text-emerald-900"
                            : "bg-emerald-700 text-emerald-300"
                        } hover:bg-yellow-500`}
                      disabled={!isAdmin}
                      title={
                        isAdmin
                          ? "Toggle featured"
                          : "Only admins can change featured status"
                      }
                      aria-label="Toggle featured"
                    >
                      <FaStar className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="pointer-events-auto">
                    <button
                      onClick={() => {
                        if (!isAdmin) {
                          toast.error("Admin access required.");
                          return;
                        }
                        deleteProduct(getId(product));
                      }}
                      className="p-2 text-red-400 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 rounded-full transition"
                      disabled={!isAdmin}
                      title={
                        isAdmin ? "Delete product" : "Only admins can delete"
                      }
                      aria-label="Delete product"
                    >
                      <GoTrash className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {/* Add top padding so content never overlaps icons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-14 px-4 pb-6">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-24 rounded-xl object-cover border-2 border-emerald-800 shadow-md bg-gray-900"
                    loading="lazy"
                  />
                  <div className="flex-1 w-full mt-2 sm:mt-0">
                    <div className="text-xl font-semibold text-white mb-1">
                      {product.name}
                    </div>
                    <div className="text-emerald-300 text-base mb-2 capitalize">
                      {product.category}
                    </div>
                    <div className="text-emerald-200 font-bold text-lg mb-1">
                      £{Number(product.price).toFixed(2)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProductsList;
