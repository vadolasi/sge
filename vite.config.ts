import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import path from "path"
import Pages from "vite-plugin-pages"

export default defineConfig({
  plugins: [react(), Pages({ importMode: "sync" })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
})
