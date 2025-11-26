import { createRequire } from 'module';
const require = createRequire(import.meta.url);
try {
  const genai = require('@google/genai');
  console.log('CommonJS exports:', Object.keys(genai));
} catch (e) {
  console.error(e);
}
