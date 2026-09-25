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
const EAGER_IMAGE_COUNT = 4;
const getId = (p) => p.id ?? p._id;

// Snap offset: centred on mobile, otherwise lines the card up with the page's
// content column (max-w-7xl + sm:px-6/lg:px-8) while the track still runs
// full-bleed. Keep in sync with those classes; assumes a 16px root font size.
const contentInset = (viewSize, snapSize) => {
  if (viewSize < 640) return (viewSize - snapSize) / 2;
  const gutter = viewSize >= 1024 ? 32 : 24;
  return Math.max(0, (viewSize - 1280) / 2) + gutter;
};

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
  // Play/pause is driven from React state below rather than the plugin's own
  // resume logic, so a user's pause survives drags, hovers and reInits.
  const [autoplayPlugin] = useState(() =>
    Autoplay({
      delay: AUTOPLAY_DELAY,
      playOnInit: false,
      stopOnInteraction: true,
      stopOnFocusIn: false,
    }),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: contentInset, dragFree: true },
    prefersReducedMotion ? [] : [autoplayPlugin],
  );

  const [userPaused, setUserPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const shouldPlay = !userPaused && !isHovered && !hasFocus;
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

  // Apply shouldPlay to the plugin, and re-apply it after anything that stops
  // or re-creates it: a drag ends (touch - mouse drags are covered by hover),
  // or a reInit (resize, slide changes) re-initialises the plugin.
  useEffect(() => {
    if (!emblaApi) return;
    const sync = () => {
      const plugin = emblaApi.plugins()?.autoplay;
      if (!plugin) return;
      if (shouldPlay) plugin.play();
      else plugin.stop();
    };
    sync();
    emblaApi.on("pointerUp", sync);
    emblaApi.on("reInit", sync);
    return () => {
      emblaApi.off("pointerUp", sync);
      emblaApi.off("reInit", sync);
    };
  }, [emblaApi, shouldPlay]);

  const toggleAutoplay = useCallback(() => setUserPaused((p) => !p), []);

  const scrollPrev = useCallback(() => {
    setUserPaused(true);
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    setUserPaused(true);
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const onPointerEnter = (e) => {
    if (e.pointerType === "mouse") setIsHovered(true);
  };
  const onPointerLeave = (e) => {
    if (e.pointerType === "mouse") setIsHovered(false);
  };
  const onBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setHasFocus(false);
  };

  /* ---------- CART ---------- */
  const { addToCart } = useCartStore();
  const { user } = useUserStore();

  const add = (p, e) => {
    e.stopPropagation();
    if (!user) return toast.error("Please log in");
    addToCart(p.id ? p : { ...p, id: getId(p) });
  };

  if (!base.length) return null;

  return (
    <section
      className="py-24"
      aria-roledescription="carousel"
      aria-labelledby="featured-heading"
    >
      <div className="mx-auto mb-8 flex max-w-7xl items-end justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase">
            Handpicked
          </p>
          <h2
            id="featured-heading"
            className="font-display text-4xl font-bold text-white sm:text-5xl"
          >
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
              aria-label={userPaused ? "Resume autoplay" : "Pause autoplay"}
              className="ml-1 rounded-full border border-white/15 p-2.5 text-white/80 transition hover:border-emerald-400 hover:text-emerald-400"
            >
              {userPaused ? <LuPlay size={18} /> : <LuPause size={18} />}
            </button>
          )}
        </div>
      </div>

      <div
        className="overflow-hidden mask-[linear-gradient(to_right,transparent,black_2rem,black_calc(100%-2rem),transparent)]"
        ref={emblaRef}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onFocus={() => setHasFocus(true)}
        onBlur={onBlur}
      >
        {/* py-2 leaves room for the hover lift inside the clipped viewport.
            Spacing is a margin on each slide, not flex gap: Embla reads the
            last slide's margin as the gap at the loop seam, but ignores gap. */}
        <div className="flex py-2">
          {base.map((p, index) => (
            // Embla controls this element's transform (for loop
            // repositioning) - it must not share a transform with the
            // Motion element below, or the two will fight and Embla's
            // slide placement breaks on the loop wrap.
            <div
              key={getId(p)}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${base.length}`}
              className="mr-5 w-64 shrink-0 sm:w-80"
            >
              <motion.div
                className="group h-full overflow-hidden rounded-3xl border border-white/10 bg-emerald-950/60"
                whileHover={prefersReducedMotion ? undefined : { y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              >
                <div className="aspect-4/3 overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading={index < EAGER_IMAGE_COUNT ? "eager" : "lazy"}
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
