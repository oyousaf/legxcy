import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCartShopping, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";

const FeaturedProducts = ({ featuredProducts = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const containerRef = useRef(null);
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

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      Math.min(prev + itemsPerPage, featuredProducts.length - itemsPerPage)
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - itemsPerPage, 0));
  };

  const isStartDisabled = currentIndex === 0;
  const isEndDisabled = currentIndex >= featuredProducts.length - itemsPerPage;

  const handleAddToCart = (product) => {
    if (!user) {
      toast.error("Please log in to add products to your cart", {
        id: "login",
      });
      return;
    }
    addToCart(product);
  };

  // Mobile swipe
  const onTouchStart = (e) => setDragStart(e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (dragStart === null) return;
    const dragEnd = e.changedTouches[0].clientX;
    if (dragEnd - dragStart > 60 && !isStartDisabled) prevSlide();
    else if (dragStart - dragEnd > 60 && !isEndDisabled) nextSlide();
    setDragStart(null);
  };

  return (
    <div className="py-12 select-none">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4">
          Featured
        </h2>
        <div className="relative">
          <div
            ref={containerRef}
            className="overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <motion.div
              className="flex"
              initial={false}
              animate={{
                x: `-${(currentIndex * 100) / itemsPerPage}%`,
              }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
            >
              {featuredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 flex-shrink-0 px-2"
                  layout
                >
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden h-full transition-all duration-300 hover:shadow-xl border border-emerald-500/30 flex flex-col">
                    <div className="overflow-clip">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover transition-transform duration-300 ease-in-out hover:scale-110"
                      />
                    </div>
                    <div className="p-4 flex flex-col h-full">
                      <h3 className="text-lg font-semibold mb-2 text-white">
                        {product.name}
                      </h3>
                      <p className="text-sm text-emerald-200 mb-2 line-clamp-2 min-h-[2.6em]">
                        {product.description}
                      </p>
                      <div className="flex items-center mt-auto">
                        <span className="text-emerald-300 font-medium mr-2">
                          £{product.price.toFixed()}
                        </span>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="ml-2 flex items-center bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded transition-colors duration-300 shadow"
                        >
                          <FaCartShopping className="w-5 h-5 mr-2" />
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
            disabled={isStartDisabled}
            className={`absolute top-1/2 -left-4 transform -translate-y-1/2 p-2 rounded-full transition-colors duration-300 ${
              isStartDisabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500"
            } z-20`}
            aria-label="Previous"
          >
            <FaChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            disabled={isEndDisabled}
            className={`absolute top-1/2 -right-4 transform -translate-y-1/2 p-2 rounded-full transition-colors duration-300 ${
              isEndDisabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500"
            } z-20`}
            aria-label="Next"
          >
            <FaChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;
