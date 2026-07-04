import { defineConfig } from 'vite';

// base './' so the built site works from any subpath or plain file server
export default defineConfig({
  base: './',
  build: { target: 'es2022' },
});
