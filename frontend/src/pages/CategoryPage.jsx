import { useEffect, useState, useRef } from "react";
import { useProductStore } from "../stores/useProductStore";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import ProductCard from "../components/ProductCard";
import Seo from "../components/Seo";
import { LuMoveRight } from "react-icons/lu";
import { FaChevronDown } from "react-icons/fa";
import { useUIStore } from "../stores/useUIStore";

const skeletons = Array(8).fill(0);

const categoryHeadings = {
  hub: "Hub-Drive Motor",
  mid: "Mid-Drive Motor",
};

const categoryDescriptions = {
  hub: "Hub-drive motors are celebrated for their simplicity, quiet performance, and low maintenance. Positioned in the wheel, these motors provide a smooth, natural boost to your ride, making them perfect for city commutes and leisurely journeys. Hub-drive e-bikes are often lighter, more affordable, and offer a reliable, hassle-free cycling experience for both new and seasoned riders.",
  mid: "Mid-drive motors excel at delivering optimal power and efficiency, especially when tackling steep hills and long distances. Located at the bike’s crank, these motors work harmoniously with your gears, providing enhanced torque and a natural, balanced ride feel. Mid-drive e-bikes are perfect for demanding routes and adventurous cyclists who value performance, control, and the ability to conquer challenging terrain.",
};

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "A–Z", value: "az" },
  { label: "Z–A", value: "za" },
  { label: "Price: Low–High", value: "price-asc" },
  { label: "Price: High–Low", value: "price-desc" },
];

const getSortedProducts = (products, sort) => {
  const arr = [...products];

  switch (sort) {
    case "az":
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    case "za":
      return arr.sort((a, b) => b.name.localeCompare(a.name));
    case "price-asc":
      return arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    case "price-desc":
      return arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    case "oldest":
      return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case "newest":
    default:
      return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

const CategoryPage = () => {
  const { fetchProductsByCategory, products, loading } = useProductStore();
  const { category } = useParams();
  const navigate = useNavigate();

  // GLOBAL SORT STATE
  const { sort, setSort } = useUIStore();

  const [sortOpen, setSortOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!sortOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < sortOptions.length - 1 ? prev + 1 : 0
        );
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : sortOptions.length - 1
        );
      }

      if (e.key === "Enter") {
        e.preventDefault();
        setSort(sortOptions[highlightedIndex].value);
        setSortOpen(false);
      }

      if (e.key === "Escape") {
        setSortOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sortOpen, highlightedIndex, setSort]);

  // Reset + fetch products when category changes
  useEffect(() => {
    useProductStore.setState({ products: [] });
    fetchProductsByCategory(category);
  }, [category, fetchProductsByCategory]);

  const heading =
    categoryHeadings[category] ||
    (category ? category.charAt(0).toUpperCase() + category.slice(1) : "Category");

  const otherCategory =
    category === "hub" ? "mid" : category === "mid" ? "hub" : null;

  const otherLabel =
    otherCategory === "hub"
      ? "Hub-Drive"
      : otherCategory === "mid"
      ? "Mid-Drive"
      : null;

  const sortedProducts = getSortedProducts(products, sort);

  return (
    <div className="min-h-screen bg-linear-to-b from-emerald-900/60 to-gray-900/95">
      <Seo
        title={heading}
        description={
          categoryDescriptions[category] ||
          `Browse Legxcy's ${heading} electric bikes — high-performance e-bikes for every ride.`
        }
        path={`/category/${category}`}
      />

      <div className="relative max-w-(--breakpoint-xl) mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

        {/* Heading */}
        <AnimatePresence mode="wait">
          <motion.div
            key={category}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <h1 className="text-center text-4xl sm:text-5xl font-bold text-white mb-1 font-display">
              {heading}
            </h1>
            <p className="text-center text-emerald-300 mb-10 text-lg max-w-2xl mx-auto">
              {categoryDescriptions[category] ||
                "Explore our latest models in this category."}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <AnimatePresence mode="wait">
          <motion.div
            key={category + '-controls'}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 w-full relative z-10"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.38, ease: "easeInOut" }}
          >

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-emerald-300 font-medium">Sort by</label>
              <div ref={dropdownRef} className="relative inline-block w-44">
                <button
                  type="button"
                  onClick={() => {
                    setSortOpen((prev) => !prev);
                    setHighlightedIndex(
                      sortOptions.findIndex((o) => o.value === sort) || 0
                    );
                  }}
                  className="flex items-center justify-between w-full rounded-lg bg-emerald-950 text-emerald-100 border border-emerald-600 px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                >
                  {sortOptions.find((o) => o.value === sort)?.label}
                  <motion.span
                    animate={{ rotate: sortOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="ml-2 text-emerald-400"
                  >
                    <FaChevronDown className="w-4 h-4" />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {sortOpen && (
                    <motion.ul
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="absolute mt-1 z-20 w-full rounded-lg bg-emerald-900 border border-emerald-600 shadow-lg"
                    >
                      {sortOptions.map((opt, idx) => (
                        <li
                          key={opt.value}
                          onClick={() => {
                            setSort(opt.value);
                            setSortOpen(false);
                          }}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                          className={`px-3 py-2 cursor-pointer hover:bg-emerald-800 ${
                            sort === opt.value ? "bg-emerald-700" : ""
                          } ${
                            highlightedIndex === idx ? "bg-emerald-800" : ""
                          }`}
                        >
                          {opt.label}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Switch category */}
            {otherCategory && (
              <motion.button
                key={otherCategory}
                onClick={() => navigate(`/category/${otherCategory}`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 text-emerald-100 hover:bg-emerald-600 font-semibold shadow-sm transition-all"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.32, ease: "easeInOut" }}
              >
                <LuMoveRight className="w-5 h-5" />
                {otherLabel}
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Product Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={sort}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: "easeInOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 justify-items-center"
          >
            {loading ? (
              skeletons.map((_, idx) => (
                <motion.div
                  key={idx}
                  className="rounded-xl h-72 w-full max-w-xs bg-gray-800 border border-gray-700"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 0.6, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                />
              ))
            ) : sortedProducts.length === 0 ? (
              <motion.h2
                className="text-3xl font-semibold text-gray-300 text-center col-span-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                No products found
              </motion.h2>
            ) : (
              sortedProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.35,
                    delay: idx * 0.04,
                    ease: [0.4, 0.12, 0.3, 1],
                  }}
                  className="w-full max-w-xs"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
};

export default CategoryPage;
