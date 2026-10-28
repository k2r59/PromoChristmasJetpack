import Phaser from 'phaser';
import '@fontsource/lilita-one/latin-400.css';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/nunito/latin-800.css';
import './style.css';
import { createTextures } from './textures.js';
import { integrateFlight, speedAt, scoreFor, patternAt, intersects, FLOOR } from './rules.js';
import { Sound } from './audio.js';
import { GameEffects } from './effects.js';
import {VEHICLES,vehicleAt,vehicleState,hitVehicle} from './vehicles.js';
import {BRAND,MAX_LIVES,ITEMS,initialProgress,normalizeProgress,previewMissions,applyRun,starsNeeded,takeHit} from '../shared/progression.js';

const $ = id => document.getElementById(id);
const read = (key,fallback) => {try{return JSON.parse(localStorage.getItem(key)) ?? fallback;}catch{return fallback;}};
const save = (key,value) => {try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
const icons = {
 sound:'<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15 8c2 2 2 6 0 8m3-11c4 4 4 10 0 14"/>',
 mute:'<path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6m0-6-5 6"/>',
 full:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
 pause:'<path d="M8 5v14M16 5v14"/>',
};
const icon = key => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[key]}</svg>`;
let best = read('noel-best',0), profile = read('noel-profile',null), installPrompt = null, lastFocus = null;
let progress=normalizeProgress(profile?.progress);
const sound = new Sound(read('noel-sound',false));
let scene, game, toastTimer, mode = 'menu';
$('best').textContent = best.toLocaleString('fr-FR');
$('fullscreen').innerHTML=icon('full');$('pause').innerHTML=icon('pause');
function updateSound(){ $('sound').innerHTML=icon(sound.enabled?'sound':'mute');$('sound').setAttribute('aria-label',sound.enabled?'Couper le son':'Activer le son');$('sound').setAttribute('aria-pressed',String(sound.enabled)); }
updateSound();
function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3200);}
function modal(html){lastFocus=document.activeElement;$('modal').innerHTML=html;$('modal-backdrop').classList.remove('hidden');requestAnimationFrame(()=>($('modal').querySelector('input,button')||$('modal')).focus());}
function closeModal(){ $('modal-backdrop').classList.add('hidden');lastFocus?.focus?.(); }
const closeButton = '<button class="close-modal" aria-label="Fermer">×</button>';
function bindClose(fn=closeModal){$('modal').querySelector('.close-modal')?.addEventListener('click',fn);}
function setMode(value){mode=value;document.body.classList.toggle('playing',value!=='menu');$('menu').classList.toggle('hidden',value!=='menu');$('hud').classList.toggle('hidden',value==='menu');$('pause').classList.toggle('hidden',value==='menu'||value==='over');}
function start(){closeModal();sound.unlock();sound.start();scene.startRun();setMode('playing');$('flight-hint').classList.remove('hidden');}
function home(){closeModal();scene.resetMenu();setMode('menu');$('flight-hint').classList.add('hidden');}
function pause(){if(mode!=='playing')return;scene.held=false;setMode('paused');modal(`<div class="eyebrow">ON REPREND SON SOUFFLE</div><h2>Une petite pause.</h2><p>Les cadeaux peuvent attendre une minute.</p><button id="resume" class="primary"><span class="play-triangle"></span> Reprendre le vol</button><button id="return-home" class="text-button">Retour à l’accueil</button>`);$('resume').onclick=()=>{closeModal();setMode('playing');};$('return-home').onclick=home;}
function how(){modal(`${closeButton}<div class="eyebrow">LE BRIEF DU LUTIN</div><h2>Un doigt. Toute la magie.</h2><div class="instructions"><div class="instruction"><span class="instruction-number">01</span><div><strong>Maintenez pour prendre de la hauteur.</strong><p>Le doigt, la souris ou la barre espace activent le jetpack.</p></div></div><div class="instruction"><span class="instruction-number">02</span><div><strong>Relâchez pour redescendre.</strong><p>Évitez les photocopieurs, câbles et petits drones.</p></div></div><div class="instruction"><span class="instruction-number">03</span><div><strong>Suivez les cadeaux.</strong><p>5 cadeaux de suite : +200 points et les guirlandes s’illuminent.</p></div></div></div><button id="understood" class="primary">À moi de jouer <span>↗</span></button>`);bindClose();$('understood').onclick=()=>{closeModal();requestPlay();};}
function requestPlay(){if(profile){start();return;}showSignup();}
function showSignup(){modal(`${closeButton}<div class="eyebrow">PROMODEV PRÉSENTE</div><h2>Votre nuit commence ici.</h2><p>Une adresse e-mail, un profil unique.<br>Retrouvez votre meilleur score à chaque visite.</p><form id="signup-form" novalidate><label for="email">Votre adresse e-mail</label><input id="email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="vous@exemple.fr" required maxlength="254"/><p class="form-note">Sans mot de passe ni code de vérification.</p><p id="form-error" role="alert"></p><button class="primary" id="signup-submit" type="submit">Entrer dans la magie <span>↗</span></button></form><p class="privacy-note">Utilisée uniquement pour votre profil de jeu.<br>Aucun e-mail publicitaire. Adresse non vérifiée.</p>`);bindClose();$('signup-form').onsubmit=async e=>{e.preventDefault();const input=$('email');if(!input.validity.valid){$('form-error').textContent='Indiquez une adresse e-mail valide.';input.focus();return;}const button=$('signup-submit');button.disabled=true;button.textContent='Préparation de votre profil…';try{const response=await fetch('/api/profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:input.value.trim()})});const data=await response.json();if(!response.ok)throw new Error(data.error||'Le profil n’a pas pu être créé.');profile=data.profile;save('noel-profile',profile);best=profile.best||0;save('noel-best',best);$('best').textContent=best.toLocaleString('fr-FR');updateProfile();start();}catch(err){$('form-error').textContent=err.message==='Failed to fetch'?'Connexion indisponible. Réessayez quand le réseau revient.':err.message;button.disabled=false;button.innerHTML='Entrer dans la magie <span>↗</span>';}};}
function updateProfile(){ $('account').textContent=profile?'Mon profil':'S’inscrire'; }
function showAccount(){if(!profile)return showSignup();modal(`${closeButton}<div class="eyebrow">VOTRE PROFIL PROMODEV</div><h2>Prêt pour la prochaine ?</h2><p id="account-email"></p><div class="result-score">${best.toLocaleString('fr-FR')}<small>PTS</small></div><p>Votre meilleur score</p><button id="account-play" class="primary">Reprendre la livraison ↗</button><button id="logout" class="text-button">Changer de compte</button>`);$('account-email').textContent=profile.email;bindClose();$('account-play').onclick=start;$('logout').onclick=async()=>{await fetch('/api/logout',{method:'POST'}).catch(()=>{});profile=null;save('noel-profile',null);best=0;save('noel-best',0);$('best').textContent='0';updateProfile();closeModal();};}
function finish(){if(mode!=='playing')return;scene.held=false;setMode('over');sound.fail();$('flight-hint').classList.add('hidden');const points=scene.score;const newBest=points>best;if(newBest){best=points;save('noel-best',best);$('best').textContent=best.toLocaleString('fr-FR');}if(profile)fetch('/api/score',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({score:points,distance:Math.floor(scene.distance),gifts:scene.collected})}).then(r=>{if(!r.ok)toast('Score gardé sur cet appareil. Synchronisation indisponible.');}).catch(()=>toast('Score sauvegardé sur cet appareil, hors connexion.'));setTimeout(()=>{if(mode!=='over')return;modal(`<div class="eyebrow">UNE AVENTURE PROMODEV</div><h2>${newBest?'Votre plus belle livraison.':'Une belle nuit de travail.'}</h2><div class="result-score">${points.toLocaleString('fr-FR')}<small>PTS</small></div>${newBest?'<div class="new-best">✦ NOUVEAU RECORD ✦</div>':''}<div class="result-stats"><div>${Math.floor(scene.distance)}<span>MÈTRES PARCOURUS</span></div><div>${scene.collected}<span>CADEAUX RÉCUPÉRÉS</span></div></div><p>Il reste un peu de magie dans le réservoir.</p><button id="retry" class="primary"><span class="play-triangle"></span> Encore une livraison</button><button id="return-home" class="text-button">Retour à l’accueil</button>`);$('retry').onclick=start;$('return-home').onclick=home;},550);}

