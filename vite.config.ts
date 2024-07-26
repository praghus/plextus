import { defineConfig } from "vite";
// import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "node:path";
import electron from "vite-plugin-electron/simple";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "esnext",
  },
  // resolve: {
  //   alias: {
  //     // Add alias if the package has non-standard entry points
  //     "wasm-imagemagick": "./node_modules/wasm-imagemagick/dist/src/index.js",
  //   },
  // },
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
    electron({
      main: {
        // Shortcut of `build.lib.entry`.
        entry: "electron/main.ts",
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`.
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: path.join(__dirname, "electron/preload.ts"),
      },
      // Ployfill the Electron and Node.js API for Renderer process.
      // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
      // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
      renderer:
        process.env.NODE_ENV === "test"
          ? // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
            undefined
          : {},
    }),
    //   viteStaticCopy({
    //     targets: [
    //       {
    //         src: "./node_modules/wasm-imagemagick/dist/magick.wasm",
    //         dest: ".",
    //       },
    //       {
    //         src: "./node_modules/wasm-imagemagick/dist/magick.js",
    //         dest: ".",
    //       },
    //     ],
    //   }),
  ],
  // optimizeDeps: {
  //   include: ["wasm-imagemagick"],
  // },
});
