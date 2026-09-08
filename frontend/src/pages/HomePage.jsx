import { useCallback, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { LuArrowRight, LuZap } from "react-icons/lu";
import { Link } from "react-router-dom";
import CategoryItem from "../components/CategoryItem";
import FeaturedProducts from "../components/FeaturedProducts";
import Seo from "../components/Seo";
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

  const heroProduct = products
    .filter((p) => p.isFeatured)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  const prefersReducedMotion = useReducedMotion();

  const scrollToFeatured = useCallback(
    (e) => {
      e.preventDefault();
      document.getElementById("featured")?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    },
    [prefersReducedMotion],
  );

  return (
    <section className="relative min-h-screen overflow-x-hidden bg-linear-to-b from-[#003632] via-emerald-900 to-emerald-800">
      <Seo
        description="Shop Legxcy high-performance electric bikes — hub-drive and mid-drive e-bikes engineered for adventure trails and everyday urban commuting. Eco-friendly, powerful, built to last."
        path="/"
      />

      {/* HERO */}
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
        {/* Copy */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="text-center lg:text-left"
        >
          <img
            src="/logo.png"
            alt="Legxcy Logo"
            width={160}
            height={64}
            className="mx-auto mb-6 select-none lg:mx-0"
            draggable={false}
          />

          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-emerald-300 uppercase">
            <LuZap className="h-3.5 w-3.5" />
            Built for the ride ahead
          </p>

          <h1 className="font-display mb-4 text-5xl font-bold text-white sm:text-6xl lg:text-7xl">
            Ride smarter
            <br />
            <span className="text-emerald-400">with Legxcy</span>
          </h1>

          <p className="mx-auto mb-8 max-w-md text-lg text-gray-300 lg:mx-0">
            High-performance, eco-friendly e-bikes engineered for adventure
            trails and everyday journeys.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              to="/category/hub"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-7 py-3.5 font-semibold text-white transition hover:bg-emerald-400"
            >
              Shop Bikes
              <LuArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#featured"
              onClick={scrollToFeatured}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 font-semibold text-white transition hover:border-emerald-400 hover:text-emerald-400"
            >
              See what&rsquo;s featured
            </a>
          </div>
        </motion.div>

        {/* Visual */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15 }}
          className="relative mx-auto aspect-square w-full max-w-md lg:max-w-none"
        >
          <div
            aria-hidden
            className="absolute inset-0 rounded-full bg-emerald-400/20 blur-3xl"
          />

          {!loading && heroProduct ? (
            <div className="relative flex h-full items-center justify-center">
              <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-linear-to-br from-white to-neutral-200 p-8 shadow-2xl shadow-emerald-950/40 sm:p-10">
                <img
                  src={heroProduct.image}
                  alt={heroProduct.name}
                  width={480}
                  height={480}
                  fetchPriority="high"
                  className="relative z-10 h-full w-full object-contain drop-shadow-xl"
                />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute right-2 bottom-4 z-20 rounded-2xl border border-white/10 bg-emerald-950/90 px-4 py-3 backdrop-blur-md sm:right-6"
              >
                <p className="text-xs text-emerald-300">Featured now</p>
                <p className="font-display text-sm font-semibold text-white">
                  {heroProduct.name}
                </p>
              </motion.div>
            </div>
          ) : (
            <div
              aria-hidden
              className="h-full w-full animate-pulse rounded-3xl bg-emerald-800/40"
            />
          )}
        </motion.div>
      </div>

      {/* CATEGORIES */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {categories.map((category) => (
            <CategoryItem key={category.name} category={category} />
          ))}
        </motion.div>
      </div>

      {/* FEATURED SECTION (ISOLATED FROM PAGE WIDTH) */}
      <div id="featured" className="relative scroll-mt-24 overflow-x-hidden">
        {loading && (
          <div className="flex h-96 items-center justify-center">
            <div className="mx-auto h-64 w-full max-w-7xl animate-pulse rounded-lg bg-emerald-800" />
          </div>
        )}

        {!loading && products.length > 0 && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <FeaturedProducts featuredProducts={products} />
          </motion.div>
        )}
      </div>
    </section>
  );
}
