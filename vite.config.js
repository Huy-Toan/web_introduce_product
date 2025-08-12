import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [react(), cloudflare(), viteStaticCopy({
      targets: [
        { src: 'node_modules/editor.md/lib', dest: 'editor.md' }
      ]
    })],
});
