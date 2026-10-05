/** A direct identity request opens the secure UI before text reaches the chat transport. */
export function asksToSignIn(text: string): boolean {
	const request = text.trim().toLowerCase().replace(/[.!?]+$/, '').replace(/\s+/g, ' ');
	const action = '(?:sign[ -]?in|log[ -]?in|login)';
	const account = '(?: (?:to|into) (?:my )?(?:aylith )?account)?';
	return /^(?:please )?(?:(?:can you )?(?:show|open)(?: me)? (?:the )?)(?:sign[ -]?in|log[ -]?in|login) (?:form|screen|panel)$/.test(request) ||
		/^(?:szeretnék bejelentkezni|be szeretnék jelentkezni|bejelentkezés)$/.test(request) ||
		new RegExp(`^(?:please )?${action}${account}$`).test(request) ||
		new RegExp(`^(?:how (?:do|can) i|i (?:want|need|would like) to|help me|can you (?:help me )?) ${action}${account}$`).test(request) ||
		/^(?:i (?:want|need) to )?authenticate(?: myself| with aylith| to my account)?$/.test(request);
}
