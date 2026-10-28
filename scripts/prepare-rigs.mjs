import sharp from 'sharp';
const root='/Users/k2r59/.codex/generated_images/01a181cb-276e-7640-b8e6-296081630e8f/';
const names=['head','torso','upper-arm','forearm','thigh','shin','shoe','hand'];
for(const [key,file] of [['man','exec-87069246-a4fc-43c1-a427-2bd7a2c8a4d8.png'],['woman','exec-9f87e4c8-a27c-41d7-bc9f-750c56f1d44f.png']]){
 for(let i=0;i<8;i++){
  let left=i%4*384,width=384;if(key==='woman'&&i===0)width=455;if(key==='woman'&&i===1){left=458;width=360;}
  const cell=await sharp(root+file).extract({left,top:i<4?0:512,width,height:512}).toBuffer();
  await sharp(cell).trim({threshold:30}).resize({height:256}).webp({quality:92}).toFile(`public/art/rig-${key}-${names[i]}.webp`);
 }
}
