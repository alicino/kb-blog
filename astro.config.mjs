import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

const isDevelopmentServer = process.argv.includes('dev');

export default defineConfig({
  site: 'https://kb.alicino.me',
  output: 'static',
  integrations: [react(), ...(isDevelopmentServer ? [keystatic()] : [])],
  server: {
    port: 5321,
  },
});
