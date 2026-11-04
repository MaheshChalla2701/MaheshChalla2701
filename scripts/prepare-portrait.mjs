import { createRequire } from 'node:module';
import fs from 'node:fs';
const require=createRequire(process.env.BUNDLED_NODE_MODULES+'/package.json');
const sharp=require('sharp');
await sharp('site/assets/img/mahesh-portrait.png').resize({width:850,withoutEnlargement:true}).webp({quality:85}).toFile('site/assets/img/mahesh-portrait.webp');
let html=fs.readFileSync('site/index.html','utf8').replaceAll('mahesh-portrait.png','mahesh-portrait.webp');
fs.writeFileSync('site/index.html',html);
console.log('Prepared the portfolio portrait. Run render-readme-hero.mjs against the local preview to refresh the README banner.');
