import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins:[react()],
  // GitHub Pages may expose this branch at either the repository subpath
  // or a project root. A relative base keeps the built asset URLs valid in both cases.
  base:'./',
  build:{target:'es2022'}
});
