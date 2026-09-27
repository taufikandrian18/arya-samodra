import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_BASE sets the public path, e.g. /arya-samodra/ on the VPS.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
});
