// Effects share the scene clock: pausing also freezes arcs, smoke and impacts.
export class GameEffects {
  constructor(scene) {
    this.scene=scene;this.time=0;this.bits=[];this.blasts=[];
    this.graphics=scene.add.graphics().setDepth(9);
  }
  clear(){this.bits.forEach(p=>p.sprite.destroy());this.blasts.forEach(p=>p.sprite.destroy());this.bits=[];this.blasts=[];this.ring=null;this.graphics.clear();}
  particle(x,y,key,vx,vy,life,size,tint,growth=0){
    if(this.bits.length>180)return;
    const sprite=this.scene.add.image(x,y,key).setDepth(key==='smoke-fx'?8:10).setDisplaySize(size,size).setTint(tint);
    this.bits.push({sprite,vx,vy,life,max:life,size,growth,rotation:(Math.random()-.5)*3});
  }
  impact(x,y,electric=false){
    const s=this.scene;
    if(!electric){
      const sprite=s.add.image(x,y,'explosion',0).setDisplaySize(210,210).setDepth(11);
      this.blasts.push({sprite,age:0,duration:.72});
      for(let i=0;i<8;i++)this.particle(x+(Math.random()-.5)*35,y,'smoke-fx',(Math.random()-.5)*90,-30-Math.random()*75,.7+Math.random()*.6,28,0x8b9cad,65);
    }
    const count=s.reduced?8:22;
    for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,v=90+Math.random()*230;this.particle(x,y,'spark',Math.cos(a)*v,Math.sin(a)*v,.25+Math.random()*.45,8+Math.random()*10,electric?0x8ceaff:0xffbb57,-7);}
    this.ring={x,y,age:0,electric};
  }
  arc(x1,y1,x2,y2,seed){
    const g=this.graphics,points=[],phase=this.scene.reduced?0:Math.floor(this.time*12),length=Math.hypot(x2-x1,y2-y1);
    const noise=n=>{const v=Math.sin(n*127.1+phase*31.7+seed*53.3)*43758.5453;return (v-Math.floor(v))*2-1;};
    for(let i=0;i<=14;i++){const f=i/14,j=i===0||i===14?0:noise(i)*Math.min(12,length*.15);points.push({x:x1+(x2-x1)*f+j,y:y1+(y2-y1)*f+noise(i+30)*2});}
    points[0]={x:x1,y:y1};points[14]={x:x2,y:y2};
    for(const [width,color,alpha]of [[11,0x329be8,.09],[4,0x70d6ff,.35],[1.35,0xecfcff,.95]]){g.lineStyle(width,color,alpha);g.beginPath();points.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.strokePath();}
    for(const i of [4,9]){const p=points[i],side=noise(i+50)>0?1:-1;g.lineStyle(.8,0xa8e9ff,.55);g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+side*12,p.y+5);g.lineTo(p.x+side*9,p.y+12);g.lineTo(p.x+side*20,p.y+18);g.strokePath();}
    g.fillStyle(0xe5faff,.9);g.fillCircle(x1,y1,2.5);g.fillCircle(x2,y2,2.5);
  }

  update(dt,obstacles,active){
    if(!active)return;
    this.time+=dt;this.graphics.clear();
    for(const o of obstacles){if(o.hit||o.sprite.x<-100||o.sprite.x>this.scene.W+120)continue;const x=o.sprite.x,y=o.sprite.y;
      if(['printer','trolley','wrapper'].includes(o.type)){const pulse=this.scene.reduced?.8:.7+Math.sin(this.time*4)*.2;this.graphics.fillStyle(0xffc35a,pulse);this.graphics.fillRect(x-62,y-8,124,3);}
      if(o.type==='zapper')this.arc(x,y-30,x,y+30,1);
      if(o.type==='cable')this.arc(x-16,240,x+17,306,5);
      if(o.type==='drone'){
        const span=17+Math.sin(this.time*65)*9;this.graphics.lineStyle(3,0xd3e9ef,.6);for(const dx of[-43,43])this.graphics.lineBetween(x+dx-span,y-24,x+dx+span,y-24);
        this.graphics.fillStyle(0xffb64f,.35+.25*Math.sin(this.time*4));this.graphics.fillCircle(x,y,8);
      }
      if(o.type==='missile'){
        const len=28+Math.sin(this.time*45)*9;const g=this.graphics;
        g.fillStyle(0xff762a,.8);g.fillTriangle(x+49,y-10,x+49,y+10,x+49+len,y);
        g.fillStyle(0xffedac,1);g.fillTriangle(x+48,y-5,x+48,y+5,x+62+len*.4,y);
        o.emission=(o.emission||0)+dt;if(o.emission>(this.scene.reduced?.15:.045)){o.emission=0;this.particle(x+65,y,'smoke-fx',85+Math.random()*40,(Math.random()-.5)*20,.45,12,0x94a3b5,35);this.particle(x+62,y,'spark',110,(Math.random()-.5)*35,.25,9,0xffb147,-9);}
      }
    }
    if(this.ring){const r=this.ring;r.age+=dt;const f=r.age/.32;if(f<1){this.graphics.lineStyle(3,r.electric?0xa4efff:0xffd584,(1-f)*.65);this.graphics.strokeCircle(r.x,r.y,12+f*80);}else this.ring=null;}
    for(let i=this.blasts.length-1;i>=0;i--){const b=this.blasts[i];b.age+=dt;if(b.age>=b.duration){b.sprite.destroy();this.blasts.splice(i,1);}else{b.sprite.setFrame(Math.min(7,Math.floor(b.age/b.duration*8)));b.sprite.setAlpha(Math.min(1,(b.duration-b.age)*5));}}
    for(let i=this.bits.length-1;i>=0;i--){const p=this.bits[i];p.life-=dt;if(p.life<=0){p.sprite.destroy();this.bits.splice(i,1);continue;}p.sprite.x+=p.vx*dt;p.sprite.y+=p.vy*dt;p.sprite.rotation+=p.rotation*dt;p.size=Math.max(1,p.size+p.growth*dt);p.sprite.setDisplaySize(p.size,p.size).setAlpha(p.life/p.max*.85);}
  }
}
