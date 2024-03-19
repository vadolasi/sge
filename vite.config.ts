import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import path from "path"
import Pages from "vite-plugin-pages"

export default defineConfig({
  plugins: [
    react(),
    Pages({ importMode: "sync", exclude: ["**/_**.{ts,tsx}"] })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  server: {
    headers: {
      "ngrok-skip-browser-warning": "true"
    }
  }
})
