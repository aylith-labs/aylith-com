export function reveal(node: HTMLElement, options: { delay?: number; threshold?: number } = {}) {
	const root = document.documentElement;
	const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
	const isReduced = () => {
		// The resolved site choice takes precedence, including an explicit Full override.
		const resolved = root.dataset.motion;
		return resolved === 'reduced' || (resolved !== 'full' && mediaQuery.matches);
	};
	if (isReduced() || !('IntersectionObserver' in window) || !node.animate) return {};
	const { delay = 0, threshold = 0.15 } = options;
	const originalOpacity = node.style.getPropertyValue('opacity');
	const originalPriority = node.style.getPropertyPriority('opacity');
	let animation: Animation | undefined;
	let finished = false;

	node.style.opacity = '0';

	const restoreOpacity = () => {
		if (originalOpacity) node.style.setProperty('opacity', originalOpacity, originalPriority);
		else node.style.removeProperty('opacity');
	};
	const finish = () => {
		if (finished) return;
		finished = true;
		observer.disconnect();
		motionObserver.disconnect();
		mediaQuery.removeEventListener('change', syncMotion);
		animation?.cancel();
		restoreOpacity();
	};
	const syncMotion = () => {
		if (isReduced()) finish();
	};
	const motionObserver = new MutationObserver(syncMotion);

	const observer = new IntersectionObserver(
		(entries) => {
			if (finished) return;
			if (isReduced()) {
				finish();
				return;
			}
			for (const entry of entries) {
				if (entry.isIntersecting) {
					observer.disconnect();
					restoreOpacity();
					// A cancellable effect removes both its delay and its in-flight movement
					// immediately when the preference changes, preserving author styles.
					animation = node.animate(
						[
							{ opacity: 0, transform: 'translateY(20px)' },
							{ opacity: 1, transform: 'translateY(0)' }
						],
						{ duration: 700, delay, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' }
					);
					void animation.finished.then(finish, finish);
					break;
				}
			}
		},
		{ threshold }
	);

	motionObserver.observe(root, { attributes: true, attributeFilter: ['data-motion'] });
	mediaQuery.addEventListener('change', syncMotion);
	observer.observe(node);

	return {
		destroy: finish
	};
}
