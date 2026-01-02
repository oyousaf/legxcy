"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaCartShopping } from "react-icons/fa6";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";

const CARD_WIDTH = 320;
const GAP = 16;
const UNIT = CARD_WIDTH + GAP;
const AUTOPLAY_INTERVAL = 4500;

const centerGlow =
  "shadow-[0_0_28px_rgba(16,185,129,0.45)] border-emerald-400/50";

export default function FeaturedProducts({ featuredProducts = [] }) {
  /* -----------------------------------------------------
     DATA
  ----------------------------------------------------- */
  const base = useMemo(
    () => featuredProducts.filter((p) => p.isFeatured),
    [featuredProducts]
  );

  const baseCount = base.length;
  const items = useMemo(() => [...base, ...base, ...base], [base]);
  const middleOffset = baseCount * UNIT;

  /* -----------------------------------------------------
     REFS / STATE
  ----------------------------------------------------- */
  const scrollerRef = useRef(null);
  const autoplayRef = useRef(null);
  const isJumping = useRef(false);
  const isInteracting = useRef(false);

  const [active, setActive] = useState(0);

  /* -----------------------------------------------------
     INITIAL CENTER
  ----------------------------------------------------- */
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    requestAnimationFrame(() => {
      el.scrollLeft = middleOffset;
    });
  }, [middleOffset]);

  /* -----------------------------------------------------
     INFINITE LOOP + ACTIVE INDEX
  ----------------------------------------------------- */
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      if (isJumping.current) return;

      const x = el.scrollLeft;

      if (x < UNIT) {
        isJumping.current = true;
        el.scrollLeft = x + middleOffset;
        isJumping.current = false;
        return;
      }

      if (x > middleOffset * 2) {
        isJumping.current = true;
        el.scrollLeft = x - middleOffset;
        isJumping.current = false;
        return;
      }

      const idx = Math.round(x / UNIT) % baseCount;
      setActive(idx);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [baseCount, middleOffset]);

  /* -----------------------------------------------------
     AUTOPLAY
  ----------------------------------------------------- */
  useEffect(() => {
    autoplayRef.current = setInterval(() => {
      if (!isInteracting.current) {
        scrollerRef.current?.scrollBy({
          left: UNIT,
          behavior: "smooth",
        });
      }
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(autoplayRef.current);
  }, []);

  /* -----------------------------------------------------
     DOT CLICK
  ----------------------------------------------------- */
  const scrollToIndex = (i) => {
    scrollerRef.current?.scrollTo({
      left: middleOffset + i * UNIT,
      behavior: "smooth",
    });
  };

  /* -----------------------------------------------------
     CART
  ----------------------------------------------------- */
  const { addToCart } = useCartStore();
  const { user } = useUserStore();

  const handleAddToCart = (p, e) => {
    e.stopPropagation();
    if (!user) return toast.error("Please log in");
    addToCart(p);
  };

  /* -----------------------------------------------------
     RENDER
  ----------------------------------------------------- */
  return (
    <section className="relative py-20">
      <h2 className="text-center text-5xl sm:text-6xl font-extrabold text-emerald-400 mb-10">
        Featured
      </h2>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* SCROLLER */}
        <div
          ref={scrollerRef}
          onPointerDown={() => (isInteracting.current = true)}
          onPointerUp={() => (isInteracting.current = false)}
          onPointerLeave={() => (isInteracting.current = false)}
          className="
            flex gap-4 overflow-x-auto
            snap-x snap-mandatory
            scrollbar-none
            [-webkit-overflow-scrolling:touch]
            [-ms-overflow-style:none]
            [scrollbar-width:none]
          "
        >
          {items.map((product, i) => {
            const realIndex = i % baseCount;
            const dist = Math.min(
              Math.abs(realIndex - active),
              baseCount - Math.abs(realIndex - active)
            );

            const scale =
              dist === 0 ? 1 :
              dist === 1 ? 0.94 :
              dist === 2 ? 0.88 : 0.82;

            const opacity =
              dist === 0 ? 1 :
              dist === 1 ? 0.85 :
              dist === 2 ? 0.7 : 0.55;

            return (
              <motion.div
                key={`${product.id}-${i}`}
                className="snap-center shrink-0"
                style={{ width: CARD_WIDTH }}
                animate={{ scale, opacity }}
                transition={{ type: "spring", stiffness: 220, damping: 28 }}
              >
                <div
                  className={`
                    bg-white/10 backdrop-blur-sm
                    rounded-2xl border border-emerald-500/30
                    flex flex-col h-full
                    ${dist === 0 ? centerGlow : ""}
                  `}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-48 w-full object-cover rounded-t-2xl"
                    loading="lazy"
                  />

                  <div className="p-4 flex flex-col text-center h-full">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {product.name}
                    </h3>

                    <p className="text-sm text-emerald-200 line-clamp-2 mb-3">
                      {product.description}
                    </p>

                    <div className="mt-auto flex flex-col items-center gap-3">
                      <span className="text-2xl font-extrabold text-gray-200">
                        £{product.price.toFixed()}
                      </span>

                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-full font-semibold"
                      >
                        <FaCartShopping />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* DOTS */}
        <div className="flex justify-center gap-2 mt-6">
          {base.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === active
                  ? "w-6 bg-emerald-400"
                  : "w-2 bg-emerald-400/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
