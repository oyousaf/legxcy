import { useEffect, useState, useRef } from "react";
import { useProductStore } from "../stores/useProductStore";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../components/ProductCard";
import { LuMoveRight } from "react-icons/lu";
import { FaChevronDown } from "react-icons/fa";

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
  let arr = [...products];
  switch (sort) {
    case "az":
      arr.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "za":
      arr.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "price-asc":
      arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      break;
    case "price-desc":
      arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      break;
    case "oldest":
      arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case "newest":
    default:
      arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
  }
  return arr;
};

const CategoryPage = () => {
  const { fetchProductsByCategory, products, loading } = useProductStore();
  const { category } = useParams();
  const navigate = useNavigate();

  const [sort, setSort] = useState("newest");
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

  // Keyboard support for dropdown
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
  }, [sortOpen, highlightedIndex]);

  // Reset and fetch products on category change
  useEffect(() => {
    useProductStore.setState({ products: [] });
  }, [category]);

  useEffect(() => {
    fetchProductsByCategory(category);
  }, [fetchProductsByCategory, category]);

  const heading =
    categoryHeadings[category] ||
    (category
      ? category.charAt(0).toUpperCase() + category.slice(1)
      : "Category");

  const otherCategory =
    category === "hub" ? "mid" : category === "mid" ? "hub" : null;
  const otherLabel =
    otherCategory === "mid"
      ? "Mid-Drive"
      : otherCategory === "hub"
      ? "Hub-Drive"
      : null;

  const sortedProducts = getSortedProducts(products, sort);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900/60 to-gray-900/95">
      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Heading */}
        <AnimatePresence mode="wait">
          <motion.div
            key={category}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <h1 className="text-center text-4xl sm:text-5xl font-bold text-white mb-1">
              {heading}
            </h1>
            <p className="text-center text-emerald-300 mb-10 text-lg max-w-2xl mx-auto">
              {categoryDescriptions[category] ||
                "Explore our latest models in this category."}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Animated controls */}
        <AnimatePresence mode="wait">
          <motion.div
            key={category}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 w-full relative z-50"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.38, ease: "easeInOut" }}
          >
            {/* Sort dropdown */}
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
                  className="flex items-center justify-between w-full rounded-lg bg-emerald-950 text-emerald-100 border border-emerald-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
                      className="absolute mt-1 z-10 w-full rounded-lg bg-emerald-900 border border-emerald-600 shadow-lg"
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 text-emerald-100 hover:bg-emerald-600 font-semibold shadow transition-all"
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

        {/* Products grid */}
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
            ) : sortedProducts?.length === 0 ? (
              <motion.h2
                className="text-3xl font-semibold text-gray-300 text-center col-span-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                No products found
              </motion.h2>
            ) : (
              sortedProducts?.map((product, idx) => (
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
