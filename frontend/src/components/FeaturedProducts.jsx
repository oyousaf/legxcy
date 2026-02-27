"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FaCartShopping, FaPlay } from "react-icons/fa6";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";

/* ---------- CONFIG ---------- */
const CARD = 320;
const GAP = 16;
const STEP = CARD + GAP;
const AUTOPLAY = 4500;
const DRAG_THRESHOLD = 50;

export default function FeaturedProducts({ featuredProducts = [] }) {
  /* ---------- DATA ---------- */
  const base = useMemo(() => {
    return [...featuredProducts]
      .filter((p) => p.isFeatured)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [featuredProducts]);

  if (!base.length) return null;

  /* Triple copy */
  const items = useMemo(() => [...base, ...base, ...base], [base]);
  const middle = base.length;

  /* ---------- STATE ---------- */
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(middle);
  const [animate, setAnimate] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [showPlay, setShowPlay] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  /* ---------- REFS ---------- */
  const containerRef = useRef(null);
  const dragStart = useRef(0);
  const dragging = useRef(false);

  /* ---------- MEASURE (for centering) ---------- */
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const centerOffset = containerWidth / 2 - CARD / 2;

  /* ---------- ACTIVE ---------- */
  const active = ((index % base.length) + base.length) % base.length;

  /* ---------- SEAMLESS INDEX RESET ---------- */
  useEffect(() => {
    if (index >= base.length * 2) {
      setAnimate(false);
      setIndex((i) => i - base.length);
    } else if (index < base.length) {
      setAnimate(false);
      setIndex((i) => i + base.length);
    }
  }, [index, base.length]);

  /* Re-enable animation next frame */
  useEffect(() => {
    if (!animate) {
      const id = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(id);
    }
  }, [animate]);

  /* ---------- AUTOPLAY ---------- */
  useEffect(() => {
    if (!autoplay || prefersReducedMotion) return;

    const id = setInterval(() => {
      setIndex((i) => i + 1);
    }, AUTOPLAY);

    return () => clearInterval(id);
  }, [autoplay, prefersReducedMotion]);

  const stopAutoplay = () => {
    setAutoplay(false);
    setShowPlay(true);
  };

  const resumeAutoplay = () => {
    setAutoplay(true);
    setShowPlay(false);
  };

  /* ---------- DRAG ---------- */
  const onPointerDown = (e) => {
    dragging.current = true;
    dragStart.current = e.clientX;
    stopAutoplay();
  };

  const onPointerUp = (e) => {
    if (!dragging.current) return;
    dragging.current = false;

    const delta = e.clientX - dragStart.current;

    if (Math.abs(delta) > DRAG_THRESHOLD) {
      setIndex((i) => i + (delta < 0 ? 1 : -1));
    }
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

  /* ---------- POSITION ---------- */
  const x = -index * STEP + centerOffset;

  /* ---------- RENDER ---------- */
  return (
    <section className="py-20 overflow-hidden">
      <h2 className="mb-10 text-center text-5xl font-extrabold text-emerald-400">
        Featured
      </h2>

      <div
        ref={containerRef}
        className="mx-auto max-w-7xl px-4 overflow-hidden"
      >
        <motion.div
          className="flex gap-4 cursor-grab active:cursor-grabbing"
          animate={{ x }}
          transition={
            animate
              ? { type: "spring", stiffness: 120, damping: 20 }
              : { duration: 0 }
          }
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {items.map((p, i) => {
            const idx = i % base.length;
            const diff = Math.abs(idx - active);
            const d = Math.min(diff, base.length - diff);

            return (
              <motion.div
                key={`${p.id}-${i}`}
                className="shrink-0"
                style={{ width: CARD }}
                animate={{
                  scale: d === 0 ? 1 : 0.92,
                  opacity: d === 0 ? 1 : 0.75,
                  y: d === 0 ? -4 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 28,
                }}
              >
                <div
                  className={`flex h-full flex-col rounded-2xl border border-emerald-500/30 bg-white/10 backdrop-blur-sm
                    ${d === 0 ? "glow-emerald" : ""}`}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-48 w-full rounded-t-2xl object-cover"
                  />

                  <div className="flex h-full flex-col p-4 text-center">
                    <h3 className="mb-2 text-lg font-semibold text-white">
                      {p.name}
                    </h3>

                    <p className="mb-3 line-clamp-2 text-sm text-emerald-200">
                      {p.description}
                    </p>

                    <div className="mt-auto flex flex-col items-center gap-3">
                      <span className="text-2xl font-extrabold text-gray-200">
                        £{p.price.toFixed()}
                      </span>

                      <button
                        onClick={(e) => add(p, e)}
                        className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2 font-semibold text-white hover:bg-emerald-500"
                      >
                        <FaCartShopping /> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* ---------- DOTS + PLAY ---------- */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <div className="flex gap-2">
          {base.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => {
                stopAutoplay();
                setIndex(middle + i);
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
            className="rounded-full bg-emerald-700/60 p-2 text-white"
          >
            <FaPlay size={14} />
          </motion.button>
        )}
      </div>
    </section>
  );
}
