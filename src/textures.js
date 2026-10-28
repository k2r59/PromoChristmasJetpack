export function createTextures(scene) {
  const make = (key,w,h,draw) => { const t=scene.textures.createCanvas(key,w,h); const c=t.context;draw(c,w,h);t.refresh(); };
  const round=(c,x,y,w,h,r,fill,stroke)=>{c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}};
  make('office-frame',540,720,(c)=>{
    const beam=c.createLinearGradient(0,0,28,0);beam.addColorStop(0,'#102140');beam.addColorStop(.5,'#40516e');beam.addColorStop(1,'#142749');
    c.fillStyle='rgba(100,166,240,.045)';c.fillRect(25,70,510,560);
    c.fillStyle=beam;c.fillRect(0,0,27,640);c.fillRect(0,0,540,42);c.fillStyle='#52617a';c.fillRect(27,40,513,3);
    c.fillStyle='#162c4c';c.fillRect(0,398,540,8);c.fillStyle='#355073';c.fillRect(27,398,513,2);
    c.strokeStyle='rgba(198,230,255,.07)';c.lineWidth=35;c.beginPath();c.moveTo(220,90);c.lineTo(80,390);c.moveTo(270,90);c.lineTo(130,390);c.stroke();
    c.strokeStyle='#0c1c35';c.lineWidth=3;c.beginPath();c.moveTo(270,41);c.lineTo(270,111);c.stroke();
    c.shadowColor='#ffc56c';c.shadowBlur=25;round(c,177,110,186,15,4,'#142343','#08172e');round(c,185,119,170,5,2,'#ffdb8d');c.shadowBlur=0;

  });
  make('spark',32,32,(c)=>{const g=c.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'#fffbe5');g.addColorStop(.2,'#ffda8f');g.addColorStop(1,'#f5a83b00');c.fillStyle=g;c.fillRect(0,0,32,32);});
  make('snow',10,10,c=>{c.fillStyle='#dae7ef';c.beginPath();c.arc(5,5,3,0,7);c.fill();});
  make('gift',90,100,(c)=>{
    c.shadowColor='#f4bd5a';c.shadowBlur=12;
    const g=c.createLinearGradient(20,25,75,90);g.addColorStop(0,'#f8b74b');g.addColorStop(1,'#ac5426');
    round(c,15,33,60,53,4,g,'#723a24');c.shadowBlur=0;round(c,12,27,66,15,3,'#ffd27c','#854528');
    c.fillStyle='#b23839';c.fillRect(40,28,12,59);c.fillStyle='#e2634e';c.fillRect(42,28,3,59);
    c.lineWidth=5;c.strokeStyle='#db5741';c.beginPath();c.moveTo(46,28);c.bezierCurveTo(9,24,26,0,46,27);c.bezierCurveTo(75,-2,82,29,46,28);c.stroke();
    c.save();c.translate(58,58);c.rotate(.15);round(c,-6,-6,15,19,2,'#f5e4b8');c.fillStyle='#254c43';c.font='bold 12px sans-serif';c.fillText('P',-3,8);c.restore();
    c.strokeStyle='#ffdd90';c.lineWidth=1;c.beginPath();c.moveTo(18,47);c.lineTo(18,80);c.lineTo(37,80);c.stroke();
  });
  make('printer',190,240,(c)=>{
    c.shadowColor='#0009';c.shadowBlur=12;round(c,22,222,160,12,3,'#06141d');c.shadowBlur=0;
    round(c,57,78,113,145,6,'#162b36','#0a171f');
    let g=c.createLinearGradient(60,0,170,0);g.addColorStop(0,'#829394');g.addColorStop(.4,'#5a7178');g.addColorStop(1,'#2e4655');
    round(c,60,81,107,132,3,g,'#101d28');round(c,63,124,67,39,2,'#536a72','#263e4b');round(c,63,167,67,40,2,'#536a72','#263e4b');
    round(c,83,128,25,5,2,'#223c49');round(c,83,171,25,5,2,'#223c49');
    round(c,135,98,25,20,2,'#132d35');round(c,138,102,18,9,1,'#81cbb3');c.fillStyle='#e5bb73';c.fillRect(143,127,5,5);
    round(c,50,65,120,23,3,'#9fa8a0','#1b3038');round(c,59,35,100,30,3,'#293f4b','#162934');
    c.fillStyle='#bdc6ba';c.beginPath();c.moveTo(57,37);c.lineTo(70,19);c.lineTo(163,27);c.lineTo(158,43);c.closePath();c.fill();
    c.strokeStyle='#e2ce9d';c.lineWidth=3;c.beginPath();c.moveTo(69,20);c.lineTo(162,27);c.stroke();
    for(let i=0;i<15;i++){round(c,14+(i%3)*2,212-i*4,41,3,1,i%2?'#dbcbad':'#f2e1bc');}
    round(c,5,224,180,9,1,'#172b34');c.fillStyle='#d2a850';for(let i=8;i<179;i+=23){c.beginPath();c.moveTo(i,224);c.lineTo(i+10,224);c.lineTo(i+17,233);c.lineTo(i+7,233);c.fill();}
  });
  make('cable',160,320,(c)=>{
    c.strokeStyle='#0c1b23';c.lineWidth=10;c.beginPath();c.moveTo(46,0);c.bezierCurveTo(25,80,105,120,57,215);c.stroke();c.lineWidth=4;c.strokeStyle='#495d59';c.beginPath();c.moveTo(47,0);c.bezierCurveTo(28,80,107,120,59,215);c.stroke();
    c.strokeStyle='#162e27';c.lineWidth=17;c.beginPath();c.moveTo(10,0);c.bezierCurveTo(135,50,5,160,100,232);c.stroke();
    for(let i=0;i<13;i++){let y=i*17,x=60+Math.sin(i*.55)*23; c.strokeStyle='#41624c';c.lineWidth=3;c.beginPath();c.moveTo(x,y);c.lineTo(x-17,y+8);c.moveTo(x,y);c.lineTo(x+14,y+11);c.stroke();}
    [65,115,170,217].forEach((y,i)=>{let x=60+Math.sin(y/30)*22;c.shadowBlur=16;c.shadowColor=i%2?'#ffb75c':'#79d7df';c.fillStyle=c.shadowColor;c.beginPath();c.arc(x,y,5,0,7);c.fill();});c.shadowBlur=0;
    c.shadowBlur=14;c.shadowColor='#9febff';c.strokeStyle='#a6f1ff';c.lineWidth=3;c.beginPath();c.moveTo(58,221);c.lineTo(80,245);c.lineTo(64,251);c.lineTo(97,279);c.lineTo(84,285);c.lineTo(108,310);c.stroke();c.shadowBlur=0;
    round(c,32,0,66,12,2,'#7a6948');
  });
  make('drone',150,100,(c)=>{
    c.strokeStyle='#7b8d91';c.lineWidth=4;c.beginPath();c.moveTo(18,31);c.lineTo(132,31);c.stroke();
    c.fillStyle='#a9b9b9';c.fillRect(3,24,44,3);c.fillRect(103,24,44,3);round(c,40,30,70,30,15,'#b88f59','#3a3532');round(c,57,38,37,15,6,'#263f45');
    c.shadowColor='#ff674e';c.shadowBlur=15;c.fillStyle='#ff8062';c.beginPath();c.arc(76,46,6,0,7);c.fill();c.shadowBlur=0;
    c.strokeStyle='#a98c63';c.lineWidth=3;c.beginPath();c.moveTo(54,59);c.lineTo(50,76);c.lineTo(62,76);c.moveTo(96,59);c.lineTo(100,76);c.lineTo(88,76);c.stroke();
  });
  make('floor',256,100,(c)=>{let g=c.createLinearGradient(0,0,0,100);g.addColorStop(0,'#243c40');g.addColorStop(.14,'#122934');g.addColorStop(1,'#071822');c.fillStyle=g;c.fillRect(0,0,256,100);c.fillStyle='#c49a63';c.fillRect(0,0,256,2);c.fillStyle='#7b69504d';c.fillRect(0,3,256,4);c.strokeStyle='#030f18';c.lineWidth=2;[0,128,255].forEach(x=>{c.beginPath();c.moveTo(x,0);c.lineTo(x,100);c.stroke();});c.strokeStyle='#65747344';c.beginPath();c.moveTo(0,13);c.lineTo(256,13);c.stroke();[8,120,136,248].forEach(x=>{c.fillStyle='#5b6b64';c.beginPath();c.arc(x,20,2,0,7);c.fill();});});
  for(const letter of new Set('PROMODEV'))make(`letter-${letter}`,84,84,c=>{c.shadowColor='#ffd469';c.shadowBlur=12;round(c,9,9,66,66,16,'#f4b638','#fff0ad');c.shadowBlur=0;round(c,14,13,56,55,12,'#ffe298');c.font='bold 48px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#193656';c.fillText(letter,42,43);});
  for(const [key,color,label] of [['heart','#ed536c','♥'],['magnet','#3fa9d5','∩'],['shield','#4298df','◆'],['vehicle-token','#e7aa39','★']])make(key,90,90,c=>{c.shadowColor=color;c.shadowBlur=15;round(c,11,11,68,68,22,color,'#fff1be');c.shadowBlur=0;c.font='bold 51px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff4d7';c.fillText(label,45,47);});
  make('zapper',70,220,c=>{c.shadowColor='#8de9ff';c.shadowBlur=16;c.strokeStyle='#b9f7ff';c.lineWidth=5;c.beginPath();c.moveTo(35,25);for(let y=40;y<195;y+=17)c.lineTo(35+(y%2?12:-12),y);c.lineTo(35,195);c.stroke();c.shadowBlur=0;round(c,11,7,48,26,9,'#da9e40','#ffe7a1');round(c,11,187,48,26,9,'#da9e40','#ffe7a1');});
  make('missile',120,55,c=>{c.fillStyle='#ffb84d';c.beginPath();c.moveTo(94,19);c.lineTo(119,27);c.lineTo(94,36);c.fill();round(c,22,15,76,26,12,'#eb5a4c','#ffe5a4');c.fillStyle='#f8dfb2';c.beginPath();c.moveTo(4,28);c.lineTo(30,12);c.lineTo(30,43);c.fill();c.fillStyle='#153751';c.fillRect(65,18,9,20);});

  make('smoke-fx',64,64,c=>{const g=c.createRadialGradient(32,32,3,32,32,31);g.addColorStop(0,'#c5d1deaa');g.addColorStop(.5,'#7a889b66');g.addColorStop(1,'#53637700');c.fillStyle=g;c.fillRect(0,0,64,64);});

  make('neon-light',540,720,c=>{
    const cone=c.createLinearGradient(0,121,0,560);cone.addColorStop(0,'#ffda9228');cone.addColorStop(.5,'#ffd8950a');cone.addColorStop(1,'#ffd89500');c.fillStyle=cone;c.beginPath();c.moveTo(188,124);c.lineTo(353,124);c.lineTo(500,570);c.lineTo(40,570);c.closePath();c.fill();
    const glow=c.createRadialGradient(270,123,3,270,123,125);glow.addColorStop(0,'#ffedac66');glow.addColorStop(.35,'#ffd98a22');glow.addColorStop(1,'#ffd98a00');c.fillStyle=glow;c.fillRect(130,0,280,260);
    c.shadowColor='#ffcc73';c.shadowBlur=18;round(c,185,119,170,5,2,'#fff2bf');c.shadowBlur=5;round(c,188,120,164,2,1,'#fffcef');c.shadowBlur=0;
  });

  make('interior-floor',540,110,c=>{
    const g=c.createLinearGradient(0,0,0,110);g.addColorStop(0,'#243c4b');g.addColorStop(.12,'#52606a');g.addColorStop(.55,'#697174');g.addColorStop(1,'#8b8173');c.fillStyle=g;c.fillRect(0,0,540,110);
    c.fillStyle='#142b3d';c.fillRect(0,0,540,9);c.fillStyle='#a2a09a';c.fillRect(0,9,540,2);
    for(const y of [25,47,76,108]){c.fillStyle='#25343e66';c.fillRect(0,y,540,1);c.fillStyle='#d5c1a326';c.fillRect(0,y+1,540,1);}
    for(let i=0;i<5;i++){const x=i*135;c.strokeStyle='#25343e55';c.beginPath();c.moveTo(x,11);c.lineTo(x-45,110);c.stroke();}
    for(let i=0;i<85;i++){const y=14+(i*37)%95,x=(i*83)%540;c.fillStyle=i%2?'#eddbba08':'#1026380b';c.fillRect(x,y,35+(i%7)*8,1);}
  });
  make('contact-shadow',256,48,c=>{const g=c.createRadialGradient(128,24,5,128,24,128);g.addColorStop(0,'#081523aa');g.addColorStop(.65,'#08152355');g.addColorStop(1,'#08152300');c.save();c.translate(0,20);c.scale(1,.18);c.fillStyle=g;c.fillRect(0,-108,256,256);c.restore();});



  make('shield-bubble',256,256,c=>{
    const g=c.createRadialGradient(112,100,28,128,128,118);g.addColorStop(0,'#b7f5ff02');g.addColorStop(.65,'#71ceec08');g.addColorStop(.86,'#94e6fb18');g.addColorStop(.96,'#c1f5ff77');g.addColorStop(1,'#c9f9ff00');c.fillStyle=g;c.beginPath();c.arc(128,128,120,0,Math.PI*2);c.fill();
    c.lineWidth=2;c.strokeStyle='#b0edff88';c.beginPath();c.arc(128,128,113,0,Math.PI*2);c.stroke();
    c.lineCap='round';c.shadowColor='#c1f5ff';c.shadowBlur=8;c.strokeStyle='#efffffbb';c.lineWidth=5;c.beginPath();c.ellipse(118,120,93,100,-.25,3.6,4.5);c.stroke();c.lineWidth=2;c.strokeStyle='#ffe9f288';c.beginPath();c.arc(128,128,110,.3,1.3);c.stroke();c.shadowBlur=0;
    c.save();c.translate(82,65);c.rotate(-.55);const r=c.createRadialGradient(0,0,0,0,0,28);r.addColorStop(0,'#ffffff66');r.addColorStop(1,'#ffffff00');c.scale(1,.35);c.fillStyle=r;c.fillRect(-30,-30,60,60);c.restore();
  });

}
