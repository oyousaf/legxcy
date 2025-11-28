import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { FaCartShopping, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";

const AUTOPLAY_INTERVAL = 4500;
const SWIPE_THRESHOLD = 55;

const centerGlow =
  "shadow-[0_0_28px_rgba(16,185,129,0.45)] border-emerald-400/50";

const depthBlur = {
  0: "blur-0 opacity-100",
  1: "blur-[1px] opacity-90",
  2: "blur-[2px] opacity-80",
  3: "blur-[3px] opacity-70",
};

export default function FeaturedProducts({ featuredProducts = [] }) {
  /* -----------------------------------------------------
     SORT NEW → OLD
  ----------------------------------------------------- */
  const sorted = useMemo(() => {
    return [...featuredProducts]
      .filter((p) => p.isFeatured)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [featuredProducts]);

  const total = sorted.length;

  /* -----------------------------------------------------
     RESPONSIVE ITEMS PER PAGE
  ----------------------------------------------------- */
  const [itemsPerPage, setItemsPerPage] = useState(4);

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

  const trueOffset = itemsPerPage;

  /* -----------------------------------------------------
     CREATE VIRTUAL SLIDES (∞ LOOP)
  ----------------------------------------------------- */
  const virtualSlides = useMemo(() => {
    return [
      ...sorted.slice(-itemsPerPage),
      ...sorted,
      ...sorted.slice(0, itemsPerPage),
    ];
  }, [sorted, itemsPerPage]);

  /* -----------------------------------------------------
     TRUE INFINITE LOOP LOGIC
  ----------------------------------------------------- */
  const [index, setIndex] = useState(0);
  const [virtualIndex, setVirtualIndex] = useState(trueOffset);
  const [isAnimating, setIsAnimating] = useState(true);

  const normalizeIndex = useCallback(
    (i) => {
      if (i < 0) return total - 1;
      if (i >= total) return 0;
      return i;
    },
    [total]
  );

  const next = useCallback(() => {
    setIsAnimating(true);
    setVirtualIndex((v) => v + 1);
    setIndex((i) => normalizeIndex(i + 1));
  }, [normalizeIndex]);

  const prev = useCallback(() => {
    setIsAnimating(true);
    setVirtualIndex((v) => v - 1);
    setIndex((i) => normalizeIndex(i - 1));
  }, [normalizeIndex]);

  /* Silent warp back to real position */
  useEffect(() => {
    if (virtualIndex <= 0) {
      setTimeout(() => {
        setIsAnimating(false);
        setVirtualIndex(total);
      }, 240);
    } else if (virtualIndex >= total + trueOffset) {
      setTimeout(() => {
        setIsAnimating(false);
        setVirtualIndex(trueOffset);
      }, 240);
    }
  }, [virtualIndex, total, trueOffset]);

  /* -----------------------------------------------------
     AUTOPLAY
  ----------------------------------------------------- */
  const autoplayRef = useRef(next);
  const isHovering = useRef(false);

  useEffect(() => {
    autoplayRef.current = next;
  });

  useEffect(() => {
    const id = setInterval(() => {
      if (!isHovering.current) autoplayRef.current();
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(id);
  }, []);

  /* -----------------------------------------------------
     SWIPE + MOMENTUM
  ----------------------------------------------------- */
  const dragStartX = useRef(null);
  const deltaX = useRef(0);

  const onTouchStart = (e) => {
    dragStartX.current = e.touches[0].clientX;
    deltaX.current = 0;
  };

  const onTouchMove = (e) => {
    deltaX.current = e.touches[0].clientX - dragStartX.current;
  };

  const onTouchEnd = () => {
    if (Math.abs(deltaX.current) > SWIPE_THRESHOLD) {
      deltaX.current > 0 ? prev() : next();
    } else {
      // momentum flick
      if (Math.abs(deltaX.current) > 30) {
        deltaX.current > 0 ? prev() : next();
      }
    }

    dragStartX.current = null;
  };

  /* -----------------------------------------------------
     DEPTH + SCALE
  ----------------------------------------------------- */
  const getDepth = useCallback(
    (virtualIdx) => {
      const realIdx = (virtualIdx - trueOffset + total) % total;
      const dist = Math.abs(realIdx - index);
      return Math.min(dist, 3);
    },
    [index, total, trueOffset]
  );

  /* -----------------------------------------------------
     ADD TO CART
  ----------------------------------------------------- */
  const { addToCart } = useCartStore();
  const { user } = useUserStore();

  const handleAddToCart = (p) => {
    if (!user)
      return toast.error("Please log in to add products", {
        id: "login",
      });

    addToCart(p);
  };

  /* -----------------------------------------------------
     RENDER
  ----------------------------------------------------- */
  return (
    <section className="py-16 select-none pt-16">
      <div className="w-full">
        <h2 className="text-center text-5xl sm:text-6xl font-extrabold text-emerald-400 mb-10">
          Featured
        </h2>

        <div
          className="relative"
          onMouseEnter={() => (isHovering.current = true)}
          onMouseLeave={() => (isHovering.current = false)}
        >
          <div
            className="overflow-visible touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <motion.div
              className="flex will-change-transform"
              animate={{
                x: `-${(virtualIndex * 100) / itemsPerPage}%`,
              }}
              transition={
                isAnimating
                  ? { type: "spring", stiffness: 160, damping: 22 }
                  : { duration: 0 }
              }
              style={{
                transform: "translateZ(0)",
              }}
            >
              {virtualSlides.map((product, virtualIdx) => {
                const depth = getDepth(virtualIdx);

                return (
                  <motion.div
                    key={`${product.id}-${virtualIdx}`}
                    className={`
                      w-full sm:w-1/2 lg:w-1/3 xl:w-1/4
                      flex-shrink-0 px-2 transition-all duration-300
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
                      className={`
                        bg-white bg-opacity-10 backdrop-blur-sm
                        rounded-2xl shadow-lg border border-emerald-500/30
                        flex flex-col h-full transition-all duration-300
                        ${depthBlur[depth]}
                        ${depth === 0 ? centerGlow : ""}
                      `}
                    >
                      <div className="overflow-clip rounded-t-2xl">
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
      </div>
    </section>
  );
}
