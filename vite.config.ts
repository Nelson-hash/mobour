import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['three']
  },
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  build: {
    target: 'es2015',
    minify: 'esbuild', // Use esbuild instead of terser for faster builds
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three']
        }
      }
    },
    commonjsOptions: {
      include: [/three/, /node_modules/]
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000
  },
  server: {
    hmr: {
      overlay: false
    }
  }
});
