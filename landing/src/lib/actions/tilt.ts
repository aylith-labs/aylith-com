export function tilt(node: HTMLElement, options: { max?: number; scale?: number } = {}) {
	const { max = 6, scale = 1.02 } = options;
	const root = document.documentElement;
	const media = window.matchMedia('(prefers-reduced-motion: reduce)');
	const reduced = () => root.dataset.motion ? root.dataset.motion === 'reduced' : media.matches;
	const transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
	const reset = () => {
		// Shortening a transition's duration does not cancel one already running.
		// Remove the transition before resetting when Reduced is selected.
		node.style.transition = reduced() ? 'none' : transition;
		node.style.transform = '';
		node.style.willChange = reduced() ? '' : 'transform';
	};
	const preferenceObserver = new MutationObserver(reset);
	preferenceObserver.observe(root, { attributes: true, attributeFilter: ['data-motion'] });
	media.addEventListener('change', reset);

	function handleMouseMove(e: MouseEvent) {
		if (reduced()) { reset(); return; }
		const rect = node.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		const rotateX = ((y - centerY) / centerY) * -max;
		const rotateY = ((x - centerX) / centerX) * max;

		node.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
	}

	function handleMouseLeave() {
		reset();
	}

	reset();
	node.addEventListener('mousemove', handleMouseMove);
	node.addEventListener('mouseleave', handleMouseLeave);

	return {
		destroy() {
			preferenceObserver.disconnect();
			media.removeEventListener('change', reset);
			node.removeEventListener('mousemove', handleMouseMove);
			node.removeEventListener('mouseleave', handleMouseLeave);
		}
	};
}
