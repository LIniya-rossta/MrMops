import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "github-pages",
  base: "/MrMops/",
  publicDir: "../public",
  plugins: [react()],
  define: {
    "import.meta.env.VITE_ORDER_API_URL": JSON.stringify(
      "https://mr-mops-kg.zilolatashievaz.chatgpt.site/api/order",
    ),
  },
  build: {
    outDir: "../docs",
    emptyOutDir: true,
  },
});
