import type { UIMessage } from 'ai';

const databaseName = 'aylith-ayla';
const storeName = 'conversation';
function conversationKey(scope: string) {
 if (!scope || scope.length > 1024) throw new Error('A verified conversation scope is required');
 return `scope:${scope}`;
}
let writeQueue: Promise<unknown> = Promise.resolve();
const generations = new Map<string,number>();
const sessions = new Map<string,string>();
const guestIds = new Map<string,string>();
const memory = new Map<string,UIMessage[]>();
const deletedSessions = new Set<string>();
export function guestConversationScope(origin:string) {
 const key=`ayla-guest-session:${origin}`;let id:string|null=guestIds.get(origin)??null;
 try{id=sessionStorage.getItem(key)??id;}catch{}
 if(!id||!/^[a-f0-9-]{36}$/i.test(id)){id=crypto.randomUUID();try{sessionStorage.setItem(key,id);}catch{}}
 guestIds.set(origin,id);return `guest:${origin}:${id}`;
}


function database(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(databaseName, 1);
		request.onupgradeneeded = () => request.result.createObjectStore(storeName);
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

function durableMessages(messages: UIMessage[]): UIMessage[] {
	return messages.slice(-80).flatMap((message) => {
		if (message.role !== 'user' && message.role !== 'assistant') return [];
		const text = message.parts.filter((part) => part && part.type === 'text')
			.map((part) => 'text' in part && typeof part.text === 'string' ? part.text : '').join('').slice(0, 8000);
		return text ? [{ id: message.id, role: message.role, parts: [{ type: 'text' as const, text }] }] : [];
	});
}

/** Same-device text only. Failed/blocked browser storage leaves the conversation usable in memory. */
export async function loadConversation(scope: string = "guest"): Promise<{ messages: UIMessage[]; available: boolean }> {
	if (typeof indexedDB === 'undefined') return { messages: memory.get(scope)??[], available: false };
	try {
		// A previous shell may have unmounted moments ago and queued its final text.
		await writeQueue;
		const db = await database();
		const value = await new Promise<unknown>((resolve, reject) => {
			const request = db.transaction(storeName, 'readonly').objectStore(storeName).get(conversationKey(scope));
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		}).finally(() => db.close());
		if (!value || typeof value !== 'object' || (value as { version?: unknown }).version !== 1 && (value as {version?:unknown}).version !== 2) return { messages: [], available: true };
		const savedId=(value as {sessionId?:unknown}).sessionId;if(typeof savedId==='string'&&/^[a-f0-9-]{36}$/i.test(savedId))sessions.set(scope,savedId);
		const messages = (value as { messages?: unknown }).messages;
		if (!Array.isArray(messages)) return { messages: [], available: true };
		return { messages: durableMessages(messages.filter((item) => item && typeof item.id === 'string' && Array.isArray(item.parts)) as UIMessage[]), available: true };
	} catch {
		return { messages: memory.get(scope)??[], available: false };
	}
}

export async function saveConversation(messages: UIMessage[], scope: string = "guest"): Promise<boolean> {
	memory.set(scope,durableMessages(messages));
	if (typeof indexedDB === 'undefined') return false;
	const payload = durableMessages(messages);
 const sessionId=sessions.get(scope)??crypto.randomUUID();sessions.set(scope,sessionId);
 if(deletedSessions.has(`archive:${scope}:${sessionId}`))return false;
	const current = generations.get(scope)??0;
	const write = writeQueue.then(async () => {
		if (current !== (generations.get(scope)??0)) return true;
		const db = await database();
		try {
			await new Promise<void>((resolve, reject) => {
				const tx = db.transaction(storeName, 'readwrite');
				tx.objectStore(storeName).put({ version: 2, sessionId, messages: payload }, conversationKey(scope));
				tx.oncomplete = () => resolve();
				tx.onerror = () => reject(tx.error);
				tx.onabort = () => reject(tx.error ?? new Error('Conversation write aborted'));
			});
			return true;
		} finally { db.close(); }
	}).catch(() => false);
	writeQueue = write;
	return write;
}

export async function clearConversation(scope: string = "guest"): Promise<void> {
	memory.delete(scope);sessions.delete(scope);
	generations.set(scope,(generations.get(scope)??0)+1);
	if (typeof indexedDB === 'undefined') return;
	const removal = writeQueue.then(async () => {
		const db = await database();
		try {
			await new Promise<void>((resolve, reject) => {
				const tx = db.transaction(storeName, 'readwrite');
				tx.objectStore(storeName).delete(conversationKey(scope));
				tx.oncomplete = () => resolve();
				tx.onerror = () => reject(tx.error);
				tx.onabort = () => reject(tx.error ?? new Error('Conversation removal aborted'));
			});
		} finally { db.close(); }
	}).catch(() => { /* Browser storage is optional. */ });
	writeQueue = removal;
	await removal;
}

/** Explicit completed sign-in adopts only the currently active guest text.
 * Preserve an existing verified identity's previous session under its own scope. */
export async function adoptGuestConversation(messages:UIMessage[],scope:string,sessionId:string=crypto.randomUUID(),isCurrent:()=>boolean=()=>true):Promise<boolean> {
 if(!/^[a-f0-9-]{36}$/i.test(sessionId))throw new Error('Invalid conversation session');
 if(deletedSessions.has(`archive:${scope}:${sessionId}`)||!isCurrent())return false;
 const payload=durableMessages(messages),current=generations.get(scope)??0;
 const priorMemory=memory.get(scope);if(priorMemory?.length)memory.set(`archive:${scope}:${sessions.get(scope)??crypto.randomUUID()}`,priorMemory);memory.set(scope,payload);
 if(typeof indexedDB==='undefined'){sessions.set(scope,sessionId);return false;}
 const write=writeQueue.then(async()=>{
  if(current!==(generations.get(scope)??0)||!isCurrent()||deletedSessions.has(`archive:${scope}:${sessionId}`))return false;
  const db=await database();try{await new Promise<void>((resolve,reject)=>{
   const tx=db.transaction(storeName,'readwrite'),store=tx.objectStore(storeName),read=store.get(conversationKey(scope));
   read.onsuccess=()=>{if(!isCurrent()||current!==(generations.get(scope)??0))return;const prior=read.result;if(prior&&typeof prior==='object'&&Array.isArray(prior.messages)){const oldId=typeof prior.sessionId==='string'?prior.sessionId:crypto.randomUUID();store.put(prior,`archive:${scope}:${oldId}`);}store.put({version:2,sessionId,messages:payload},conversationKey(scope));};
   read.onerror=()=>reject(read.error);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error??new Error('Conversation write aborted'));
  });if(!isCurrent()||current!==(generations.get(scope)??0))return false;sessions.set(scope,sessionId);return true;}finally{db.close();}
 }).catch(()=>false);writeQueue=write;return write;
}

