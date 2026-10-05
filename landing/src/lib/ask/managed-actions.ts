export type ManagedAction={type:'show_login';requestId:string}|{type:'open_project';slug:string;view:'overview'|'website'|'changelog'}|{type:'open_experience';experience:'explore'|'ayla'};
export function managedAction(value:unknown):ManagedAction|null{
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const action=value as Record<string,unknown>,keys=Object.keys(action).sort().join(',');
 if(action.type==='show_login'&&keys==='requestId,type'&&typeof action.requestId==='string'&&/^[0-9a-f-]{36}$/i.test(action.requestId))return{type:'show_login',requestId:action.requestId};
 if(action.type==='open_experience'&&keys==='experience,type'&&(action.experience==='explore'||action.experience==='ayla'))return{type:'open_experience',experience:action.experience};
 if(action.type==='open_project'&&keys==='slug,type,view'&&typeof action.slug==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(action.slug)&&action.slug.length<=80&&['overview','website','changelog'].includes(String(action.view)))return{type:'open_project',slug:action.slug,view:action.view as 'overview'|'website'|'changelog'};
 return null;
}
export function actionLabel(action:ManagedAction){return action.type==='show_login'?'Sign in':action.type==='open_experience'?(action.experience==='ayla'?'Open Ayla':'Open Web'):`Open ${action.slug} ${action.view}`;}
