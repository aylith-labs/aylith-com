import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
export const prerender = true;
function applicationIds(): string[] {
  if (!env.AYLITH_LOGIN_CLIENTS_JSON) return [];
  const bindings: unknown = JSON.parse(env.AYLITH_LOGIN_CLIENTS_JSON);
  if (!Array.isArray(bindings) || bindings.length>100) throw new Error('Invalid configured login applications');
  const ids=bindings.map(binding=>binding?.id);
  if (ids.some(id=>typeof id!=='string' || !/^[a-z][a-z0-9-]{0,47}$/.test(id)) || new Set(ids).size!==ids.length) throw new Error('Invalid configured login applications');
  return ids;
}
export function entries() { return applicationIds().map(app=>({app})); }
export function load({params}: {params:{app:string}}) {
  if (!applicationIds().includes(params.app)) error(404,'Unknown sign-in application');
  return {applicationId:params.app};
}
