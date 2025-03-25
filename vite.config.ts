import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true, // Set to 'true' to listen on the local IP
    port: 5173, // Optional: Specify a custom port (default is 5173)
  },
  plugins: [react()],
})
