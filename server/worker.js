import { handleApi } from './api.js';
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      try { return await handleApi(request, env); }
      catch { return Response.json({error:'Le service est temporairement indisponible.'},{status:503,headers:{'Cache-Control':'no-store'}}); }
    }
    return env.ASSETS.fetch(request);
  }
};
