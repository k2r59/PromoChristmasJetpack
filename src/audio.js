const FILES=['jetpack','gift','electric','missile','explosion','bonus','shield','step'];
export class Sound {
  constructor(enabled=true){this.enabled=enabled;this.ctx=null;this.buffers=new Map();this.voices=new Set();this.engine=null;this.lastNote=-1;this.lastStep=-1;this.lastWarning=-1;}
  unlock(){
    if(!this.ctx){const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;this.ctx=new Ctx();this.master=this.ctx.createGain();this.master.gain.value=this.enabled?.65:0;this.master.connect(this.ctx.destination);this.ready=Promise.all(FILES.map(async name=>{try{const r=await fetch(`/audio/${name}.mp3`);if(!r.ok)return;this.buffers.set(name,await this.ctx.decodeAudioData(await r.arrayBuffer()));}catch{/* Keep synthesis fallback when offline assets are unavailable. */}}));}
    this.ctx.resume().catch(()=>{});
  }
  setEnabled(value){this.enabled=value;if(this.master)this.master.gain.setValueAtTime(value?.65:0,this.ctx.currentTime);if(!value)this.stopAll();}
  play(name,volume=.3,rate=1,loop=false){
    if(!this.enabled||!this.ctx||this.ctx.state!=='running'||!this.buffers.has(name))return null;
    const s=this.ctx.createBufferSource(),g=this.ctx.createGain();s.buffer=this.buffers.get(name);s.playbackRate.value=rate;s.loop=loop;g.gain.value=volume;s.connect(g);g.connect(this.master);s.start();const voice={source:s,gain:g};this.voices.add(voice);s.onended=()=>{this.voices.delete(voice);s.disconnect();g.disconnect();};return voice;
  }
  stopEngine(){if(this.engine){this.engine.source.stop();this.engine=null;}}
  stopAll(){for(const v of this.voices){try{v.source.stop();}catch{}}this.voices.clear();this.engine=null;}
  tone(frequency,duration=.12,type='sine',volume=.08,delay=0){
    if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;
    const t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.value=frequency;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+duration+.02);const v={source:o,gain:g};this.voices.add(v);o.onended=()=>{this.voices.delete(v);o.disconnect();g.disconnect();};
  }
  collect(n){if(!this.play('gift',.3,1+(n%5)*.055))this.tone([659,784,880,988,1175][n%5],.22);}
  bonus(){if(!this.play('bonus',.34))[523,659,784,1047].forEach((f,i)=>this.tone(f,.4,'sine',.07,i*.09));}
  fail(){this.tone(185,.3,'triangle',.08);this.tone(110,.6,'sine',.1,.12);}
  impact(electric=false){if(!this.play(electric?'electric':'explosion',electric?.35:.46))this.tone(electric?160:65,.32,'triangle',.14);}
  shield(){this.play('shield',.35);}
  missile(){this.play('missile',.32);}
  start(){this.stopAll();this.lastStep=-1;this.lastWarning=-1;this.tone(440,.2);this.tone(660,.3,'sine',.07,.1);}
  update({active,thrust,vehicle,grounded,warning,seconds}){
    if(!active||!this.enabled){if(this.engine){this.engine.source.stop();this.engine=null;}return;}
    if(thrust||vehicle){if(!this.engine)this.engine=this.play('jetpack',.13,vehicle? .8:1,true);if(this.engine)this.engine.gain.gain.setTargetAtTime(thrust?.17:.09,this.ctx.currentTime,.08);}
    else if(this.engine){this.engine.source.stop();this.engine=null;}
    const step=Math.floor(seconds*5);if(grounded&&step!==this.lastStep){this.lastStep=step;this.play('step',.12,step%2?.95:1.06);}
    const pulse=Math.floor(seconds*5);if(warning&&pulse!==this.lastWarning){this.lastWarning=pulse;this.tone(pulse%2?880:660,.06,'sine',.1);}
  }
  ambience(seconds){const beat=Math.floor(seconds*1.8);if(beat!==this.lastNote&&beat%3===0){this.lastNote=beat;const notes=[523,659,784,659,587,698,880,698,494,587,784,587,523,659,1047,784];this.tone(notes[Math.floor(beat/3)%notes.length],1.3,'sine',.018);}}
}