export type ConversationSession={id:string;title:string;current:boolean};
/** Same-device deletion only; never changes provider records or another scope. */
export async function deleteConversationSession(scope:string,id:string):Promise<boolean> {
 conversationKey(scope);if(!/^[a-f0-9-]{36}$/i.test(id))throw new Error('Invalid conversation session');
 const archiveKey=`archive:${scope}:${id}`,priorArchive=memory.get(archiveKey),priorMemory=memory.get(scope),priorSession=sessions.get(scope);deletedSessions.add(archiveKey);memory.delete(archiveKey);
 if(sessions.get(scope)===id){memory.delete(scope);sessions.delete(scope);generations.set(scope,(generations.get(scope)??0)+1);}
 const removalGeneration=generations.get(scope)??0;
 if(typeof indexedDB==='undefined')return true;
 const removal=writeQueue.then(async()=>{const db=await database();try{await new Promise<void>((resolve,reject)=>{
  const tx=db.transaction(storeName,'readwrite'),store=tx.objectStore(storeName),active=store.get(conversationKey(scope));
  store.delete(archiveKey);active.onsuccess=()=>{if(active.result?.sessionId===id)store.delete(conversationKey(scope));};
  active.onerror=()=>reject(active.error);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error??new Error('Conversation removal aborted'));
 });return true;}finally{db.close();}}).catch(()=>{deletedSessions.delete(archiveKey);if(!memory.has(archiveKey)&&priorArchive)memory.set(archiveKey,priorArchive);if(priorSession===id&&removalGeneration===(generations.get(scope)??0)&&!memory.has(scope)&&!sessions.has(scope)){if(priorMemory)memory.set(scope,priorMemory);sessions.set(scope,id);}return false;});writeQueue=removal;return removal;
}
export async function listConversationSessions(scope:string):Promise<ConversationSession[]> {
 await writeQueue;const rows=new Map<string,ConversationSession>();const prefix=`archive:${scope}:`,activeKey=conversationKey(scope);
 const add=(key:string,value:unknown)=>{if(key!==activeKey&&!key.startsWith(prefix))return;if(!value||typeof value!=='object')return;const record=value as {sessionId?:unknown;messages?:unknown};if(typeof record.sessionId!=='string'||!/^[a-f0-9-]{36}$/i.test(record.sessionId)||!Array.isArray(record.messages))return;const messages=durableMessages(record.messages);const title=messages.find(x=>x.role==='user')?.parts.filter(x=>x.type==='text').map(x=>'text'in x?x.text:'').join('').slice(0,80);if(!title)return;const prior=rows.get(record.sessionId);if(!prior||key===activeKey)rows.set(record.sessionId,{id:record.sessionId,title,current:key===activeKey});};
 if(typeof indexedDB==='undefined'){for(const [key,messages]of memory){const sessionId=key.startsWith(prefix)?key.slice(prefix.length):sessions.get(scope);add(key===scope?activeKey:key,{sessionId,messages});}return [...rows.values()];}
 const db=await database();try{await new Promise<void>((resolve,reject)=>{const cursor=db.transaction(storeName,'readonly').objectStore(storeName).openCursor();cursor.onsuccess=()=>{const row=cursor.result;if(!row){resolve();return;}if(typeof row.key==='string')add(row.key,row.value);row.continue();};cursor.onerror=()=>reject(cursor.error);});}finally{db.close();}
 return [...rows.values()].sort((a,b)=>Number(b.current)-Number(a.current));
}
export async function reopenConversation(scope:string,id:string,isCurrent:()=>boolean=()=>true):Promise<{messages:UIMessage[];available:boolean}> {
 if(!/^[a-f0-9-]{36}$/i.test(id))throw new Error('Invalid conversation session');await writeQueue;
 let value:unknown;if(typeof indexedDB==='undefined')value={messages:memory.get(`archive:${scope}:${id}`)};else{const db=await database();try{value=await new Promise<unknown>((resolve,reject)=>{const request=db.transaction(storeName,'readonly').objectStore(storeName).get(`archive:${scope}:${id}`);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}finally{db.close();}}
 if(!isCurrent()||deletedSessions.has(`archive:${scope}:${id}`))throw new Error('Conversation changed');if(!value||typeof value!=='object'||!Array.isArray((value as {messages?:unknown}).messages))throw new Error('This conversation is unavailable');const messages=durableMessages((value as {messages:UIMessage[]}).messages);await adoptGuestConversation(messages,scope,id,isCurrent);return {messages,available:typeof indexedDB!=='undefined'};
}
