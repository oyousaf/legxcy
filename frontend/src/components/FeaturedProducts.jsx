"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FaCartShopping, FaPlay } from "react-icons/fa6";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";

const CARD = 320;
const GAP = 16;
const STEP = CARD + GAP;
const AUTOPLAY = 4500;

const glow = "shadow-[0_0_28px_rgba(16,185,129,0.45)] border-emerald-400/50";

export default function FeaturedProducts({ featuredProducts = [] }) {
  /* ---------- DATA ---------- */
  const base = useMemo(
    () =>
      [...featuredProducts]
        .filter((p) => p.isFeatured)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [featuredProducts]
  );

  const items = useMemo(() => [...base, ...base, ...base], [base]);
  const offset = base.length * STEP;

  /* ---------- STATE ---------- */
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [showPlay, setShowPlay] = useState(false);

  /* ---------- REFS ---------- */
  const scroller = useRef(null);
  const jumping = useRef(false);
  const autoplaying = useRef(false);

  /* ---------- CENTER ON LOAD ---------- */
  useEffect(() => {
    if (scroller.current) scroller.current.scrollLeft = offset;
  }, [offset]);

  /* ---------- AUTOPLAY ---------- */
  useEffect(() => {
    if (!autoplay || prefersReducedMotion) return;

    const id = setInterval(() => {
      const el = scroller.current;
      if (!el) return;

      autoplaying.current = true;
      el.scrollBy({ left: STEP, behavior: "smooth" });
      requestAnimationFrame(() => (autoplaying.current = false));
    }, AUTOPLAY);

    return () => clearInterval(id);
  }, [autoplay, prefersReducedMotion]);

  /* ---------- SCROLL (INDEX + LOOP) ---------- */
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    const onScroll = () => {
      if (autoplaying.current || jumping.current) return;

      const x = el.scrollLeft;

      if (x < STEP) {
        jumping.current = true;
        el.scrollLeft = x + offset;
        jumping.current = false;
        return;
      }

      if (x > offset * 2) {
        jumping.current = true;
        el.scrollLeft = x - offset;
        jumping.current = false;
        return;
      }

      setActive(Math.round(x / STEP) % base.length);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [base.length, offset]);

  /* ---------- USER INTENT ---------- */
  const stopAutoplay = () => {
    setAutoplay(false);
    setShowPlay(true);
  };

  const resumeAutoplay = () => {
    setAutoplay(true);
    setShowPlay(false);
  };

  /* ---------- CART ---------- */
  const { addToCart } = useCartStore();
  const { user } = useUserStore();

  const add = (p, e) => {
    e.stopPropagation();
    stopAutoplay();
    if (!user) return toast.error("Please log in");
    addToCart(p);
  };

  /* ---------- RENDER ---------- */
  return (
    <section className="py-20 overflow-x-hidden">
      <h2 className="text-center text-5xl font-extrabold text-emerald-400 mb-10">
        Featured
      </h2>

      <div className="max-w-7xl mx-auto px-4">
        <div className="overflow-hidden">
          <div
            ref={scroller}
            onPointerDown={stopAutoplay}
            className="
              flex gap-4 overflow-x-auto snap-x snap-mandatory
              scrollbar-none overscroll-x-contain
              [-webkit-overflow-scrolling:touch]
              sm:[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]
            "
          >
            {items.map((p, i) => {
              const d = Math.min(
                Math.abs((i % base.length) - active),
                base.length
              );

              return (
                <motion.div
                  key={`${p.id}-${i}`}
                  className="snap-center shrink-0"
                  style={{ width: CARD }}
                  animate={{
                    scale: d === 0 ? 1 : 0.9,
                    opacity: d === 0 ? 1 : 0.7,
                    y: d === 0 ? -6 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 220, damping: 28 }}
                >
                  <div
                    className={`
                      bg-white/10 backdrop-blur-sm rounded-2xl border
                      border-emerald-500/30 flex flex-col h-full
                      ${d === 0 ? glow : ""}
                    `}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-48 w-full object-cover rounded-t-2xl"
                    />

                    <div className="p-4 flex flex-col text-center h-full">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {p.name}
                      </h3>

                      <p className="text-sm text-emerald-200 line-clamp-2 mb-3">
                        {p.description}
                      </p>

                      <div className="mt-auto flex flex-col items-center gap-3">
                        <span className="text-2xl font-extrabold text-gray-200">
                          £{p.price.toFixed()}
                        </span>

                        <button
                          onClick={(e) => add(p, e)}
                          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-full font-semibold"
                        >
                          <FaCartShopping /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* DOTS + PLAY */}
        <div className="flex justify-center items-center gap-4 mt-6">
          <div className="flex gap-2">
            {base.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => {
                  stopAutoplay();
                  scroller.current.scrollTo({
                    left: offset + i * STEP,
                    behavior: "smooth",
                  });
                }}
                animate={{
                  width: i === active ? 24 : 8,
                  opacity: i === active ? 1 : 0.4,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="h-2 rounded-full bg-emerald-400"
              />
            ))}
          </div>

          {showPlay && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={resumeAutoplay}
              className="p-2 rounded-full bg-emerald-700/60 text-white"
              aria-label="Resume autoplay"
            >
              <FaPlay size={14} />
            </motion.button>
          )}
        </div>
      </div>
    </section>
  );
}
