export const BRAND='PROMODEV';
export const MAX_LIVES=3;
export const ITEMS=[
 {id:'classic',name:'Étincelles de Noël',description:'Le jetpack original, tout simplement.',price:0,kind:'trail',color:0xffc064},
 {id:'frost',name:'Poussière de givre',description:'Une traînée bleu glacier.',price:80,kind:'trail',color:0x8eeaff},
 {id:'holly',name:'Magie du sapin',description:'Des étincelles vert émeraude.',price:120,kind:'trail',color:0x6affac},
 {id:'candy',name:'Sucre d’orge',description:'Un sillage rose et gourmand.',price:160,kind:'trail',color:0xff8ed4},
 {id:'magnet-upgrade',name:'Aimant longue durée',description:'Les aimants durent 12 s au lieu de 8 s.',price:220,kind:'upgrade'},
 {id:'shield-start',name:'Départ protégé',description:'Un bouclier pendant les 8 premières secondes de chaque partie.',price:350,kind:'upgrade'},
];
const templates=[
 ['gifts',30,'Récupérer {n} cadeaux','total',1],['distance',400,'Parcourir {n} m en un vol','run',1],['games',3,'Terminer {n} parties','total',1],
 ['letters',3,'Ramasser {n} lettres PROMODEV','total',1],['obstacles',8,'Éviter {n} obstacles en un vol','run',2],['ground',150,'Parcourir {n} m au sol','total',2],
 ['gifts',45,'Récupérer {n} cadeaux en un vol','run',2],['distance',1800,'Parcourir {n} m au total','total',2],['hearts',2,'Ramasser {n} cœurs','total',2],
 ['magnetGifts',20,'Attirer {n} cadeaux avec l’aimant','total',2],['vehicleDistance',250,'Parcourir {n} m en traîneau','total',2],['sets',1,'Compléter PROMODEV {n} fois','total',3],
 ['distance',1000,'Atteindre {n} m en un vol','run',3],['gifts',150,'Livrer {n} cadeaux au total','total',2],['nearMisses',5,'Frôler {n} obstacles','total',3],
 ['shieldHits',2,'Absorber {n} chocs avec un bonus','total',2],['air',600,'Parcourir {n} m dans les airs','total',2],['obstacles',25,'Éviter {n} obstacles en un vol','run',3]
];
export const starsNeeded=level=>3+Math.floor((level-1)*.7);
function nextMission(state){const index=state.next++;const t=templates[index%templates.length];const cycle=Math.floor(index/templates.length);const goal=Math.ceil(t[1]*(1+cycle*.2));return{id:`m${index}`,metric:t[0],goal,title:t[2].replace('{n}',goal),scope:t[3],stars:t[4],progress:0};}
export function initialProgress(){const state={version:1,coins:0,level:1,stars:0,prestige:0,next:0,missions:[],owned:['classic'],equipped:'classic',runs:0};while(state.missions.length<3)state.missions.push(nextMission(state));return state;}
export function normalizeProgress(value){try{const s=typeof value==='string'?JSON.parse(value):value;if(!s||s.version!==1||!Array.isArray(s.missions))return initialProgress();return structuredClone(s);}catch{return initialProgress();}}
export function cleanRun(input={}){const s={};for(const key of ['distance','gifts','games','letters','obstacles','ground','air','hearts','magnetGifts','vehicleDistance','sets','nearMisses','shieldHits'])s[key]=Math.max(0,Math.min(key==='distance'||key==='ground'||key==='air'||key==='vehicleDistance'?100000:10000,Math.floor(Number(input[key])||0)));s.games=1;return s;}
export function previewMissions(state,run){return state.missions.map(m=>({...m,current:Math.min(m.goal,m.scope==='run'?(run[m.metric]||0):m.progress+(run[m.metric]||0))}));}
export function applyRun(value,input){const state=normalizeProgress(value),run=cleanRun(input);state.coins+=run.gifts;state.runs++;const completed=[];state.missions=state.missions.filter(m=>{const p=m.scope==='run'?run[m.metric]:m.progress+run[m.metric];if(p>=m.goal){completed.push({...m,current:m.goal});state.stars+=m.stars;state.coins+=m.stars*20;return false;}if(m.scope==='total')m.progress=p;return true;});let levels=0;while(state.stars>=starsNeeded(state.level)){state.stars-=starsNeeded(state.level);state.level++;state.coins+=50;levels++;if(state.level>15){state.level=1;state.prestige++;state.coins+=250;}}while(state.missions.length<3)state.missions.push(nextMission(state));return{state,completed,levels,earned:run.gifts+completed.reduce((n,m)=>n+m.stars*20,0)+levels*50};}
export function purchase(value,id){const state=normalizeProgress(value),item=ITEMS.find(i=>i.id===id);if(!item)throw new Error('Article inconnu.');if(state.owned.includes(id)){if(item.kind==='trail')state.equipped=id;return state;}if(state.coins<item.price)throw new Error('Il vous manque des cadeaux.');state.coins-=item.price;state.owned.push(id);if(item.kind==='trail')state.equipped=id;return state;}
export function skipMission(value,id){const state=normalizeProgress(value),index=state.missions.findIndex(m=>m.id===id);if(index<0)throw new Error('Mission introuvable.');const cost=state.missions[index].stars*150;if(state.coins<cost)throw new Error('Pas assez de cadeaux pour remplacer cette mission.');state.coins-=cost;state.missions[index]=nextMission(state);return state;}
export function takeHit({lives,invulnerable,shield,vehicle}){if(invulnerable>0)return{lives,invulnerable,shield,vehicle,damage:false};if(vehicle)return{lives,invulnerable:2,shield,vehicle:false,damage:true,absorbed:true};if(shield>0)return{lives,invulnerable:2,shield:0,vehicle,damage:true,absorbed:true};return{lives:Math.max(0,lives-1),invulnerable:2,shield,vehicle,damage:true,absorbed:false};}
