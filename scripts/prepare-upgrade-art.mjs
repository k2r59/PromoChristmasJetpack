import sharp from 'sharp';
import {readFileSync,writeFileSync} from 'node:fs';
const root='/Users/k2r59/.codex/generated_images/01a181cb-276e-7640-b8e6-296081630e8f/';
const atlas=root+'exec-82aa89c6-3b4f-4007-a4a7-f99ee1b2702a.png';
for(const [i,key]of ['printer','zapper','missile','drone','cable','coffee'].entries()){
  await sharp(await sharp(atlas).extract(key==='zapper'?{left:640,top:0,width:260,height:505}:key==='cable'?{left:630,top:512,width:300,height:512}:{left:(i%3)*512,top:Math.floor(i/3)*512,width:512,height:512}).toBuffer()).trim({threshold:15}).resize({width:440,height:480,fit:'inside'}).webp({quality:90}).toFile(`public/art/${key}-art.webp`);
}
await sharp(root+'exec-d5f0af36-603d-4a73-98bc-acf29f60679c.png').resize(1536,768,{fit:'fill'}).webp({quality:88}).toFile('public/art/explosion.webp');
await sharp(root+'exec-e0c7ed88-e707-4fd2-a997-c7d7ae2cf574.png').trim({threshold:15}).resize({width:1200}).webp({quality:90}).toFile('public/art/reception.webp');
console.log('8 alpha assets prepared');
