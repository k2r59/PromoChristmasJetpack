import { defineConfig } from 'vite';
import { handleApi } from './server/api.js';
import { localDatabase } from './server/local-db.js';
export default defineConfig({
  build:{outDir:'dist/client',chunkSizeWarningLimit:1600,rollupOptions:{output:{manualChunks:{phaser:['phaser']}}}},
  plugins:[{name:'local-profile-api',configureServer(server){const DB=localDatabase();server.httpServer?.once('close',()=>DB.close());server.middlewares.use(async(req,res,next)=>{if(!req.url.startsWith('/api/'))return next();try{const chunks=[];let bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>2048){res.statusCode=413;res.end();return;}chunks.push(chunk);}const headers=new Headers();for(const [k,v]of Object.entries(req.headers))if(v)headers.set(k,Array.isArray(v)?v.join(','):v);const request=new Request(`http://${req.headers.host}${req.url}`,{method:req.method,headers,...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})});const response=await handleApi(request,{DB});res.statusCode=response.status;response.headers.forEach((v,k)=>res.setHeader(k,v));res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.statusCode=500;res.end(JSON.stringify({error:'Le serveur local a rencontré une erreur.'}));}});}}]
});
