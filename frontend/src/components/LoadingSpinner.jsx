import { motion } from "framer-motion";

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <motion.div
        className="relative"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="w-20 h-20 border-2 border-emerald-200 rounded-full" />
        <div className="w-20 h-20 border-t-4 border-emerald-500 animate-spin rounded-full absolute left-0 top-0" />
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-400 rounded-full"
          style={{ width: 18, height: 18 }}
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
        />
        <div className="sr-only">Loading</div>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;
