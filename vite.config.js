import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // ייבוא מודול path
import { fileURLToPath } from 'url'; // ייבוא פונקציה להמרת URL לנתיב קובץ

// פונקציות עזר להשגת __dirname בפורמט ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // הגדרת הכינוי '@' שיצביע לתיקיית 'src'
    },
  },
});