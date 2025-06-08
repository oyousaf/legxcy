import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCartShopping, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

const FeaturedProducts = ({ featuredProducts = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [dragStart, setDragStart] = useState(null);

  const { addToCart } = useCartStore();
  const { user } = useUserStore();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else if (window.innerWidth < 1280) setItemsPerPage(3);
      else setItemsPerPage(4);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextSlide = () =>
    setCurrentIndex((i) =>
      Math.min(i + itemsPerPage, featuredProducts.length - itemsPerPage)
    );
  const prevSlide = () => setCurrentIndex((i) => Math.max(i - itemsPerPage, 0));
  const isStart = currentIndex === 0;
  const isEnd = currentIndex >= featuredProducts.length - itemsPerPage;

  const handleAddToCart = (product) => {
    if (!user)
      return toast.error("Please log in to add products to your cart", {
        id: "login",
      });
    addToCart(product);
  };

  const onTouchStart = (e) => setDragStart(e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (dragStart === null) return;
    const dragEnd = e.changedTouches[0].clientX;
    if (dragEnd - dragStart > 60 && !isStart) prevSlide();
    else if (dragStart - dragEnd > 60 && !isEnd) nextSlide();
    setDragStart(null);
  };

  return (
    <motion.section
      className="py-12 select-none"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
    >
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-center text-5xl sm:text-6xl font-extrabold text-emerald-400 mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          Featured
        </motion.h2>
        <div className="relative">
          <div
            className="overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <motion.div
              className="flex"
              initial={false}
              animate={{ x: `-${(currentIndex * 100) / itemsPerPage}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
            >
              {featuredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 flex-shrink-0 px-2"
                  whileHover={{
                    y: -8,
                    boxShadow: "0 12px 32px 0 rgba(16, 185, 129, 0.15)",
                  }}
                >
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-500/30 flex flex-col h-full transition-all">
                    <div className="overflow-clip">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                        draggable={false}
                      />
                    </div>
                    <div className="p-4 flex flex-col h-full">
                      <h3 className="text-lg font-semibold mb-2 text-white">
                        {product.name}
                      </h3>
                      <p className="text-sm text-emerald-200 mb-2 line-clamp-2 min-h-[2.6em]">
                        {product.description}
                      </p>
                      <div className="flex flex-col gap-3 items-center mt-auto">
                        <span className="text-2xl font-extrabold text-emerald-300 drop-shadow-sm">
                          £{product.price.toFixed()}
                        </span>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-transform duration-200 text-white font-semibold py-2 px-6 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 text-base"
                        >
                          <FaCartShopping className="w-5 h-5" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <button
            onClick={prevSlide}
            disabled={isStart}
            className={`absolute top-1/2 -left-4 -translate-y-1/2 p-2 rounded-full z-20 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition ${
              isStart
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500"
            }`}
            aria-label="Previous"
            tabIndex={isStart ? -1 : 0}
          >
            <FaChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            disabled={isEnd}
            className={`absolute top-1/2 -right-4 -translate-y-1/2 p-2 rounded-full z-20 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition ${
              isEnd
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500"
            }`}
            aria-label="Next"
            tabIndex={isEnd ? -1 : 0}
          >
            <FaChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.section>
  );
};

export default FeaturedProducts;
