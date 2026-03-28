const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../node_modules/web-ifc');
const destDir = path.resolve(__dirname, '../public');

const files = ['web-ifc.wasm', 'web-ifc-mt.wasm'];

for (const file of files) {
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`[copy-wasm] ${file} copiado para /public/`);
  } else {
    console.warn(`[copy-wasm] ${file} não encontrado — ignorando.`);
  }
}
