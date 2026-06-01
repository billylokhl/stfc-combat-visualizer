import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/stfc-combat-visualizer/',
  plugins: [react()],
  publicDir: path.resolve(__dirname, '../../assets'),
  resolve: {
    alias: {
      '@stfc-vi/ship-model': path.resolve(__dirname, '../../packages/ship-model/src'),
      '@stfc-vi/combat-model': path.resolve(__dirname, '../../packages/combat-model/src'),
      '@stfc-vi/visualization-model': path.resolve(__dirname, '../../packages/visualization-model/src'),
    },
  },
  server: {
    port: 3000,
  },
});
