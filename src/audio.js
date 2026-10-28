const FILES=['gift','electric','missile','explosion','bonus','shield','warning','fail'];
export class Sound {
  constructor(enabled=true){this.enabled=enabled;this.ctx=null;this.buffers=new Map();this.voices=new Set();this.engine=null;this.lastNote=-1;this.lastStep=-1;this.lastWarning=-1;this.cooldowns=new Map();}
  unlock(){
    if(!this.ctx){const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;this.ctx=new Ctx();this.master=this.ctx.createGain();this.master.gain.value=this.enabled?.65:0;this.master.connect(this.ctx.destination);this.ready=Promise.all(FILES.map(async name=>{try{const r=await fetch(`/audio/${name}.mp3`);if(!r.ok)return;this.buffers.set(name,await this.ctx.decodeAudioData(await r.arrayBuffer()));}catch{/* Keep synthesis fallback when offline assets are unavailable. */}}));}
    this.ctx.resume().catch(()=>{});
  }
  setEnabled(value){this.enabled=value;if(this.master)this.master.gain.setValueAtTime(value?.65:0,this.ctx.currentTime);if(!value)this.stopAll();}
  play(name,volume=.3,rate=1,loop=false){
    if(!this.enabled||!this.ctx||this.ctx.state!=='running'||!this.buffers.has(name))return null;
    const now=this.ctx.currentTime;if(!loop&&now-(this.cooldowns.get(name)??-100)<({gift:.09,bonus:.8,explosion:.15,warning:.5}[name]||0))return true;this.cooldowns.set(name,now);if(this.voices.size>=10)return loop?null:true;
    const s=this.ctx.createBufferSource(),g=this.ctx.createGain();s.buffer=this.buffers.get(name);s.playbackRate.value=rate;s.loop=loop;g.gain.setValueAtTime(loop?0:volume,this.ctx.currentTime);if(loop)g.gain.linearRampToValueAtTime(volume,this.ctx.currentTime+.08);s.connect(g);g.connect(this.master);s.start();const voice={source:s,gain:g};this.voices.add(voice);s.onended=()=>{this.voices.delete(voice);s.disconnect();g.disconnect();};return voice;
  }
  stopEngine(){if(this.engine){this.engine.source.stop();this.engine=null;}}
  stopAll(){for(const v of this.voices){try{v.source.stop();}catch{}}this.voices.clear();this.engine=null;this.giftVoice=null;}
  tone(frequency,duration=.12,type='sine',volume=.08,delay=0){
    if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;
    const t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.value=frequency;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+duration+.02);const v={source:o,gain:g};this.voices.add(v);o.onended=()=>{this.voices.delete(v);o.disconnect();g.disconnect();};
  }
  collect(n){const voice=this.play('gift',.24,1+(n%5)*.025);if(voice&&voice!==true){if(this.giftVoice&&this.voices.has(this.giftVoice)){this.giftVoice.gain.gain.setTargetAtTime(.0001,this.ctx.currentTime,.008);this.giftVoice.source.stop(this.ctx.currentTime+.025);}this.giftVoice=voice;}}
  bonus(){if(!this.play('bonus',.28))[523,659,784,1047].forEach((f,i)=>this.tone(f,.4,'sine',.07,i*.09));}
  fail(){if(!this.play('fail',.3))this.tone(185,.2,'sine',.04);}
  impact(electric=false){if(!this.play(electric?'electric':'explosion',electric?.25:.32))this.tone(electric?160:65,.32,'triangle',.14);}
  shield(){this.play('shield',.35);}
  missile(){this.play('missile',.32);}
  start(){this.stopAll();this.lastStep=-1;this.lastWarning=-1;this.cooldowns.clear();}
  update({active,thrust,vehicle,grounded,warning,seconds}){
    if(!active||!this.enabled){if(this.engine){this.engine.source.stop();this.engine=null;}return;}
    this.stopEngine();
    const pulse=Math.floor(seconds*2);if(warning&&pulse!==this.lastWarning){this.lastWarning=pulse;this.play('warning',.26);}
  }
}
