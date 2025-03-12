import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 3000,
    host: '127.0.0.1',
    strictPort: false,
    cors: true,
    hmr: {
      host: '127.0.0.1',
      protocol: 'ws'
    }
  },
  preview: {
    port: 3000,
    host: '127.0.0.1',
    strictPort: false,
    cors: true
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
