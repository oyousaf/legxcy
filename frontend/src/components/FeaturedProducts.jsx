import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { motion, useReducedMotion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { FaCartShopping, FaPlay, FaPause } from "react-icons/fa6";
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
    { loop: true, align: "center", skipSnaps: false },
    prefersReducedMotion ? [] : [autoplayPlugin],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(!prefersReducedMotion);

  const onSelect = useCallback((api) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

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

  const scrollTo = useCallback(
    (index) => {
      emblaApi?.plugins()?.autoplay?.stop();
      emblaApi?.scrollTo(index);
    },
    [emblaApi],
  );

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
    <section className="py-20 overflow-x-hidden">
      <h2 className="mb-10 text-center text-5xl font-extrabold text-emerald-400">
        Featured
      </h2>

      <div className="mx-auto max-w-7xl px-4">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 pt-8">
            {base.map((p, index) => {
              const d = Math.min(
                Math.abs(index - selectedIndex),
                base.length - Math.abs(index - selectedIndex),
              );

              return (
                // Embla controls this element's transform (for loop
                // repositioning) - it must not share a transform with the
                // Framer Motion element below, or the two will fight and
                // Embla's slide placement breaks on the loop wrap.
                <div key={getId(p)} className="w-72 shrink-0 sm:w-80">
                  <motion.div
                    animate={{
                      scale: d === 0 ? 1 : 0.92,
                      opacity: d === 0 ? 1 : 0.75,
                      y: d === 0 ? -4 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 220, damping: 28 }}
                  >
                    <div
                      className={`flex h-full flex-col rounded-2xl border border-emerald-500/30 bg-white/10 backdrop-blur-sm
                        ${d === 0 ? "glow-emerald" : ""}`}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="eager"
                        decoding="async"
                        width={320}
                        height={192}
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
                            type="button"
                            onClick={(e) => add(p, e)}
                            className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2 font-semibold text-white hover:bg-emerald-500"
                          >
                            <FaCartShopping /> Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DOTS + PLAY/PAUSE */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="flex gap-2">
            {base.map((p, i) => (
              <motion.button
                key={p.id}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === selectedIndex}
                animate={{
                  width: i === selectedIndex ? 24 : 8,
                  opacity: i === selectedIndex ? 1 : 0.4,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="h-2 rounded-full bg-emerald-400"
              />
            ))}
          </div>

          {!prefersReducedMotion && (
            <motion.button
              type="button"
              onClick={toggleAutoplay}
              className="rounded-full bg-emerald-700/60 p-2 text-white"
              aria-label={isPlaying ? "Pause autoplay" : "Resume autoplay"}
            >
              {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
            </motion.button>
          )}
        </div>
      </div>
    </section>
  );
}

FeaturedProducts.propTypes = {
  featuredProducts: PropTypes.array,
};
