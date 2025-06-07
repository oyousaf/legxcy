import { useEffect } from "react";
import { useProductStore } from "../stores/useProductStore";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../components/ProductCard";

const skeletons = Array(8).fill(0);

const categoryHeadings = {
  hub: "Hub-Drive Motor",
  mid: "Mid-Drive Motor",
};

const categoryDescriptions = {
  hub: "Hub-drive motors are celebrated for their simplicity, quiet performance, and low maintenance. Positioned in the wheel, these motors provide a smooth, natural boost to your ride, making them perfect for city commutes and leisurely journeys. Hub-drive e-bikes are often lighter, more affordable, and offer a reliable, hassle-free cycling experience for both new and seasoned riders.",
  mid: "Mid-drive motors excel at delivering optimal power and efficiency, especially when tackling steep hills and long distances. Located at the bike’s crank, these motors work harmoniously with your gears, providing enhanced torque and a natural, balanced ride feel. Mid-drive e-bikes are perfect for demanding routes and adventurous cyclists who value performance, control, and the ability to conquer challenging terrain."
};

const CategoryPage = () => {
  const { fetchProductsByCategory, products, loading } = useProductStore();
  const { category } = useParams();

  // Clear products immediately on category change for instant skeletons
  useEffect(() => {
    useProductStore.setState({ products: [] });
    // eslint-disable-next-line
  }, [category]);

  // Fetch products after clearing them
  useEffect(() => {
    fetchProductsByCategory(category);
  }, [fetchProductsByCategory, category]);

  const heading =
    categoryHeadings[category] ||
    (category
      ? category.charAt(0).toUpperCase() + category.slice(1)
      : "Category");

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900/60 to-gray-900/95">
      <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.h1
          className="text-center text-4xl sm:text-5xl font-bold text-emerald-400 mb-1"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {heading}
        </motion.h1>
        <motion.p
          className="text-center text-emerald-300 mb-10 text-lg max-w-2xl mx-auto"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {categoryDescriptions[category] ||
            "Explore our latest models in this category."}
        </motion.p>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 justify-items-center"
          initial={false}
          animate={{ opacity: loading ? 0.5 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <AnimatePresence mode="wait">
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
            ) : products?.length === 0 ? (
              <motion.h2
                className="text-3xl font-semibold text-gray-300 text-center col-span-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                No products found
              </motion.h2>
            ) : (
              products?.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.45,
                    delay: idx * 0.04,
                    ease: [0.4, 0.12, 0.3, 1],
                  }}
                  className="w-full max-w-xs"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default CategoryPage;
