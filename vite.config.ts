import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: "client",
  publicDir: "public",
  resolve: {
    alias: { "@": path.resolve(__dirname, "client/src") },
  },
  envDir: "../",  
  server: {
    port: 5000,
    host: "0.0.0.0",
  },
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react":  ["react", "react-dom"],
          "vendor-wagmi":  ["wagmi", "viem", "@rainbow-me/rainbowkit"],
          "vendor-ethers": ["ethers"],
        },
      },
    },
  },
});
