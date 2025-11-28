import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { FaCartShopping, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";

const AUTOPLAY_INTERVAL = 4500;
const SWIPE_THRESHOLD = 55;

// Shadow-glow on centre card
const centerGlow =
  "shadow-[0_0_28px_rgba(16,185,129,0.45)] border-emerald-400/50";

// Depth blur levels
const depthBlur = {
  0: "blur-0 opacity-100",
  1: "blur-[1px] opacity-90",
  2: "blur-[2px] opacity-80",
  3: "blur-[3px] opacity-70",
};

export default function FeaturedProducts({ featuredProducts = [] }) {
  // Sort newest first
  const sorted = useMemo(
    () =>
      [...featuredProducts]
        .filter((p) => p.isFeatured)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [featuredProducts]
  );

  // ----- STATE -----
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [index, setIndex] = useState(0);
  const autoplayRef = useRef(null);
  const wrapperRef = useRef(null);
  const dragStartX = useRef(null);
  const isHovering = useRef(false);

  const { addToCart } = useCartStore();
  const { user } = useUserStore();

  // ----- RESPONSIVE -----
  useEffect(() => {
    const handleR = () => {
      if (window.innerWidth < 640) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else if (window.innerWidth < 1280) setItemsPerPage(3);
      else setItemsPerPage(4);
    };
    handleR();
    window.addEventListener("resize", handleR);
    return () => window.removeEventListener("resize", handleR);
  }, []);

  // Total virtual slides (infinite)
  const total = sorted.length;
  const virtualSlides = useMemo(() => {
    return [
      ...sorted.slice(-itemsPerPage),
      ...sorted,
      ...sorted.slice(0, itemsPerPage),
    ];
  }, [sorted, itemsPerPage]);

  const trueIndexOffset = itemsPerPage;

  // Safe index snapping
  const normalizeIndex = useCallback(
    (i) => {
      if (i < 0) return total - 1;
      if (i >= total) return 0;
      return i;
    },
    [total]
  );

  // ----- AUTOPLAY -----
  const next = useCallback(() => {
    setIndex((prev) => normalizeIndex(prev + 1));
  }, [normalizeIndex]);

  useEffect(() => {
    autoplayRef.current = next;
  });

  useEffect(() => {
    const id = setInterval(() => {
      if (!isHovering.current) autoplayRef.current();
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(id);
  }, []);

  // ----- TOUCH SWIPE -----
  const onTouchStart = (e) => {
    dragStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (!dragStartX.current) return;
    const diff = e.changedTouches[0].clientX - dragStartX.current;
    if (diff > SWIPE_THRESHOLD) prev();
    else if (diff < -SWIPE_THRESHOLD) next();
    dragStartX.current = null;
  };

  // ----- ARROWS -----
  const prev = useCallback(() => {
    setIndex((prev) => normalizeIndex(prev - 1));
  }, [normalizeIndex]);

  // Page dots
  const totalPages = Math.ceil(total / itemsPerPage);
  const activePage = Math.floor(index / itemsPerPage);

  // Detect centre visible slide
  const getCenterIndex = useCallback(
    (virtualIdx) => {
      const realIdx = (virtualIdx - trueIndexOffset + total) % total;
      const dist = Math.abs(realIdx - index);
      return Math.min(dist, 3);
    },
    [index, total, trueIndexOffset]
  );

  const handleAddToCart = (p) => {
    if (!user)
      return toast.error("Please log in to add products", {
        id: "login",
      });

    addToCart(p);
  };

  return (
    <section className="py-12 select-none">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-5xl sm:text-6xl font-extrabold text-emerald-400 mb-10">
          Featured
        </h2>

        <div
          className="relative"
          onMouseEnter={() => (isHovering.current = true)}
          onMouseLeave={() => (isHovering.current = false)}
        >
          <div
            className="overflow-hidden"
            ref={wrapperRef}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <motion.div
              className="flex"
              animate={{
                x: `-${((index + trueIndexOffset) * 100) / itemsPerPage}%`,
              }}
              transition={{
                type: "spring",
                stiffness: 160,
                damping: 22,
              }}
            >
              {virtualSlides.map((product, virtualIdx) => {
                const depth = getCenterIndex(virtualIdx);

                return (
                  <motion.div
                    key={`${product.id}-${virtualIdx}`}
                    className={`w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 flex-shrink-0 px-2 transition-all duration-300
                      ${
                        depth === 0
                          ? "scale-100 z-[5]"
                          : depth === 1
                          ? "scale-[0.94]"
                          : depth === 2
                          ? "scale-[0.88]"
                          : "scale-[0.82]"
                      }
                    `}
                    style={{
                      transformStyle: "preserve-3d",
                      perspective: 1000,
                    }}
                    whileHover={{
                      rotateY: depth === 0 ? 6 : 0,
                      rotateX: depth === 0 ? -3 : 0,
                      transition: { type: "spring", stiffness: 160 },
                    }}
                  >
                    <div
                      className={`bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-500/30 flex flex-col h-full transition-all duration-300 
                        ${depthBlur[depth]}
                        ${depth === 0 ? centerGlow : ""}
                      `}
                    >
                      <div className="overflow-clip">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                        />
                      </div>

                      <div className="p-4 flex flex-col h-full">
                        <h3 className="text-lg font-semibold mb-2 text-white text-center">
                          {product.name}
                        </h3>
                        <p className="text-sm text-emerald-200 mb-2 line-clamp-2 min-h-[2.6em] text-center">
                          {product.description}
                        </p>

                        <div className="mt-auto flex flex-col items-center gap-3">
                          <span className="text-2xl font-extrabold text-gray-200">
                            £{product.price.toFixed()}
                          </span>

                          <button
                            onClick={() => handleAddToCart(product)}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-6 py-2 rounded-full font-semibold shadow-md"
                          >
                            <FaCartShopping className="w-5 h-5" />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* ARROWS */}
          <button
            onClick={prev}
            className="absolute top-1/2 -left-4 -translate-y-1/2 p-2 bg-emerald-600 hover:bg-emerald-500 rounded-full z-20"
          >
            <FaChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={next}
            className="absolute top-1/2 -right-4 -translate-y-1/2 p-2 bg-emerald-600 hover:bg-emerald-500 rounded-full z-20"
          >
            <FaChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Page Dots */}
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }).map((_, p) => (
            <button
              key={p}
              onClick={() => setIndex(p * itemsPerPage)}
              className={`w-3 h-3 rounded-full transition ${
                p === activePage
                  ? "bg-emerald-400 scale-110"
                  : "bg-emerald-800 hover:bg-emerald-600"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
