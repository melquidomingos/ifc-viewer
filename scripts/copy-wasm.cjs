// scripts/copy-wasm.cjs
// Cross-platform script to copy web-ifc.wasm to the public folder
const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../node_modules/web-ifc/web-ifc.wasm');
const dest = path.resolve(__dirname, '../public/web-ifc.wasm');

if (!fs.existsSync(src)) {
  console.warn('[copy-wasm] web-ifc.wasm not found at:', src);
  console.warn('[copy-wasm] Run "npm install" first.');
  process.exit(0);
}

fs.copyFileSync(src, dest);
console.log('[copy-wasm] web-ifc.wasm copiado para /public/');
