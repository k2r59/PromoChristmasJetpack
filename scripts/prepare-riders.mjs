import sharp from 'sharp';
const source='/Users/k2r59/.codex/generated_images/01a181cb-276e-7640-b8e6-296081630e8f/exec-da6f4b7a-7dd4-4644-b8d3-712aa62038bd.png';
for(const [key,left,width] of [['sled',0,575],['hover',579,446],['rocket',1050,486]]){const b=await sharp(source).extract({left,top:0,width,height:1024}).toBuffer();await sharp(b).trim({threshold:25}).resize({width:600}).webp({quality:91}).toFile(`public/art/rider-${key}.webp`);}
