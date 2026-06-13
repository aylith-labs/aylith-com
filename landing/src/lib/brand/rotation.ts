/** The 12 letter-highlight animation variants, indexed 1-12 (one per calendar month). */
export const wordmarkVariants = [
	{ id: 1, name: 'Slash sweep ignite' },
	{ id: 2, name: 'Sequential fill' },
	{ id: 3, name: 'Shimmer band' },
	{ id: 4, name: 'Tally count' },
	{ id: 5, name: 'Typewriter reveal' },
	{ id: 6, name: 'Stroke draw' },
	{ id: 7, name: 'Wave bob' },
	{ id: 8, name: 'Flicker ignite' },
	{ id: 9, name: 'Spotlight scan' },
	{ id: 10, name: 'Underline sweep' },
	{ id: 11, name: 'Track-in' },
	{ id: 12, name: 'Diagonal rise' }
] as const;

/** Which variant the live site shows this month. January = 1 … December = 12. */
export function getMonthlyVariant(date = new Date()): number {
	return date.getMonth() + 1;
}
