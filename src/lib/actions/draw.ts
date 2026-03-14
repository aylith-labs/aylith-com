export function draw(node: SVGElement, options: { delay?: number; duration?: number } = {}) {
	const { delay = 0, duration = 800 } = options;

	const paths = node.querySelectorAll('path');
	paths.forEach((path) => {
		const length = path.getTotalLength();
		path.style.strokeDasharray = `${length}`;
		path.style.strokeDashoffset = `${length}`;
		path.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`;
	});

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					paths.forEach((path) => {
						path.style.strokeDashoffset = '0';
					});
					observer.unobserve(node);
				}
			}
		},
		{ threshold: 0.3 }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.unobserve(node);
		}
	};
}
