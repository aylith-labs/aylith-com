import { describe, expect, it } from 'vitest';
import { asksToSignIn } from './auth-intent';

describe('Ayla secure sign-in request', () => {
	it('opens the structured sign-in card for a direct request', () => {
		expect(asksToSignIn('How can I sign in?')).toBe(true);
		expect(asksToSignIn('Please log in to my account')).toBe(true);
		expect(asksToSignIn('I want to authenticate')).toBe(true);
	});

	it('leaves ordinary questions in the conversation', () => {
		expect(asksToSignIn('What does Agentry do?')).toBe(false);
		expect(asksToSignIn('Explain your design language')).toBe(false);
		expect(asksToSignIn('How do I authenticate Bract?')).toBe(false);
		expect(asksToSignIn('Explain login security for my app')).toBe(false);
		expect(asksToSignIn('Can you sign in to GitHub for me?')).toBe(false);
	});
});
