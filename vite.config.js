import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Base deve corresponder ao nome do repositório no GitHub
  base: '/ifc-viewer/',
  optimizeDeps: {
    exclude: ['web-ifc-three', 'web-ifc'],
  },
  // Os headers CORS são injetados pelo coi-serviceworker.js
  // diretamente no browser — não precisamos configurá-los aqui.
});
