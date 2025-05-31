import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
 build: {
   sourcemap: "hidden",
   rollupOptions: {
     input: "src/interactive-light.ts",
     output: {
        dir: path.resolve("./dist"),
        entryFileNames: "interactive-light.js"
     },
     external: [
      "socketlib"
     ]
   },
 }
});