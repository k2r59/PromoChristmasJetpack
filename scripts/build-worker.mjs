import { readFile, writeFile, readdir, mkdir, cp } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { extname } from 'node:path';
const root='dist/client';
async function files(dir){const out=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=`${dir}/${entry.name}`;if(entry.isDirectory())out.push(...await files(path));else out.push(path);}return out;}
const paths=await files(root);
const version=createHash('sha256');for(const p of paths)version.update(await readFile(p));const cache=`noel-${version.digest('hex').slice(0,12)}`;
const precache=paths.map(p=>p.slice(root.length)).filter(p=>!p.endsWith('.map')&&!p.startsWith('/_'));
const sw=`const CACHE=${JSON.stringify(cache)}, FILES=${JSON.stringify(['/',...precache])};
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('noel-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.match('/')));return;}event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request)));});`;
await writeFile(`${root}/sw.js`,sw);
const mime={'.mp3':'audio/mpeg','.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.webmanifest':'application/manifest+json'};
const assets={};for(const path of await files(root)){const bytes=await readFile(path);assets[path.slice(root.length)]={type:mime[extname(path)]||'application/octet-stream',data:bytes.toString('base64')};}
const progression=await readFile('shared/progression.js','utf8');
const api=progression+'\n'+(await readFile('server/api.js','utf8')).replace(/^import .*progression.js';\n/m,'');
const worker=`${api}\nconst assets=${JSON.stringify(assets)};\nexport default {async fetch(request,env){const url=new URL(request.url);if(url.pathname.startsWith('/api/'))return handleApi(request,env);if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});const key=url.pathname==='/'?'/index.html':url.pathname;const asset=assets[key];if(!asset)return new Response('Not found',{status:404});const headers={'Content-Type':asset.type,'X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Cache-Control':key.startsWith('/assets/')?'public,max-age=31536000,immutable':'no-cache'};if(key==='/sw.js')headers['Service-Worker-Allowed']='/';return new Response(request.method==='HEAD'?null:Uint8Array.from(atob(asset.data),c=>c.charCodeAt(0)),{headers});}};`;
await mkdir('dist/server',{recursive:true});await mkdir('dist/.openai',{recursive:true});await writeFile('dist/server/index.js',worker);await cp('.openai/hosting.json','dist/.openai/hosting.json');await cp('drizzle','dist/.openai/drizzle',{recursive:true});console.log(`Worker built: ${(Buffer.byteLength(worker)/1024/1024).toFixed(2)} MB, ${Object.keys(assets).length} assets, ${cache}`);
