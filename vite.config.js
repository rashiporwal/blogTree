import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  base: "./",
  build: {
    target: "es2020",
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, "index.html"),
        gallery: resolve(import.meta.dirname, "gallery.html"),
        journal: resolve(import.meta.dirname, "blog.html"),
        contact: resolve(import.meta.dirname, "contact.html")
      }
    }
  }
});
