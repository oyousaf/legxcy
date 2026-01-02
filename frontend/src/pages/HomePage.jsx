import { useEffect } from "react";
import { motion } from "framer-motion";
import CategoryItem from "../components/CategoryItem";
import FeaturedProducts from "../components/FeaturedProducts";
import { useProductStore } from "../stores/useProductStore";

const categories = [
  { href: "/hub", name: "Hub-Drive Motor", imageUrl: "/hub.webp" },
  { href: "/mid", name: "Mid-Drive Motor", imageUrl: "/mid.webp" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function HomePage() {
  const { fetchFeaturedProducts, products, loading } = useProductStore();

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  return (
    <section className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-[#003632] via-emerald-900 to-emerald-800">
      {/* HERO + CATEGORIES */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <img
            src="/logo.png"
            alt="Legxcy Logo"
            width={180}
            height={72}
            className="mx-auto mb-6 select-none"
            draggable={false}
          />

          <h1 className="mb-2 text-center text-5xl sm:text-6xl font-extrabold text-emerald-400">
            Ride smarter with Legxcy
          </h1>
        </motion.div>

        <motion.p
          className="mb-7 text-center text-lg md:text-xl text-gray-200"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15 }}
        >
          Discover high-performance, eco-friendly e-bikes built for adventure
          and everyday journeys
        </motion.p>

        {/* Categories */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.25 }}
        >
          {categories.map((category) => (
            <CategoryItem key={category.name} category={category} />
          ))}
        </motion.div>
      </div>

      {/* FEATURED SECTION (ISOLATED FROM PAGE WIDTH) */}
      <div className="relative mt-20 overflow-x-hidden">
        {loading && (
          <div className="flex h-96 items-center justify-center">
            <div className="mx-auto h-64 w-full max-w-7xl animate-pulse rounded-lg bg-emerald-800" />
          </div>
        )}

        {!loading && products.length > 0 && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.35 }}
          >
            <FeaturedProducts featuredProducts={products} />
          </motion.div>
        )}
      </div>
    </section>
  );
}