class FlightScene extends Phaser.Scene {
  constructor(){super('flight');}
  preload(){
    for(const key of ['city','furniture','lounge','wrapping','sled'])this.load.image(key,`/art/${key}.webp`);
    this.load.image('elf','/art/elf-arcade.webp');
    for(const key of ['hover','rocket'])this.load.image(key,`/art/${key}.webp`);
    this.load.spritesheet('coworkers','/art/coworkers.webp',{frameWidth:512,frameHeight:512});
    this.load.image('reception','/art/reception.webp');
    this.load.image('garland','/art/garland.webp');
    this.load.image('gift-art','/art/gift-0.webp');
    for(const key of ['printer','trolley','wrapper','zapper','missile','drone','cable'])this.load.image(`${key}-art`,`/art/${key}-art.webp`);
    this.load.spritesheet('explosion','/art/explosion.webp',{frameWidth:384,frameHeight:384});
    this.load.spritesheet('elf-run','/art/elf-run.webp',{frameWidth:512,frameHeight:512});
    this.load.on('progress',p=>$('load-progress').style.width=`${p*100}%`);
    this.load.on('loaderror',()=>toast('Une illustration n’a pas pu se charger. Rechargez la page.'));
  }
  create(){
    scene=this;this.W=this.scale.width;this.held=false;this.elapsed=0;this.distance=0;this.score=0;this.obstacles=[];this.gifts=[];this.pickups=[];this.particles=[];this.scroll=0;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    createTextures(this);this.parallax=[];
    const layer=(key,width,height,y,speed,depth,mirror=false)=>{const items=[];for(let i=0;i<Math.ceil(Math.max(this.W,3200)/width)+3;i++)items.push(this.add.image(i*width,y,key).setOrigin(0,0).setDisplaySize(width,height).setDepth(depth).setFlipX(mirror&&i%2===1));this.parallax.push({items,width,speed,offset:0});};
    layer('city',1350,900,-230,.08,0,true);layer('office-frame',540,720,0,.28,2);
    layer('neon-light',540,720,0,.28,2);this.neons=this.parallax.at(-1);
    layer('garland',540,110,28,.28,3);this.garlands=this.parallax.at(-1);this.lightClock=0;
    layer('interior-floor',540,110,FLOOR-110,.55,2.5);
    this.decor=[];this.decorIndex=0;let x=-180;while(x<this.W+1600)x=this.addDecor(x);
    this.lights=this.add.graphics().setDepth(4);this.lightBonus=0;
    this.tint=this.add.rectangle(0,0,this.W,720,0x071b31,.36).setOrigin(0).setDepth(4);
    this.snow=[];for(let i=0;i<40;i++){const s=this.add.image(Math.random()*this.W,Math.random()*630,'snow').setScale(.2+Math.random()*.45).setAlpha(.12+Math.random()*.3).setDepth(1);s.speed=8+Math.random()*20;this.snow.push(s);}
    this.floor=this.add.tileSprite(0,FLOOR,this.W,100,'floor').setOrigin(0).setDepth(5);
    this.glow=this.add.image(0,0,'spark').setTint(0xffb959).setAlpha(.2).setDisplaySize(430,430).setDepth(6);
    this.elf=this.add.image(0,0,'elf').setDepth(8);
    this.runner=this.add.sprite(0,FLOOR,'elf-run').setOrigin(.5,.94).setDisplaySize(105,105).setDepth(8).setVisible(false);
    this.anims.create({key:'run',frames:this.anims.generateFrameNumbers('elf-run',{start:0,end:5}),frameRate:12,repeat:-1});
    this.sled=this.add.image(0,0,'sled').setDisplaySize(165,88).setDepth(8).setVisible(false);
    this.effects=new GameEffects(this);
    this.bubble=this.add.image(0,0,'shield-bubble').setDepth(9).setVisible(false);this.shieldBurst=0;this.colleagues=[];this.vehicleIndex=0;
    this.aura=this.add.graphics().setDepth(9);this.warning=this.add.text(0,0,'!',{fontFamily:'Lilita One',fontSize:'38px',color:'#fff4b7',backgroundColor:'#cc3b46',padding:{x:14,y:4}}).setOrigin(.5).setDepth(10).setVisible(false);
    this.heroGifts=[];for(let i=0;i<3;i++)this.heroGifts.push(this.makeGift(0,0,i,80-i*9).setAngle(10+i*5).setDepth(7));
    this.input.on('pointerdown',pointer=>{if(mode==='playing'&&!pointer.event?.target?.closest?.('button'))this.held=true;});
    for(const name of ['pointerup','pointerupoutside'])this.input.on(name,()=>this.held=false);
    window.addEventListener('pointerup',()=>this.held=false);window.addEventListener('pointercancel',()=>this.held=false);window.addEventListener('blur',()=>{this.held=false;pause();});
    this.resetMenu();$('loading').style.opacity='0';setTimeout(()=>$('loading').classList.add('hidden'),400);
  }
  addDecor(x){
    const sequence=['reception','lounge','wrapping','lounge','reception','wrapping'];const key=sequence[this.decorIndex++%sequence.length];
    const h=key==='reception'?240:key==='lounge'?205:205;const source=this.textures.get(key).getSourceImage();const w=h*source.width/source.height;
    const baseline=FLOOR-14;
    const shadow=this.add.image(x+w*.5,baseline-2,'contact-shadow').setDisplaySize(w*.94,28).setDepth(2.8);
    const sprite=this.add.image(x,baseline,key).setOrigin(0,1).setDisplaySize(w,h).setDepth(3).setTint(0xaab8c9);sprite.contactShadow=shadow;this.decor.push(sprite);
    return x+w+170+(this.decorIndex%3)*95;
  }
  resetMenu(){this.clearRun();this.held=false;this.elf.setVisible(true).setDisplaySize(350,350*this.elf.height/this.elf.width).setAlpha(1).setAngle(-7);this.runner.setVisible(false);this.sled.setVisible(false);this.bubble.setVisible(false);this.aura.clear();this.warning.setVisible(false);this.heroGifts.forEach(g=>g.setVisible(true));this.glow.setAlpha(.23).setDisplaySize(430,430);}
  clearRun(){this.effects?.clear();this.colleagues?.forEach(c=>c.sprite.destroy());this.colleagues=[];this.shieldBurst=0;for(const list of [this.obstacles,this.gifts,this.pickups])list.forEach(o=>o.sprite.destroy());this.particles.forEach(p=>p.s.destroy());this.obstacles=[];this.gifts=[];this.pickups=[];this.particles=[];}
  startRun(){
    this.clearRun();this.elapsed=0;this.distance=0;this.collected=0;this.chain=0;this.bonuses=0;this.extraScore=0;this.score=0;this.worldDistance=0;this.patternIndex=0;this.vy=0;this.held=false;this.lives=MAX_LIVES;this.invulnerable=1;this.shield=progress.owned.includes('shield-start')?8:0;this.magnet=0;this.vehicle=false;this.ride=null;this.nextColleague=3;this.letterSlots=Array(8).fill(false);this.letterCursor=0;this.letterReset=0;this.nextMissile=14;this.missileWarning=0;this.grounded=false;this.runId=crypto.randomUUID();this.finished=false;this.missionAnnounced=new Set();this.runProgress=structuredClone(progress);
    this.stats={distance:0,gifts:0,games:1,letters:0,obstacles:0,ground:0,air:0,hearts:0,magnetGifts:0,vehicleDistance:0,sets:0,nearMisses:0,shieldHits:0};
    this.elf.setVisible(true).setPosition(Math.min(310,this.W*.24),340).setDisplaySize(112,112*this.elf.height/this.elf.width).setAngle(0).setAlpha(1);this.runner.setVisible(false);this.sled.setVisible(false);this.heroGifts.forEach(g=>g.setVisible(false));this.glow.setDisplaySize(150,150);this.makePattern(this.W+120);this.updateHud();
  }
  updateHud(){
    $('score').textContent=String(this.score).padStart(5,'0');$('distance').textContent=`${Math.floor(this.distance)} m`;$('gifts').textContent=`${this.collected} cadeau${this.collected>1?'x':''}`;
    $('combo-dots').innerHTML=Array.from({length:5},(_,i)=>`<b class="${i<this.chain?'active':''}"></b>`).join('');
    $('lives').innerHTML=Array.from({length:3},(_,i)=>`<svg class="${i<this.lives?'':'empty'}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21C8 17 2 13 2 7a5 5 0 0 1 10-2 5 5 0 0 1 10 2c0 6-6 10-10 14Z"/></svg>`).join('');$('lives').setAttribute('aria-label',`${this.lives} vies sur 3`);
    $('letters').innerHTML=[...BRAND].map((l,i)=>`<b class="${this.letterSlots[i]?'found':''}">${l}</b>`).join('');
    const effects=[];if(this.vehicle)effects.push(`${VEHICLES[this.ride.type].name.toUpperCase()} · ${this.ride.type==='sled'?this.ride.hits+' CHOCS':Math.ceil(this.ride.remaining)+'s'}`);if(this.magnet>0)effects.push(`AIMANT ${Math.ceil(this.magnet)}s`);if(this.shield>0)effects.push(`BOUCLIER ${Math.ceil(this.shield)}s`);$('powerups').textContent=effects.join(' · ');
    for(const m of previewMissions(this.runProgress,this.stats))if(m.current>=m.goal&&!this.missionAnnounced.has(m.id)){this.missionAnnounced.add(m.id);toast(`Mission accomplie ! ${'★'.repeat(m.stars)}`);sound.bonus();}
  }
  makeGift(x,y,variant,size){
    return this.add.image(x,y,'gift-art').setDisplaySize(size,size);
  }

