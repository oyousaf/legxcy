import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { motion, useReducedMotion } from "motion/react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  LuChevronLeft,
  LuChevronRight,
  LuPause,
  LuPlay,
  LuShoppingCart,
} from "react-icons/lu";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";

const AUTOPLAY_DELAY = 5000;
const getId = (p) => p.id ?? p._id;

export default function FeaturedProducts({ featuredProducts = [] }) {
  const base = useMemo(
    () =>
      [...featuredProducts]
        .filter((p) => p.isFeatured)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [featuredProducts],
  );

  const prefersReducedMotion = useReducedMotion();
  const [autoplayPlugin] = useState(() =>
    Autoplay({ delay: AUTOPLAY_DELAY, stopOnInteraction: false }),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: true },
    prefersReducedMotion ? [] : [autoplayPlugin],
  );

  const [isPlaying, setIsPlaying] = useState(!prefersReducedMotion);
  const [progress, setProgress] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onUpdate = useCallback((api) => {
    setProgress(Math.min(1, Math.max(0, api.scrollProgress())));
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onUpdate(emblaApi);
    emblaApi.on("scroll", onUpdate);
    emblaApi.on("reInit", onUpdate);
    emblaApi.on("select", onUpdate);
    return () => {
      emblaApi.off("scroll", onUpdate);
      emblaApi.off("reInit", onUpdate);
      emblaApi.off("select", onUpdate);
    };
  }, [emblaApi, onUpdate]);

  // Slides can change after mount (e.g. the async product fetch resolving
  // after Embla already measured the DOM) - tell Embla to recompute.
  useEffect(() => {
    emblaApi?.reInit();
  }, [emblaApi, base]);

  useEffect(() => {
    if (!emblaApi) return;
    const plugin = emblaApi.plugins()?.autoplay;
    if (!plugin) return;
    setIsPlaying(plugin.isPlaying());
    const handlePlay = () => setIsPlaying(true);
    const handleStop = () => setIsPlaying(false);
    emblaApi.on("autoplay:play", handlePlay);
    emblaApi.on("autoplay:stop", handleStop);
    return () => {
      emblaApi.off("autoplay:play", handlePlay);
      emblaApi.off("autoplay:stop", handleStop);
    };
  }, [emblaApi]);

  const toggleAutoplay = useCallback(() => {
    const plugin = emblaApi?.plugins()?.autoplay;
    if (!plugin) return;
    if (plugin.isPlaying()) plugin.stop();
    else plugin.play();
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    emblaApi?.plugins()?.autoplay?.stop();
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.plugins()?.autoplay?.stop();
    emblaApi?.scrollNext();
  }, [emblaApi]);

  /* ---------- CART ---------- */
  const { addToCart } = useCartStore();
  const { user } = useUserStore();

  const add = (p, e) => {
    e.stopPropagation();
    emblaApi?.plugins()?.autoplay?.stop();
    if (!user) return toast.error("Please log in");
    addToCart(p.id ? p : { ...p, id: getId(p) });
  };

  if (!base.length) return null;

  return (
    <section className="py-24">
      <div className="mx-auto mb-8 flex max-w-7xl items-end justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase">
            Handpicked
          </p>
          <h2 className="font-display text-4xl font-bold text-white sm:text-5xl">
            Featured
          </h2>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label="Previous product"
            className="rounded-full border border-white/15 p-2.5 text-white/80 transition hover:border-emerald-400 hover:text-emerald-400 disabled:pointer-events-none disabled:opacity-30"
          >
            <LuChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label="Next product"
            className="rounded-full border border-white/15 p-2.5 text-white/80 transition hover:border-emerald-400 hover:text-emerald-400 disabled:pointer-events-none disabled:opacity-30"
          >
            <LuChevronRight size={20} />
          </button>
          {!prefersReducedMotion && (
            <button
              type="button"
              onClick={toggleAutoplay}
              aria-label={isPlaying ? "Pause autoplay" : "Resume autoplay"}
              className="ml-1 rounded-full border border-white/15 p-2.5 text-white/80 transition hover:border-emerald-400 hover:text-emerald-400"
            >
              {isPlaying ? <LuPause size={18} /> : <LuPlay size={18} />}
            </button>
          )}
        </div>
      </div>

      <div
        className="overflow-hidden mask-[linear-gradient(to_right,transparent,black_2rem,black_calc(100%-2rem),transparent)]"
        ref={emblaRef}
      >
        <div className="flex gap-5 px-4 sm:px-6 lg:px-8">
          {base.map((p) => (
            // Embla controls this element's transform (for loop
            // repositioning) - it must not share a transform with the
            // Motion element below, or the two will fight and Embla's
            // slide placement breaks on the loop wrap.
            <div key={getId(p)} className="w-64 shrink-0 sm:w-80">
              <motion.div
                className="group h-full overflow-hidden rounded-3xl border border-white/10 bg-emerald-950/60"
                whileHover={prefersReducedMotion ? undefined : { y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              >
                <div className="aspect-4/3 overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="eager"
                    decoding="async"
                    width={320}
                    height={240}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-col p-5">
                  <h3 className="font-display mb-1 text-lg font-semibold text-white">
                    {p.name}
                  </h3>

                  <p className="mb-4 line-clamp-2 text-sm text-emerald-200/70">
                    {p.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xl font-bold text-emerald-400">
                      £{p.price.toFixed()}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => add(p, e)}
                      aria-label={`Add ${p.name} to cart`}
                      className="rounded-full bg-emerald-600 p-2.5 text-white transition hover:bg-emerald-500"
                    >
                      <LuShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-emerald-400"
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "tween", duration: 0.15 }}
          />
        </div>
      </div>
    </section>
  );
}

FeaturedProducts.propTypes = {
  featuredProducts: PropTypes.array,
};
