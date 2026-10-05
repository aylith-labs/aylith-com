export type ImmersivePhase = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

export function requestSummary(request: string): string {
	const text = request.replace(/\s+/g, ' ').trim();
	return text.length <= 120 ? text : `${text.slice(0, 117)}…`;
}

export function responsePreview(response: string): { text: string; shortened: boolean } {
	const text = response.trim();
	return text.length <= 240 ? { text, shortened: false } : { text: `${text.slice(0, 237)}…`, shortened: true };
}

export function immersivePhase(
	voice: 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error',
	chat: 'ready' | 'submitted' | 'streaming' | 'error',
	hasError: boolean
): ImmersivePhase {
	if (hasError || voice === 'error' || chat === 'error') return 'error';
	if (voice === 'listening') return 'listening';
	if (voice === 'speaking') return 'speaking';
	if (voice === 'connecting' || voice === 'thinking' || chat === 'submitted' || chat === 'streaming') return 'thinking';
	return 'idle';
}
