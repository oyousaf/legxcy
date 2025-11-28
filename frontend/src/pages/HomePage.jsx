import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";

const categories = [
  { href: "/hub", name: "Hub-Drive Motor", imageUrl: "/hub.webp" },
  { href: "/mid", name: "Mid-Drive Motor", imageUrl: "/mid.webp" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

const HomePage = () => {
  const { fetchFeaturedProducts, products, loading } = useProductStore();
  const sortedFeatured = [...products].sort(
    (a, b) => (b.featuredAt ?? 0) - (a.featuredAt ?? 0)
  );

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#003632] via-emerald-900 to-emerald-800 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <img
            src="/logo.png"
            alt="Legxcy Logo"
            width={180}
            height={72}
            className="mx-auto mb-6"
          />
          <h1 className="text-center text-5xl sm:text-6xl font-extrabold text-emerald-400 mb-2">
            Ride smarter with Legxcy
          </h1>
        </motion.div>

        <motion.p
          className="text-center text-lg md:text-xl text-gray-200 mb-7"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
        >
          Discover high-performance, eco-friendly e-bikes built for adventure
          and everyday journeys
        </motion.p>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.3 }}
        >
          {categories.map((category) => (
            <CategoryItem category={category} key={category.name} />
          ))}
        </motion.div>

        <div className="mt-14">
          <AnimatePresence>
            {loading ? (
              <motion.div
                className="h-96 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="animate-pulse w-full h-64 bg-emerald-800 rounded-lg" />
              </motion.div>
            ) : products.length > 0 ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <FeaturedProducts featuredProducts={sortedFeatured} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