  pickup(type,x,y,index){const texture=type==='letter'?`letter-${BRAND[index]}`:type;const sprite=this.add.image(x,y,texture).setScale(type==='letter'?.67:.65).setDepth(7);this.pickups.push({type,sprite,baseY:y,index});}
  makePattern(x){
    const index=this.patternIndex++,pattern=patternAt(index),type=pattern.type;let sprite,box;
    if(['printer','trolley','wrapper'].includes(type)){const sizes={printer:[170,205],trolley:[145,215],wrapper:[195,165]};const [w,h]=sizes[type];sprite=this.add.image(x,FLOOR,`${type}-art`).setOrigin(.5,1).setDisplaySize(w,h);box={w:w*.72,h:h*.86,ox:-w*.36,oy:-h*.86};}
    else if(type==='cable'){sprite=this.add.image(x,0,'cable-art').setOrigin(.5,0).setDisplaySize(120,260);box={w:50,h:306,ox:-23,oy:0};}
    else if(type==='zapper'){sprite=this.add.image(x,345,'zapper-art').setDisplaySize(85,220);box={w:30,h:178,ox:-15,oy:-89};}
    else{sprite=this.add.image(x,430,'drone-art').setDisplaySize(130,90);box={w:78,h:42,ox:-39,oy:-21};}
    sprite.setDepth(7);this.obstacles.push({sprite,type,box,baseY:sprite.y,passed:false,hit:false});
    const shape=index%4;const giftCount=shape===3?8:6;
    for(let i=0;i<giftCount;i++){let y=pattern.safeY;if(shape===0)y+=Math.sin(i/5*Math.PI)*-60;else if(shape===1)y+=(i%3-1)*24;else if(shape===2)y+=(i-2)*13;
      const s=this.makeGift(x-270+i*65,y,(index+i)%4,53).setDepth(6).setAngle(-6+i%3*6);this.gifts.push({sprite:s,baseY:y,phase:i*.7});}
    if(index%3===1&&!this.letterSlots.every(Boolean)){const slot=this.letterCursor++%8;this.pickup('letter',x-110,pattern.safeY-45,slot);}
    if(index%6===4)this.pickup('heart',x-80,pattern.safeY+30);
    if(index%10===7)this.pickup('vehicle-token',x-100,pattern.safeY-45);
    else if(index%8===5)this.pickup(['magnet','shield'][Math.floor(index/8)%2],x-100,pattern.safeY-45);
    this.spawnDistance=pattern.gap;
  }
  damage(obstacle){
    if(obstacle.hit)return;const result=takeHit({lives:this.lives,invulnerable:this.invulnerable,shield:this.shield,vehicle:this.vehicle});if(!result.damage)return;
    if(this.vehicle){this.ride=hitVehicle(this.ride);result.vehicle=Boolean(this.ride);}if(this.shield>0&&result.shield===0)this.shieldBurst=.4;
    this.lives=result.lives;this.invulnerable=result.invulnerable;this.shield=result.shield;this.vehicle=result.vehicle;obstacle.hit=true;obstacle.sprite.setAlpha(.35);this.chain=0;
    if(result.absorbed){this.stats.shieldHits++;toast('Choc absorbé !');}else{sound.fail();toast(this.lives?`${this.lives} vie${this.lives>1?'s':''} restante${this.lives>1?'s':''}`:'Fin de la livraison');}
    const electric=['cable','zapper'].includes(obstacle.type);this.effects.impact(this.elf.x+14,this.elf.y,electric);sound.impact(electric);if(obstacle.type==='missile'||obstacle.type==='drone')obstacle.sprite.setVisible(false);if(!this.reduced)this.cameras.main.shake(140,.003);if(this.lives===0){this.score=scoreFor(this.distance,this.collected,this.bonuses)+this.extraScore;finish();}
  }
  collectPickup(p){
    if(p.type==='heart'){this.stats.hearts++;if(this.lives<3){this.lives++;toast('+1 vie !');}else{this.extraScore+=100;toast('Vies au maximum · +100 pts');}sound.bonus();}
    if(p.type==='magnet'){this.magnet=progress.owned.includes('magnet-upgrade')?12:8;toast('Aimant à cadeaux !');sound.bonus();}
    if(p.type==='shield'){this.shield=10;toast('Bouclier · 10 secondes');sound.bonus();}
    if(p.type==='vehicle-token'){this.activateVehicle();}
    if(p.type==='letter'&&!this.letterSlots[p.index]){this.letterSlots[p.index]=true;this.stats.letters++;this.extraScore+=100;sound.collect(p.index);toast(`${BRAND[p.index]} récupéré !`);if(this.letterSlots.every(Boolean)){this.stats.sets++;this.extraScore+=1500;this.letterReset=5;this.lightBonus=4;this.activateVehicle();toast('PROMODEV complet · +1 500 pts · Véhicule !');}}
    this.burst(p.sprite.x,p.sprite.y,15,0xffe092);
  }
  activateVehicle(){const type=vehicleAt(this.vehicleIndex++);this.ride=vehicleState(type);this.vehicle=true;this.invulnerable=1.5;const spec=VEHICLES[type];this.sled.setTexture(spec.texture).setDisplaySize(spec.width,spec.height);sound.bonus();toast(`${spec.name} · ${type==='sled'?'2 chocs absorbés':type==='hover'?'aimant pendant 20 s':'cadeaux ×2 pendant 20 s'}`);}
  updateColleagues(dt,t,move){
    if(this.elapsed>=this.nextColleague){this.nextColleague=this.elapsed+5+Math.random()*4;const row=Math.random()<.5?0:3;const sprite=this.add.sprite(this.W+80,FLOOR,'coworkers',row).setOrigin(.5,.94).setDisplaySize(72,72).setDepth(6);this.colleagues.push({sprite,row,greeted:false,phase:Math.random()*5});}
    for(let i=this.colleagues.length-1;i>=0;i--){const c=this.colleagues[i],s=c.sprite;s.x-=(move+20)*dt;const dx=s.x-this.elf.x;const danger=this.obstacles.some(o=>!o.hit&&Math.abs(o.sprite.x-s.x)<140&&['missile','printer','trolley','wrapper'].includes(o.type));
      const greeting=Math.abs(dx)<140&&!danger;s.setFrame(c.row+(greeting?2:Math.floor(t*7+c.phase)%2));s.setDisplaySize(72,72);s.y=FLOOR-(greeting||danger||this.reduced?0:Math.abs(Math.sin(t*7+c.phase))*2);
      if(!c.greeted&&Math.abs(dx)<32&&this.grounded&&!danger){c.greeted=true;this.extraScore+=100;this.stats.highFives=(this.stats.highFives||0)+1;this.burst(s.x,FLOOR-60,5,0xffe6a2);sound.collect(1);toast('High-five ! +100 pts');}
      if(s.x<-90){s.destroy();this.colleagues.splice(i,1);}
    }
  }
  burst(x,y,count=14,color=0xffcc71){for(let i=0;i<count;i++){const s=this.add.image(x,y,'spark').setTint(color).setDepth(9).setScale(.25+Math.random()*.65);this.particles.push({s,vx:(Math.random()-.5)*240,vy:(Math.random()-.5)*240,life:.5+Math.random()*.4,max:1});}}
  exhaust(big=false){if(Math.random()>.8&&!big)return;const scale=big?2:1;const color=ITEMS.find(i=>i.id===progress.equipped)?.color||0xffc064;const s=this.add.image(this.elf.x-(big?113:this.vehicle?75:34),this.elf.y+(big?26:10),'spark').setTint(Math.random()>.25?color:0xfff1b6).setScale((.6+Math.random()*.4)*scale).setDepth(7);this.particles.push({s,vx:-180-Math.random()*120,vy:60+Math.random()*35,life:.35,max:.35});}
  update(time,delta){
    if(!this.elf)return;const dt=Math.min(delta/1000,.033),t=time/1000,active=mode==='playing',menu=mode==='menu';const move=active?speedAt(this.elapsed)*(this.vehicle?VEHICLES[this.ride.type].speed:1):menu&&!this.reduced?25:0;this.scroll+=move*dt;
    for(const layer of this.parallax){layer.offset=(layer.offset+move*dt*layer.speed)%(layer.width*2);layer.items.forEach((item,i)=>item.x=i*layer.width-layer.offset);}
    if(active||menu)this.lightClock+=dt;
    this.neons.items.forEach((lamp,i)=>{const wave=this.reduced?1:.9+Math.sin(this.lightClock*1.2+i*2.7)*.07;lamp.setAlpha(wave);});
    this.garlands.items.forEach((garland,i)=>garland.setAlpha(this.reduced?1:.96+Math.sin(this.lightClock*.8+i)*.04));
    this.decor.forEach(d=>{d.x-=move*dt*.55;d.contactShadow.x=d.x+d.displayWidth*.5;});for(let i=this.decor.length-1;i>=0;i--)if(this.decor[i].x+this.decor[i].displayWidth<-50){this.decor[i].contactShadow.destroy();this.decor[i].destroy();this.decor.splice(i,1);}let end=this.decor.length?Math.max(...this.decor.map(d=>d.x+d.displayWidth)):0;while(end<this.W+800)end=this.addDecor(end+180+(this.decorIndex%3)*80);
    this.lights.clear();if(this.lightBonus>0){if(active)this.lightBonus-=dt;this.lights.fillStyle(0xffd772,Math.min(1,this.lightBonus)*.65);for(let x=18;x<this.W;x+=54)this.lights.fillCircle(x,62+Math.sin((x+this.scroll*.28)/90)*8,4);}
    this.snow.forEach(s=>{if(active||(menu&&!this.reduced)){s.x-=dt*s.speed;s.y+=dt*s.speed*.25;if(s.x<-10)s.x=this.W+10;if(s.y>630)s.y=0;}});
    if(menu){const bob=this.reduced?0:Math.sin(t*1.6)*14;this.elf.setPosition(this.W*.73,310+bob).setAngle(-8+(this.reduced?0:Math.sin(t*1.4)*3));this.glow.setPosition(this.elf.x-70,this.elf.y+20);this.heroGifts.forEach((s,i)=>s.setPosition(this.W*.83+i*54,410+i*28+Math.sin(t*2+i)*7));if(!this.reduced)this.exhaust(true);}
    if(active){
      this.elapsed+=dt;this.worldDistance+=move*dt;this.distance=this.worldDistance/12;this.stats.distance=this.distance;this.floor.tilePositionX+=move*dt;
      if(this.vehicle&&this.ride.type!=='sled'){this.ride.remaining=Math.max(0,this.ride.remaining-dt);if(this.ride.remaining===0){this.vehicle=false;this.ride=null;this.invulnerable=Math.max(this.invulnerable,.7);toast('Retour au jetpack !');}}
      this.invulnerable=Math.max(0,this.invulnerable-dt);this.shield=Math.max(0,this.shield-dt);this.magnet=Math.max(0,this.magnet-dt);if(this.vehicle&&VEHICLES[this.ride.type].magnet)this.magnet=Math.max(this.magnet,.2);
      if(this.letterReset>0){this.letterReset-=dt;if(this.letterReset<=0){this.letterSlots.fill(false);this.letterCursor=0;}}
      const flight=integrateFlight(this.elf.y,this.vy,this.held,dt);this.elf.y=flight.y;this.vy=flight.velocity;const onGround=this.elf.y>=FLOOR-28-.5&&!this.held&&!this.vehicle;
      if(onGround&&!this.grounded)this.burst(this.elf.x,FLOOR,6,0xb4c7d6);this.grounded=onGround;
      this.stats[onGround?'ground':'air']+=move*dt/12;if(this.vehicle)this.stats.vehicleDistance+=move*dt/12;
      this.elf.setVisible(!onGround);this.runner.setVisible(onGround).setPosition(this.elf.x+10,FLOOR).setAlpha(this.invulnerable>0&&!this.reduced?.5+Math.sin(t*28)*.3:1);
      if(onGround){this.runner.play('run',true);this.runner.anims.resume();this.runner.anims.timeScale=move/250;}else this.runner.anims.pause();
      this.elf.setDisplaySize(this.vehicle?88:112,(this.vehicle?88:112)*this.elf.height/this.elf.width).setAlpha(this.invulnerable>0&&!this.reduced?.55+Math.sin(t*28)*.3:1);
      this.elf.angle=Phaser.Math.Linear(this.elf.angle,this.held?-13:Math.min(20,this.vy*.045),.12);this.sled.setVisible(this.vehicle).setPosition(this.elf.x,this.elf.y+28).setAngle(this.elf.angle*.4);
      this.glow.setPosition(this.elf.x-30,this.elf.y+5).setDisplaySize(150,150).setAlpha(this.held?.2:.03);if(this.held||this.vehicle)this.exhaust();
      this.aura.clear();this.shieldBurst=Math.max(0,this.shieldBurst-dt);const bubbleOn=this.shield>0||this.shieldBurst>0;const swell=this.shieldBurst>0?1+(.4-this.shieldBurst)*.7:1;this.bubble.setVisible(bubbleOn).setPosition(this.elf.x+8,this.elf.y).setDisplaySize((144+Math.sin(t*2)*2)*swell,(150-Math.sin(t*2)*2)*swell).setAlpha(this.shieldBurst>0?this.shieldBurst/.4:this.shield<2?.5+this.shield*.22:.92);if(this.magnet>0){this.aura.lineStyle(2,0xffd964,.25);this.aura.strokeCircle(this.elf.x+8,this.elf.y,100+(Math.sin(t*4)+1)*12);}
      if(this.elapsed>7)$('flight-hint').classList.add('hidden');this.spawnDistance-=move*dt;if(this.spawnDistance<=0)this.makePattern(this.W+130);
      if(this.elapsed>=this.nextMissile&&this.missileWarning<=0){this.missileWarning=1.7;this.missileY=Phaser.Math.Clamp(this.elf.y,150,560);this.nextMissile=this.elapsed+14+Math.random()*5;}
      if(this.missileWarning>0){this.missileWarning-=dt;if(this.missileWarning>1)this.missileY=Phaser.Math.Clamp(this.elf.y,150,560);this.warning.setVisible(true).setPosition(this.W-52,this.missileY).setAlpha(Math.sin(t*18)>.1?1:.5);if(this.missileWarning<=0){this.warning.setVisible(false);const s=this.add.image(this.W+65,this.missileY,'missile-art').setDisplaySize(120,55).setDepth(7);this.obstacles.push({sprite:s,type:'missile',box:{w:85,h:30,ox:-42,oy:-15},baseY:s.y,passed:false,hit:false});}}
      for(let i=this.obstacles.length-1;i>=0;i--){const o=this.obstacles[i];o.sprite.x-=move*dt*(o.type==='missile'?2.15:1);if(o.type==='drone')o.sprite.y=o.baseY+Math.sin(t*1.7)*32;const box={x:o.sprite.x+o.box.ox,y:o.sprite.y+o.box.oy,w:o.box.w,h:o.box.h};
        if(intersects({x:this.elf.x+14,y:this.elf.y+3,radius:this.vehicle?30:21},box))this.damage(o);
        if(!o.passed&&o.sprite.x+o.box.w/2<this.elf.x-24){o.passed=true;if(!o.hit){this.stats.obstacles++;const near=intersects({x:this.elf.x+14,y:this.elf.y+3,radius:65},box);if(near)this.stats.nearMisses++;}}
        if(o.sprite.x<-200){o.sprite.destroy();this.obstacles.splice(i,1);}if(mode!=='playing')break;
      }
      if(mode==='playing'){
        for(let i=this.gifts.length-1;i>=0;i--){const g=this.gifts[i];g.sprite.x-=move*dt;if(!g.attracted)g.sprite.y=g.baseY+Math.sin(t*2+g.phase)*5;const d=Phaser.Math.Distance.Between(this.elf.x+14,this.elf.y,g.sprite.x,g.sprite.y);if(this.magnet>0&&d<210){g.attracted=true;g.sprite.x=Phaser.Math.Linear(g.sprite.x,this.elf.x+14,dt*8);g.sprite.y=Phaser.Math.Linear(g.sprite.y,this.elf.y,dt*8);}
          if(d<43){this.collected++;if(this.vehicle&&VEHICLES[this.ride.type].giftMultiplier===2)this.extraScore+=50;this.stats.gifts=this.collected;if(g.attracted)this.stats.magnetGifts++;this.chain++;sound.collect(this.chain-1);this.burst(g.sprite.x,g.sprite.y,7);g.sprite.destroy();this.gifts.splice(i,1);if(this.chain===5){this.chain=0;this.bonuses++;this.lightBonus=2.4;sound.bonus();}}else if(g.sprite.x<-40){this.chain=0;g.sprite.destroy();this.gifts.splice(i,1);}}
        for(let i=this.pickups.length-1;i>=0;i--){const p=this.pickups[i];p.sprite.x-=move*dt;p.sprite.y=p.baseY+Math.sin(t*2.5)*8;if(Phaser.Math.Distance.Between(this.elf.x+14,this.elf.y,p.sprite.x,p.sprite.y)<50){this.collectPickup(p);p.sprite.destroy();this.pickups.splice(i,1);}else if(p.sprite.x<-60){p.sprite.destroy();this.pickups.splice(i,1);}}
      }
      this.updateColleagues(dt,t,move);
      this.score=scoreFor(this.distance,this.collected,this.bonuses)+this.extraScore;if(!this.lastHud||time-this.lastHud>100){this.updateHud();this.lastHud=time;}sound.ambience(this.elapsed);
    }else if(mode!=='menu')this.runner.anims.pause();
    this.effects.update(dt,mode==='playing'?this.obstacles:[],mode==='playing'||mode==='over');
    if(mode!=='paused')for(let i=this.particles.length-1;i>=0;i--){const p=this.particles[i];p.life-=dt;p.s.x+=p.vx*dt;p.s.y+=p.vy*dt;p.s.alpha=Math.max(0,p.life/p.max);if(p.life<=0){p.s.destroy();this.particles.splice(i,1);}}
  }
}
const width=()=>Math.max(960,Math.round(window.innerWidth/window.innerHeight*720));
game=new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:width(),height:720,backgroundColor:'#091d25',transparent:false,render:{antialias:true,powerPreference:'high-performance'},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:FlightScene,fps:{target:60,forceSetTimeOut:false},audio:{noAudio:true}});
window.addEventListener('resize',()=>{if(!scene)return;const w=width();game.scale.setGameSize(w,720);scene.W=w;scene.tint.width=w;scene.floor.width=w;if(mode==='playing')pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
document.addEventListener('keydown',e=>{if(e.code==='Tab'&&!$('modal-backdrop').classList.contains('hidden')){const items=[...$('modal').querySelectorAll('button:not(:disabled),input')];const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}if(e.target instanceof HTMLInputElement)return;if(e.code==='Space'&&mode==='playing'){e.preventDefault();scene.held=true;}else if((e.code==='Escape'||e.code==='KeyP')&&mode==='playing'){e.preventDefault();pause();}else if(e.code==='Escape'&&mode==='paused'){closeModal();setMode('playing');}else if(e.code==='Escape'&&mode==='menu')closeModal();});document.addEventListener('keyup',e=>{if(e.code==='Space'&&scene)scene.held=false;});
$('play').onclick=requestPlay;$('how').onclick=how;$('pause').onclick=pause;$('brand').onclick=()=>{if(mode==='playing')pause();else if(mode==='menu')return;else home();};
$('sound').onclick=()=>{sound.unlock();sound.enabled=!sound.enabled;save('noel-sound',sound.enabled);updateSound();if(sound.enabled)sound.tone(660,.2);};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else toast('Installez le jeu pour profiter du plein écran.');}catch{toast('Le plein écran n’est pas disponible dans ce navigateur.');}};
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
window.addEventListener('appinstalled',()=>{$('install-nudge').classList.add('hidden');$('install').classList.add('hidden');toast('Noël Shift est installé. À vous de jouer !');});
$('install').onclick=async()=>{if(installPrompt){await installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;return;}const ios=/iPad|iPhone|iPod/.test(navigator.userAgent);modal(`${closeButton}<div class="eyebrow">LA MAGIE À PORTÉE DE MAIN</div><h2>Installez Noël Shift.</h2><p>Un accès direct, le plein écran et vos parties même hors connexion après un premier chargement.</p><div class="install-guide">${ios?'Dans Safari, touchez <strong>Partager</strong>, puis <strong>Sur l’écran d’accueil</strong>.':'Ouvrez le menu de votre navigateur, puis choisissez <strong>Installer l’application</strong> ou <strong>Ajouter à l’écran d’accueil</strong> si cette option est disponible.'}</div><button id="install-ok" class="primary">Compris</button>`);bindClose();$('install-ok').onclick=closeModal;};
if(matchMedia('(display-mode: standalone)').matches||navigator.standalone)$('install').classList.add('hidden');
else if(!read('noel-install-dismissed',false))setTimeout(()=>{$('install-nudge').classList.remove('hidden');},4500);
$('install-now').onclick=()=>$('install').click();$('dismiss-install').onclick=()=>{$('install-nudge').classList.add('hidden');save('noel-install-dismissed',true);};
if('serviceWorker'in navigator&&import.meta.env.PROD)window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
$('account').onclick=showAccount;updateProfile();
fetch('/api/me').then(r=>r.ok?r.json():null).then(data=>{if(data&&!data.profile){profile=null;save('noel-profile',null);updateProfile();}if(data?.profile){profile=data.profile;best=Math.max(best,profile.best||0);save('noel-profile',profile);save('noel-best',best);$('best').textContent=best.toLocaleString('fr-FR');updateProfile();}}).catch(()=>{});
