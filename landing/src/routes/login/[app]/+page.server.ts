import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
export const prerender = true;
function applications(): Array<{id:string; redirectUri:string; startUri:string}> {
  if (!env.AYLITH_LOGIN_CLIENTS_JSON) return [];
  const bindings: unknown = JSON.parse(env.AYLITH_LOGIN_CLIENTS_JSON);
  const starts: unknown = JSON.parse(env.AYLITH_LOGIN_STARTS_JSON ?? '{}');
  if (!Array.isArray(bindings) || bindings.length>100 || !starts || typeof starts!=='object' || Array.isArray(starts)) throw new Error('Invalid configured login applications');
  const ids=bindings.map(binding=>binding?.id);
  if (ids.some(id=>typeof id!=='string' || !/^[a-z][a-z0-9-]{0,47}$/.test(id)) || new Set(ids).size!==ids.length || Object.keys(starts).some(id=>!ids.includes(id))) throw new Error('Invalid configured login applications');
  return bindings.map(binding=>{
    const start=(starts as Record<string,unknown>)[binding.id];
    if(typeof start!=='string' || typeof binding.redirectUri!=='string') throw new Error('Missing app-owned sign-in starter');
    const callback=new URL(binding.redirectUri); const uri=new URL(start);
    if ([callback,uri].some(url=>url.protocol!=='https:' || url.username || url.password || url.search || url.hash) || uri.origin!==callback.origin || uri.pathname!=='/api/auth/oauth/aylith') throw new Error('Invalid app-owned sign-in starter');
    return {id:binding.id,redirectUri:callback.href,startUri:uri.href};
  });
}
export function entries() { return applications().map(binding=>({app:binding.id})); }
export function load({params}: {params:{app:string}}) {
  const binding=applications().find(binding=>binding.id===params.app);
  if (!binding) error(404,'Unknown sign-in application');
  return {applicationId:binding.id,authorizationStartUri:binding.startUri};
}
