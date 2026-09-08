// vite.config.js
import { defineConfig } from "file:///D:/Documents/Projects/legxcy/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Documents/Projects/legxcy/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///D:/Documents/Projects/legxcy/frontend/node_modules/@tailwindcss/vite/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000"
      }
    }
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
          "vendor-icons": ["react-icons/lu", "react-icons/fa6", "react-icons/fa", "react-icons/fi", "react-icons/go", "react-icons/md", "react-icons/pi"]
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxEb2N1bWVudHNcXFxcUHJvamVjdHNcXFxcbGVneGN5XFxcXGZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxEb2N1bWVudHNcXFxcUHJvamVjdHNcXFxcbGVneGN5XFxcXGZyb250ZW5kXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9Eb2N1bWVudHMvUHJvamVjdHMvbGVneGN5L2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tIFwiQHRhaWx3aW5kY3NzL3ZpdGVcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpLCB0YWlsd2luZGNzcygpXSxcbiAgc2VydmVyOiB7XG4gICAgcHJveHk6IHtcbiAgICAgIFwiL2FwaVwiOiB7XG4gICAgICAgIHRhcmdldDogXCJodHRwOi8vbG9jYWxob3N0OjUwMDBcIixcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgXCJ2ZW5kb3ItcmVhY3RcIjogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIiwgXCJyZWFjdC1yb3V0ZXItZG9tXCJdLFxuICAgICAgICAgIFwidmVuZG9yLW1vdGlvblwiOiBbXCJtb3Rpb25cIl0sXG4gICAgICAgICAgXCJ2ZW5kb3Itc3VwYWJhc2VcIjogW1wiQHN1cGFiYXNlL3N1cGFiYXNlLWpzXCJdLFxuICAgICAgICAgIFwidmVuZG9yLWVtYmxhXCI6IFtcImVtYmxhLWNhcm91c2VsLXJlYWN0XCIsIFwiZW1ibGEtY2Fyb3VzZWwtYXV0b3BsYXlcIl0sXG4gICAgICAgICAgXCJ2ZW5kb3ItaGVsbWV0XCI6IFtcInJlYWN0LWhlbG1ldC1hc3luY1wiXSxcbiAgICAgICAgICBcInZlbmRvci1pY29uc1wiOiBbXCJyZWFjdC1pY29ucy9sdVwiLCBcInJlYWN0LWljb25zL2ZhNlwiLCBcInJlYWN0LWljb25zL2ZhXCIsIFwicmVhY3QtaWNvbnMvZmlcIiwgXCJyZWFjdC1pY29ucy9nb1wiLCBcInJlYWN0LWljb25zL21kXCIsIFwicmVhY3QtaWNvbnMvcGlcIl0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMlMsU0FBUyxvQkFBb0I7QUFDeFUsT0FBTyxXQUFXO0FBQ2xCLE9BQU8saUJBQWlCO0FBR3hCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDO0FBQUEsRUFDaEMsUUFBUTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osZ0JBQWdCLENBQUMsU0FBUyxhQUFhLGtCQUFrQjtBQUFBLFVBQ3pELGlCQUFpQixDQUFDLFFBQVE7QUFBQSxVQUMxQixtQkFBbUIsQ0FBQyx1QkFBdUI7QUFBQSxVQUMzQyxnQkFBZ0IsQ0FBQyx3QkFBd0IseUJBQXlCO0FBQUEsVUFDbEUsaUJBQWlCLENBQUMsb0JBQW9CO0FBQUEsVUFDdEMsZ0JBQWdCLENBQUMsa0JBQWtCLG1CQUFtQixrQkFBa0Isa0JBQWtCLGtCQUFrQixrQkFBa0IsZ0JBQWdCO0FBQUEsUUFDaEo7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
