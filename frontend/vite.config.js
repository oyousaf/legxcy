import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-motion": ["motion"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-embla": ["embla-carousel-react", "embla-carousel-autoplay"],
          "vendor-helmet": ["react-helmet-async"],
          "vendor-icons": ["react-icons/lu", "react-icons/fa6", "react-icons/fa", "react-icons/fi", "react-icons/go", "react-icons/md", "react-icons/pi"],
        },
      },
    },
  },
});
