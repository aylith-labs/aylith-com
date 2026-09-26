import type { UIMessage } from 'ai';

const databaseName = 'aylith-ayla';
const storeName = 'conversation';
const key = 'current';
let writeQueue: Promise<unknown> = Promise.resolve();
let generation = 0;

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
export async function loadConversation(): Promise<{ messages: UIMessage[]; available: boolean }> {
	if (typeof indexedDB === 'undefined') return { messages: [], available: false };
	try {
		const db = await database();
		const value = await new Promise<unknown>((resolve, reject) => {
			const request = db.transaction(storeName, 'readonly').objectStore(storeName).get(key);
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		}).finally(() => db.close());
		if (!value || typeof value !== 'object' || (value as { version?: unknown }).version !== 1) return { messages: [], available: true };
		const messages = (value as { messages?: unknown }).messages;
		if (!Array.isArray(messages)) return { messages: [], available: true };
		return { messages: durableMessages(messages.filter((item) => item && typeof item.id === 'string' && Array.isArray(item.parts)) as UIMessage[]), available: true };
	} catch {
		return { messages: [], available: false };
	}
}

export async function saveConversation(messages: UIMessage[]): Promise<boolean> {
	if (typeof indexedDB === 'undefined') return false;
	const payload = durableMessages(messages);
	const current = generation;
	const write = writeQueue.then(async () => {
		if (current !== generation) return true;
		const db = await database();
		try {
			await new Promise<void>((resolve, reject) => {
				const tx = db.transaction(storeName, 'readwrite');
				tx.objectStore(storeName).put({ version: 1, messages: payload }, key);
				tx.oncomplete = () => resolve();
				tx.onerror = () => reject(tx.error);
			});
			return true;
		} finally { db.close(); }
	}).catch(() => false);
	writeQueue = write;
	return write;
}

export async function clearConversation(): Promise<void> {
	if (typeof indexedDB === 'undefined') return;
	generation++;
	const removal = writeQueue.then(async () => {
		const db = await database();
		try {
			await new Promise<void>((resolve, reject) => {
				const tx = db.transaction(storeName, 'readwrite');
				tx.objectStore(storeName).delete(key);
				tx.oncomplete = () => resolve();
				tx.onerror = () => reject(tx.error);
			});
		} finally { db.close(); }
	}).catch(() => { /* Browser storage is optional. */ });
	writeQueue = removal;
	await removal;
}
