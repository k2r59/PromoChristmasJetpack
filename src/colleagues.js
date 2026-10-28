export const PARTS=['head','torso','upper-arm','forearm','thigh','shin','shoe','hand'];
export const WALK_SPEED=36;
export const COLLEAGUE_SCALE=.9;
const mix=(a,b,t)=>a+(b-a)*t;
export function jointBetween(a,b,length,bend=-1){
 const dx=b.x-a.x,dy=b.y-a.y,d=Math.min(length*2-.001,Math.hypot(dx,dy)),actual=Math.hypot(dx,dy)||1;
 const h=Math.sqrt(Math.max(0,length*length-d*d/4));
 return {x:(a.x+b.x)/2+bend*dy/actual*h,y:(a.y+b.y)/2-bend*dx/actual*h};
}
export function colleaguePose(phase,duck=0,wave=0,walking=1){
 const hip={x:duck*7,y:mix(mix(-51,-49,walking),-25,duck)+Math.sin(phase*Math.PI*4)*.65*walking*(1-duck)};
 const lean=duck*.5;const shoulder={x:hip.x-Math.sin(lean)*28,y:hip.y-Math.cos(lean)*28};
 const head={x:shoulder.x-2,y:shoulder.y-1};
 const legs=[0,.5].map((offset,i)=>{const p=(phase+offset)%1;const swing=p>.6;const x=swing?mix(8.64,-10.8,(p-.6)/.4):-10.8+32.4*p;const foot={x:mix(i?6:-6,x,walking)*(1-duck*.2),y:-5-(swing?Math.sin((p-.6)/.4*Math.PI)*5:0)*walking*(1-duck)};const knee=jointBetween(hip,foot,24,-1);return{hip,knee,foot};});
 const arms=[0,1].map(i=>{const swing=Math.sin(phase*Math.PI*2+i*Math.PI)*.32*walking;const raised=(i===1?wave:0)*(1-duck);const angle=mix(swing,1.15,duck)+raised*2.1;const elbow={x:shoulder.x-Math.sin(angle)*15,y:shoulder.y+Math.cos(angle)*15};const lower=mix(swing+.12,2.7,duck)-raised*3.0;const hand={x:elbow.x+Math.sin(lower)*17,y:elbow.y+Math.cos(lower)*17};return{shoulder,elbow,hand};});
 return{hip,shoulder,head,legs,arms,lean,wave:wave*(1-duck)};
}
export function createColleague(scene,key,x,floor){
 const root=scene.add.container(x,floor).setDepth(6).setScale(COLLEAGUE_SCALE);const make=(part,w,h)=>{const s=scene.add.image(0,0,`rig-${key}-${part}`).setDisplaySize(w,h);root.add(s);return s;};
 const limbs=()=>({thigh:make('thigh',11,27),shin:make('shin',9,27),shoe:make('shoe',19,10)});
 const arm=()=>({upper:make('upper-arm',9,18),lower:make('forearm',8,20)});
 const farLeg=limbs(),farArm=arm();for(const s of [...Object.values(farLeg),...Object.values(farArm)])s.setTint(0xb7c5d6);
 const nearLeg=limbs(),torso=make('torso',25,34).setOrigin(.5,1),head=make('head',29,32).setOrigin(.58,.88),nearArm=arm(),waveHand=make('hand',10,13).setOrigin(.5,.8).setAlpha(0);
 const segment=(s,a,b)=>s.setOrigin(.5,.08).setPosition(a.x,a.y).setRotation(Math.atan2(b.y-a.y,b.x-a.x)-Math.PI/2);
 const apply=pose=>{
  [farLeg,nearLeg].forEach((l,i)=>{const p=pose.legs[i];segment(l.thigh,p.hip,p.knee);segment(l.shin,p.knee,p.foot);l.shoe.setOrigin(.72,.5).setPosition(p.foot.x,p.foot.y);});
  torso.setPosition(pose.hip.x,pose.hip.y+2).setRotation(-pose.lean);head.setPosition(pose.head.x,pose.head.y).setRotation(-pose.lean*.35);
  [farArm,nearArm].forEach((a,i)=>{segment(a.upper,pose.arms[i].shoulder,pose.arms[i].elbow);segment(a.lower,pose.arms[i].elbow,pose.arms[i].hand);});
  waveHand.setPosition(pose.arms[1].hand.x,pose.arms[1].hand.y).setAlpha(pose.wave);
 };
 apply(colleaguePose(0));return{sprite:root,apply,greeted:false,phase:Math.random(),duck:0,wave:0,walking:1};
}
export function animateColleague(c,dt,danger,greeting){
 const a=1-Math.exp(-dt*12);c.duck=mix(c.duck,danger?1:0,a);c.wave=mix(c.wave,greeting?1:0,a);c.walking=mix(c.walking,danger||greeting?0:1,a);
 c.phase=(c.phase+dt/.9*c.walking)%1;c.apply(colleaguePose(c.phase,c.duck,c.wave,c.walking));return WALK_SPEED*COLLEAGUE_SCALE*c.walking;
}
