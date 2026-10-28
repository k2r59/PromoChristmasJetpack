// Promodev tuning, not unpublished Halfbrick generation constants.
export function randomAt(seed,index){let n=(seed+Math.imul(index+1,0x9e3779b9))|0;n=Math.imul(n^(n>>>16),0x21f0aaad);n=Math.imul(n^(n>>>15),0x735a2d97);return((n^(n>>>15))>>>0)/4294967296;}
export function coursePattern(index,seed){
  const random=randomAt(seed,index),tier=Math.min(3,Math.floor(index/9));
  if(index>0&&index%7===6)return{type:'rest',safeY:350,gap:920,angle:0};
  let type;if(index%3===0)type=['printer','trolley','wrapper'][Math.floor(index/3)%3];
  else {const pool=tier===0?['cable','drone','zapper']:['cable','zapper','zapper','drone',...(tier>=2?['laser']:[])];type=pool[Math.floor(random*pool.length)];}
  const upper=randomAt(seed,index+200)>.5,centerY=upper?265:455;
  return{type,centerY,angle:type==='zapper'?[0,45,90,-45][Math.floor(randomAt(seed,index+400)*4)]:0,rotating:type==='zapper'&&tier>=2&&randomAt(seed,index+800)>.65,safeY:['printer','trolley','wrapper'].includes(type)?320:type==='cable'?480:type==='drone'?250:upper?525:175,gap:Math.max(680,850-tier*45)+randomAt(seed,index+600)*100};
}
export function beamEnds(x,y,angle,half=90){const a=angle*Math.PI/180;return{x1:x+Math.sin(a)*half,y1:y-Math.cos(a)*half,x2:x-Math.sin(a)*half,y2:y+Math.cos(a)*half};}
export function touchesBeam(player,beam,width=12){const dx=beam.x2-beam.x1,dy=beam.y2-beam.y1;const f=Math.max(0,Math.min(1,((player.x-beam.x1)*dx+(player.y-beam.y1)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(player.x-beam.x1-f*dx,player.y-beam.y1-f*dy)<player.radius+width/2;}
