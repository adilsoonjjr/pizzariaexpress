import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'PizzaExpress',
        short_name: 'PizzaExpress',
        description: 'Delivery de pizza rápido e fácil',
        theme_color: '#e63020',
        background_color: '#fff1f0',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/pizza-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pizza-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
