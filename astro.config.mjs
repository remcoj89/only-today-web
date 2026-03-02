import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  output: "static",
  site: process.env.PUBLIC_WEB_URL || process.env.PUBLIC_APP_URL,
  integrations: [react(), sitemap()],
});
