import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { LuArrowUp } from "react-icons/lu";

const SHOW_AFTER_PX = 480;

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.2 }}
          className="fixed right-5 bottom-5 z-40 rounded-full bg-emerald-600 p-3 text-white shadow-lg shadow-emerald-950/40 hover:bg-emerald-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-400 sm:right-8 sm:bottom-8"
        >
          <LuArrowUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
