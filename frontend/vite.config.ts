import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
    // External Publication
    host: true,
    // You can change the port for starting up.
    port: 3000,
    proxy: {
      "/api": {
        target: "http://172.17.0.1:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
