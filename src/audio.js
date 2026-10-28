export class Sound {
  constructor(enabled = false) { this.enabled = enabled; this.ctx = null; this.lastNote = 0; }
  unlock() {
    if (!this.ctx) { const Ctx = window.AudioContext || window.webkitAudioContext; if (Ctx) this.ctx = new Ctx(); }
    this.ctx?.resume().catch(() => {});
  }
  tone(frequency, duration = .12, type = 'sine', volume = .08, delay = 0) {
    if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.value = frequency;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(volume,t+.008); g.gain.exponentialRampToValueAtTime(.0001,t+duration);
    o.connect(g);g.connect(this.ctx.destination);o.start(t);o.stop(t+duration+.02);
  }
  collect(n) { this.tone([659,784,880,988,1175][n%5],.22,'sine',.08); }
  bonus() { [523,659,784,1047].forEach((f,i)=>this.tone(f,.5,'sine',.07,i*.09)); }
  fail() { this.tone(185,.3,'triangle',.08);this.tone(110,.6,'sine',.1,.12); }
  impact(electric=false) {
    if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;
    const t=this.ctx.currentTime,duration=electric?.22:.48;
    const buffer=this.ctx.createBuffer(1,Math.ceil(this.ctx.sampleRate*duration),this.ctx.sampleRate),data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,2);
    const source=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter(),gain=this.ctx.createGain();source.buffer=buffer;
    filter.type=electric?'highpass':'lowpass';filter.frequency.setValueAtTime(electric?1500:1200,t);filter.frequency.exponentialRampToValueAtTime(electric?500:100,t+duration);gain.gain.value=.16;
    source.connect(filter);filter.connect(gain);gain.connect(this.ctx.destination);source.start(t);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
    if(!electric)this.tone(65,.32,'sine',.14);
  }
  start() { this.tone(440,.2);this.tone(660,.3,'sine',.07,.1); }
  ambience(seconds) {
    const beat = Math.floor(seconds * 1.8);
    if (beat !== this.lastNote && beat % 3 === 0) {
      this.lastNote = beat;
      const notes = [523,659,784,659,587,698,880,698,494,587,784,587,523,659,1047,784];
      this.tone(notes[Math.floor(beat/3)%notes.length],1.3,'sine',.018);
    }
  }
}
