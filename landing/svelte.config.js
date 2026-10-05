import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx'],
	preprocess: [mdsvex({ extensions: ['.svx'] })],
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true
		}),
		prerender: {
			entries: ['/', '/ayla', '/ayla/immersive', '/classic', '*'],
			handleUnseenRoutes: 'warn',
			handleHttpError: ({ path, message }) => {
				if (['/', '/ayla', '/ayla/immersive', '/classic'].includes(path)) throw new Error(message);
				console.warn(message);
			}
		}
	}
};

export default config;
