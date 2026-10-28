import { normalizeProgress, applyRun, purchase, skipMission } from '../shared/progression.js';
export const normalizeEmail = value => typeof value === 'string' ? value.trim().toLowerCase() : '';
export const validEmail = email => email.length <= 254 && /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(email);
const json = (data,status=200,headers={}) => new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const hash = async s => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),x=>x.toString(16).padStart(2,'0')).join('');
const token = () => Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
const sessionCookie = request => (request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('noel_session='))?.slice(13);
const cookie = (value,request,age=2592000) => `noel_session=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${new URL(request.url).protocol==='https:'?'; Secure':''}`;
async function current(request,db){const value=sessionCookie(request);if(!value||!/^[a-f0-9]{64}$/.test(value))return null;return db.prepare('SELECT profiles.id, profiles.email, profiles.best, profiles.game_state, profiles.revision FROM sessions JOIN profiles ON profiles.id=sessions.profile_id WHERE sessions.token_hash=? AND sessions.expires_at>?').bind(await hash(value),Date.now()).first();}
function publicProfile(row){return row?{id:row.id,email:row.email,best:row.best,progress:normalizeProgress(row.game_state)}:null;}
export async function handleApi(request, env){
  const url=new URL(request.url), path=url.pathname;
  if(!env.DB)return json({error:'La base des profils est momentanément indisponible.'},503);
  if(!['GET','POST'].includes(request.method))return json({error:'Méthode non autorisée.'},405);
  if(request.method==='POST'){
    const origin=request.headers.get('origin');
    if((origin&&origin!==url.origin)||request.headers.get('sec-fetch-site')==='cross-site')return json({error:'Origine non autorisée.'},403);
    if(!request.headers.get('content-type')?.includes('application/json')&&path!=='/api/logout')return json({error:'Format non autorisé.'},415);
  }
  try {
    if(path==='/api/me'&&request.method==='GET')return json({profile:publicProfile(await current(request,env.DB))});
    if(path==='/api/profile'&&request.method==='POST'){
      const raw=await request.text();if(raw.length>1024)return json({error:'Requête trop longue.'},413);
      let body;try{body=JSON.parse(raw);}catch{return json({error:'Adresse e-mail invalide.'},400);}
      const email=normalizeEmail(body.email);if(!validEmail(email))return json({error:'Indiquez une adresse e-mail valide.'},400);
      const now=Date.now();const ip=request.headers.get('cf-connecting-ip');
      if(ip){const key=await hash(ip+':'+Math.floor(now/600000));const rate=await env.DB.prepare('INSERT INTO rate_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,now+600000).first();if(rate.count>30)return json({error:'Trop de tentatives. Réessayez dans quelques minutes.'},429);}
      await env.DB.prepare('INSERT INTO profiles (id,email,best,created_at) VALUES (?,?,0,?) ON CONFLICT(email) DO NOTHING').bind(crypto.randomUUID(),email,now).run();
      const profile=await env.DB.prepare('SELECT id,email,best,game_state,revision FROM profiles WHERE email=?').bind(email).first();
      const value=token();await env.DB.batch([
        env.DB.prepare('INSERT INTO sessions (token_hash,profile_id,expires_at) VALUES (?,?,?)').bind(await hash(value),profile.id,now+2592000000),
        env.DB.prepare('DELETE FROM sessions WHERE expires_at<?').bind(now),
        env.DB.prepare('DELETE FROM rate_limits WHERE expires_at<?').bind(now)
      ]);
      return json({profile:publicProfile(profile)},200,{'Set-Cookie':cookie(value,request)});
    }
    if(path==='/api/logout'&&request.method==='POST'){const value=sessionCookie(request);if(value)await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await hash(value)).run();return json({ok:true},200,{'Set-Cookie':cookie('',request,0)});}
    if(['/api/run','/api/purchase','/api/mission/skip'].includes(path)&&request.method==='POST'){
      let profile=await current(request,env.DB);if(!profile)return json({error:'Reconnectez votre profil.'},401);
      const raw=await request.text();if(raw.length>2048)return json({error:'Requête trop longue.'},413);let body;try{body=JSON.parse(raw);}catch{return json({error:'Requête invalide.'},400);}
      if(path==='/api/run'&&(!/^[a-zA-Z0-9-]{10,80}$/.test(body.id||'')||!Number.isSafeInteger(body.score)||body.score<0||body.score>10000000))return json({error:'Partie invalide.'},400);
      for(let attempt=0;attempt<4;attempt++){
        profile=await env.DB.prepare('SELECT id,email,best,game_state,revision FROM profiles WHERE id=?').bind(profile.id).first();
        if(path==='/api/run'){
          if(normalizeProgress(profile.game_state).receipts?.includes(body.id)||await env.DB.prepare('SELECT id FROM run_receipts WHERE id=? AND profile_id=?').bind(profile.id+':'+body.id,profile.id).first())return json({profile:publicProfile(profile),duplicate:true});
          const result=applyRun(profile.game_state,body.stats);result.state.receipts=[...(result.state.receipts||[]),body.id].slice(-100);
          const row=await env.DB.prepare('UPDATE profiles SET game_state=?,best=MAX(best,?),revision=revision+1 WHERE id=? AND revision=? RETURNING id,email,best,game_state,revision').bind(JSON.stringify(result.state),body.score,profile.id,profile.revision).first();
          if(!row)continue;
          await env.DB.prepare('INSERT INTO run_receipts (id,profile_id,created_at) VALUES (?,?,?) ON CONFLICT(id) DO NOTHING').bind(profile.id+':'+body.id,profile.id,Date.now()).run();
          return json({profile:publicProfile(row),completed:result.completed,earned:result.earned,levels:result.levels});
        }
        let state;try{state=path==='/api/purchase'?purchase(profile.game_state,body.id):skipMission(profile.game_state,body.id);}catch(e){return json({error:e.message},400);}
        const row=await env.DB.prepare('UPDATE profiles SET game_state=?,revision=revision+1 WHERE id=? AND revision=? RETURNING id,email,best,game_state,revision').bind(JSON.stringify(state),profile.id,profile.revision).first();if(row)return json({profile:publicProfile(row)});
      }
      return json({error:'Une autre sauvegarde est en cours. Réessayez.'},409);
    }
    if(path==='/api/score'&&request.method==='POST'){
      const profile=await current(request,env.DB);if(!profile)return json({error:'Reconnectez votre profil pour sauvegarder votre score.'},401);
      const raw=await request.text();if(raw.length>1024)return json({error:'Requête trop longue.'},413);let body;try{body=JSON.parse(raw);}catch{return json({error:'Score invalide.'},400);}
      if(!Number.isSafeInteger(body.score)||body.score<0||body.score>10000000)return json({error:'Score invalide.'},400);
      await env.DB.prepare('UPDATE profiles SET best=MAX(best,?) WHERE id=?').bind(body.score,profile.id).run();return json({best:Math.max(profile.best,body.score)});
    }
    return json({error:'Route introuvable.'},404);
  }catch(error){console.error('Profile API failed:',error.message);return json({error:'Service momentanément indisponible. Réessayez dans un instant.'},500);}
}
