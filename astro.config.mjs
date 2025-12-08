// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || 'https://blek.space',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react(), mdx(), sitemap()],

  image: {
    layout: 'full-width'
  },

  adapter: netlify()
});