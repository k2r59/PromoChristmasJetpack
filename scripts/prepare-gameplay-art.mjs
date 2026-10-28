import sharp from 'sharp';
const root='/Users/k2r59/.codex/generated_images/01a181cb-276e-7640-b8e6-296081630e8f/';
const source=root+'exec-88e90e50-9eba-49a8-8fd8-e3a0919ed985.png';
for(const [key,left,width]of [['printer',0,565],['trolley',568,440],['wrapper',1020,516]]){const b=await sharp(source).extract({left,top:0,width,height:1024}).toBuffer();await sharp(b).trim({threshold:15}).resize({height:500}).webp({quality:91}).toFile(`public/art/${key}-art.webp`);}
const vehicle=root+'exec-2cad96c1-bfb9-4fc4-a4b6-6c1e6319f154.png';
for(const [i,key]of ['hover','rocket'].entries()){const b=await sharp(vehicle).extract({left:0,top:i?475:0,width:1536,height:i?549:475}).toBuffer();await sharp(b).trim({threshold:15}).resize({width:700}).webp({quality:90}).toFile(`public/art/${key}.webp`);}
const staff=await sharp(root+'exec-2d46c22a-e8d5-438b-a5b5-7c2ac88a816d.png').resize(1536,1024).toBuffer(),parts=[];
for(let i=0;i<6;i++){const cell=await sharp(staff).extract({left:i%3*512,top:Math.floor(i/3)*512,width:512,height:512}).toBuffer();const trimmed=await sharp(cell).trim({threshold:30}).resize({height:460,width:470,fit:'inside'}).toBuffer();const m=await sharp(trimmed).metadata();parts.push({input:trimmed,left:i%3*512+Math.floor((512-m.width)/2),top:Math.floor(i/3)*512+480-m.height});}
await sharp({create:{width:1536,height:1024,channels:4,background:'#00000000'}}).composite(parts).webp({quality:90}).toFile('public/art/coworkers.webp');
