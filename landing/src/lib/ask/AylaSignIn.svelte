<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import LoginBrand from './LoginBrand.svelte';
	import AppearancePreferences from './AppearancePreferences.svelte';

	let {
		apiUrl,
		authPath = '/api/auth',
		applicationId = 'ayla',
		authRequestId = '',
		open,
		onClose,
		onStatus
	}: {
		apiUrl: string;
		authPath?: string;
		applicationId?: string;
		authRequestId?: string;
		open: boolean;
		onClose: () => void;
		onStatus: (name: string, subject?: string, state?: 'checking' | 'guest' | 'authenticated' | 'signed-in' | 'signed-out', conversationIdentity?:string) => void;
	} = $props();

	let loginProfile = $state(untrack(() => ({ name: authPath === '/api/auth' ? 'Ayla' : 'Sign in', endorsement: 'Aylith', productId: '' }))); 
	let preparedFlow = false;
	let originalRedirect = '';
	let appearanceIdentity = $state('');
	function notify(name: string, subject?: string, state?: 'checking' | 'guest' | 'authenticated' | 'signed-in' | 'signed-out', identity?: string) {
		appearanceIdentity = (state === 'authenticated' || state === 'signed-in') && identity && /^[a-f0-9]{64}$/.test(identity) ? identity : '';
		onStatus(name, subject, state, identity);
	}
	let available = $state(false);
	let checking = $state(true);
	let step = $state<'password' | 'totp' | 'complete'>('password');
	let loginName = $state('');
	let password = $state('');
	let code = $state('');
	let busy = $state(false);
	let identityKnown = $state(false);
	let error = $state('');
	let userName = $state('');
	let panel = $state<HTMLElement>();
	let refreshEpoch = 0;
	let refreshController: AbortController | null = null;
	let operationEpoch = 0;
	let operationController: AbortController | null = null;

	async function request(path: string, body?: Record<string, string>, signal?: AbortSignal) {
		const bounded = signal ? AbortSignal.any([signal, AbortSignal.timeout(15_000)]) : AbortSignal.timeout(15_000);
		if (authPath !== '/api/auth' && authPath !== `/api/login/${applicationId}`) throw new Error('Unknown sign-in route');
		return fetch(`${apiUrl}${authPath}/${path}`, {
			method: body ? 'POST' : 'GET',
			credentials: 'include',
			cache: 'no-store',
			redirect: 'error',
			signal: bounded,
			headers: body ? { 'Content-Type': 'application/json' } : undefined,
			body: body ? JSON.stringify(body) : undefined
		});
	}

	async function refresh() {
		if (busy || refreshController) return;
		const controller = new AbortController();
		refreshController = controller;
		const epoch = ++refreshEpoch;
		checking = true;
		identityKnown = false;
		notify('', undefined, 'checking');
		error = '';
		try {
			let verifiedRequest = authRequestId;
			if (authPath !== '/api/auth' && verifiedRequest) {
				if (!/^V2_[A-Za-z0-9_-]{3,128}$/.test(verifiedRequest)) throw new Error('Invalid authorization request.');
				const resume=await request('resume',{authRequest:verifiedRequest},controller.signal);
				const flow=await resume.json() as {redirectUri?:string};
				if (!resume.ok || !flow.redirectUri) throw new Error('Original sign-in request could not be resumed.');
				const callback=new URL(flow.redirectUri);
				if (callback.protocol!=='https:' || callback.username || callback.password || callback.search || callback.hash) throw new Error('Unknown application callback.');
				originalRedirect=callback.href;preparedFlow=true;
			}
			if (authPath !== '/api/auth' && !verifiedRequest) {
				const start = await request('start', {}, controller.signal);
				const flow = await start.json() as {authRequest?:string};
				if (!start.ok || !flow.authRequest || !/^V2_[A-Za-z0-9_-]{3,128}$/.test(flow.authRequest)) throw new Error('Configured sign-in could not start.');
				verifiedRequest = flow.authRequest;
				preparedFlow = true;
			}
			if (verifiedRequest && !/^V2_[A-Za-z0-9_-]{3,128}$/.test(verifiedRequest)) throw new Error('Invalid authorization request.');
			const capability = await request('capability', undefined, controller.signal);
			if (!capability.ok) throw new Error('Identity service is unavailable.');
			const state = await capability.json() as { available?: boolean; authenticated?: boolean };
			if (authPath === '/api/auth' && state.available === false && state.authenticated === false) {
				if (epoch !== refreshEpoch || controller.signal.aborted) return;
				available = false; identityKnown = true; userName = ''; step = 'password';
				notify('', undefined, 'guest');
				return;
			}
			const presentation = await request(`presentation${authPath !== '/api/auth' ? `?authRequest=${encodeURIComponent(verifiedRequest)}` : ''}`, undefined, controller.signal);
			if (!presentation.ok) throw new Error('Sign-in presentation is unavailable.');
			const profile = await presentation.json() as { product?: { id?: string; name?: string; endorsement?: string; style?: string } };
			if (profile.product?.id !== applicationId || typeof profile.product.name !== 'string' || !profile.product.name.trim() || profile.product.name.length > 80 || /[<>\x00-\x1f]/.test(profile.product.name) || profile.product.endorsement !== 'Aylith' || profile.product.style !== 'warm-stone') throw new Error('Unknown installed sign-in presentation.');
			if (epoch !== refreshEpoch || controller.signal.aborted) return;
			loginProfile = { name: profile.product.name, endorsement: profile.product.endorsement, productId: applicationId };
			let verifiedName = '';
			let verifiedSubject = '';let verifiedConversationIdentity='';
			if (state.authenticated) {
				const session = await request('session', undefined, controller.signal);
				if (!session.ok) throw new Error('Your sign-in status could not be checked.');
				const identity = await session.json() as { authenticated?: boolean; user?: { id?: string; name?: string; conversationIdentity?: string } };
				if (identity.authenticated && identity.user?.id && identity.user?.name) { verifiedName = identity.user.name; verifiedSubject = identity.user.id;verifiedConversationIdentity=identity.user.conversationIdentity??''; }
			}
			if (epoch !== refreshEpoch) return;
			available = state.available === true;
			identityKnown = true;
			userName = verifiedName;
			step = verifiedName ? 'complete' : 'password';
			notify(verifiedName, verifiedSubject, verifiedSubject ? 'authenticated' : 'guest',verifiedConversationIdentity);
		} catch {
			if (epoch !== refreshEpoch) return;
			available = false;
			identityKnown = false;
			notify('', undefined, 'checking');
			error = 'Identity service is unavailable. Retry to confirm your sign-in status and reopen this device’s conversation.';
		} finally {
			if (epoch === refreshEpoch) { checking = false; refreshController = null; }
		}
	}

	function interruptRefresh() {
		refreshEpoch++;
		refreshController?.abort();
		refreshController = null;
		checking = false;
	}

	function interruptOperation() {
		if (operationController) { identityKnown = false; notify('', undefined, 'checking'); }
		operationEpoch++;
		operationController?.abort();
		operationController = null;
		busy = false;
	}

	function dismiss() {
		password = '';
		code = '';
		interruptOperation();
		void refresh();
		onClose();
	}

	onMount(() => {
		void refresh();
		const visibility = () => { if (document.visibilityState === 'visible' && !checking && !busy) void refresh(); };
		document.addEventListener('visibilitychange', visibility);
		return () => { interruptRefresh(); interruptOperation(); password = ''; code = ''; document.removeEventListener('visibilitychange', visibility); };
	});
	$effect(() => {
		if (!open) { password = ''; code = ''; interruptOperation(); return; }
		untrack(() => { void refresh(); });
		queueMicrotask(() => (panel?.querySelector<HTMLElement>('input:not(:disabled)') ?? panel?.querySelector<HTMLElement>('button:not(:disabled)'))?.focus());
	});

	function keepFocus(event: KeyboardEvent) {
		if (event.key !== 'Tab' || !panel) return;
		const controls = [...panel.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)')];
		const first = controls[0], last = controls.at(-1);
		if (!first || !last) return;
		if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
		else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
	}

	function continueOriginal(value?:string) {
		if (!originalRedirect || !value) throw new Error('Original request did not complete.');
		const expected=new URL(originalRedirect);const callback=new URL(value);
		if (callback.origin!==expected.origin || callback.pathname!==expected.pathname || callback.username || callback.password || callback.hash || callback.searchParams.getAll('code').length!==1 || !callback.searchParams.get('code')) throw new Error('Application callback did not match.');
		password='';code='';window.location.assign(callback.href);
	}

	async function signIn(event: SubmitEvent) {
		event.preventDefault();
		if (busy || !available || !loginName.trim() || !password) return;
		interruptRefresh();
		const epoch = ++operationEpoch;
		const controller = new AbortController();
		operationController = controller;
		busy = true;
		error = '';
		const enteredPassword = password;
		password = '';
		try {
			if (!preparedFlow) {
				const start = await request('start', {}, controller.signal);
				if (epoch !== operationEpoch) return;
				if (!start.ok) throw new Error('Sign-in could not start. Try again.');
			}
			preparedFlow = false;
			const response = await request('password', { loginName: loginName.trim(), password: enteredPassword }, controller.signal);
			if (epoch !== operationEpoch) return;
			const result = await response.json() as { callbackUrl?:string; step?: string; user?: { id?: string; name?: string; conversationIdentity?: string }; error?: string };
			if (epoch !== operationEpoch) return;
			if (!response.ok) {
				if (result.error === 'invalid_credentials') throw new Error('The name or password did not match. Try again.');
				if (result.error === 'additional_verification_required') throw new Error('This account needs another verification method. Inline sign-in cannot finish it yet.');
				throw new Error('Sign-in is unavailable right now. Try again.');
			}
			if (result.step === 'redirect') { continueOriginal(result.callbackUrl); return; }
			if (result.step === 'totp') { step = 'totp'; return; }
			if (result.step === 'complete' && result.user?.name) {
				userName = result.user.name;
				identityKnown = true;
				step = 'complete';
				notify(userName, result.user?.id, result.user?.id ? 'signed-in' : 'checking',result.user?.conversationIdentity);
				return;
			}
			throw new Error('Sign-in did not finish. Try again.');
		} catch (cause) {
			if (epoch === operationEpoch) error = cause instanceof Error ? cause.message : 'Sign-in failed. Try again.';
		} finally {
			if (epoch === operationEpoch) { busy = false; operationController = null; }
		}
	}

	async function verifyCode(event: SubmitEvent) {
		event.preventDefault();
		if (busy || !/^\d{6,8}$/.test(code)) return;
		interruptRefresh();
		const epoch = ++operationEpoch;
		const controller = new AbortController();
		operationController = controller;
		busy = true;
		error = '';
		const enteredCode = code;
		code = '';
		try {
			const response = await request('totp', { code: enteredCode }, controller.signal);
			if (epoch !== operationEpoch) return;
			const result = await response.json() as { callbackUrl?:string; step?: string; user?: { id?: string; name?: string; conversationIdentity?: string }; error?: string };
			if (epoch !== operationEpoch) return;
			if (!response.ok) throw new Error(result.error === 'invalid_code' ? 'That authenticator code did not match. Try again.' : 'Verification is unavailable. Try again.');
			if (result.step === 'redirect') { continueOriginal(result.callbackUrl); return; }
			if (result.step !== 'complete' || !result.user?.name) throw new Error('Verification did not finish. Try again.');
			userName = result.user.name;
			identityKnown = true;
			step = 'complete';
			notify(userName, result.user?.id, result.user?.id ? 'signed-in' : 'checking',result.user?.conversationIdentity);
		} catch (cause) {
			if (epoch === operationEpoch) error = cause instanceof Error ? cause.message : 'Verification failed. Try again.';
		} finally {
			if (epoch === operationEpoch) { busy = false; operationController = null; }
		}
	}

	async function signOut() {
		if (busy) return;
		interruptRefresh();
		const epoch = ++operationEpoch;
		const controller = new AbortController();
		operationController = controller;
		busy = true;
		error = '';
		try {
			const response = await request('logout', {}, controller.signal);
			if (epoch !== operationEpoch) return;
			if (!response.ok) throw new Error('Sign-out did not finish. Please try again.');
			userName = '';
			identityKnown = true;
			step = 'password';
			notify('', undefined, 'signed-out');
		} catch (cause) {
			if (epoch === operationEpoch) error = cause instanceof Error ? cause.message : 'Sign-out did not finish.';
		} finally {
			if (epoch === operationEpoch) { busy = false; operationController = null; }
		}
	}
</script>

{#if !open}<AppearancePreferences {apiUrl} {authPath} identity={appearanceIdentity} />{/if}

{#if open}
	<div bind:this={panel} onkeydown={keepFocus} role="dialog" tabindex="-1" aria-modal="true" class="absolute inset-x-2 top-4 z-40 mx-auto w-[min(calc(100%-1rem),28rem)] max-h-[calc(100%-2rem)] overflow-y-auto rounded-3xl border border-surface-200 bg-white p-5 shadow-[0_26px_80px_-28px_rgba(49,30,20,.6)] dark:border-surface-700 dark:bg-surface-900 sm:p-7" aria-label={`${loginProfile.name} sign in`}>
		<div class="mb-5 flex items-start justify-between gap-4">
			<LoginBrand productId={loginProfile.productId} name={loginProfile.name} endorsement={loginProfile.endorsement} heading={step === 'complete' ? 'You’re signed in' : step === 'totp' ? 'One more check' : 'Sign in here'} />
			<button type="button" onclick={dismiss} aria-label="Close sign in" class="min-h-11 rounded-full px-3 py-2 text-sm text-surface-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 dark:text-warm-300">Close</button>
		</div>
		{#if checking}<p class="text-sm text-surface-600 dark:text-warm-300">Checking secure sign-in…</p>
		{:else if !identityKnown}
			<p class="text-sm text-surface-700 dark:text-warm-200">Your sign-in status could not be verified.</p>
			<button type="button" onclick={refresh} class="mt-3 min-h-11 text-sm font-semibold text-accent-700 underline dark:text-accent-300">Retry identity connection</button>
		{:else if step === 'complete'}
			<p class="text-sm text-surface-700 dark:text-warm-200">Signed in as <strong>{userName}</strong>.</p>
			<button type="button" onclick={signOut} disabled={busy} class="mt-5 min-h-11 rounded-full border-2 border-surface-300 px-5 text-sm font-semibold focus-visible:border-accent-700 focus-visible:outline-none disabled:opacity-50 dark:border-surface-600 dark:focus-visible:border-accent-300">{busy ? 'Signing out…' : 'Sign out'}</button>
		{:else if step === 'totp'}
			<form onsubmit={verifyCode} class="grid gap-3">
				<p class="text-sm text-surface-600 dark:text-warm-300">Enter the code from your authenticator app. It stays out of your Ayla conversation and saved history.</p>
				<label for="ayla-auth-code" class="text-sm font-medium">Authenticator code</label><input id="ayla-auth-code" type="text" inputmode="numeric" autocomplete="one-time-code" pattern={'[0-9]{6,8}'} minlength="6" maxlength="8" required bind:value={code} class="min-h-11 rounded-xl border border-surface-300 bg-white px-3 focus:border-accent-600 focus:outline-none dark:border-surface-600 dark:bg-surface-950" />
				<button type="submit" disabled={busy || !/^\d{6,8}$/.test(code)} class="mt-2 min-h-11 rounded-full bg-accent-selected px-5 font-semibold text-on-accent disabled:opacity-50">{busy ? 'Checking…' : 'Verify and sign in'}</button>
			</form>
		{:else}
			<form onsubmit={signIn} class="grid gap-3">
				<p class="text-sm text-surface-600 dark:text-warm-300">This secure form sends credentials to Aylith’s identity gateway. They never enter Ayla’s conversation or saved history.</p>
				<label for="ayla-auth-name" class="text-sm font-medium">Email or login name</label><input id="ayla-auth-name" type="text" autocomplete="username" required bind:value={loginName} class="min-h-11 rounded-xl border border-surface-300 bg-white px-3 focus:border-accent-600 focus:outline-none dark:border-surface-600 dark:bg-surface-950" />
				<label for="ayla-auth-password" class="text-sm font-medium">Password</label><input id="ayla-auth-password" type="password" autocomplete="current-password" required bind:value={password} class="min-h-11 rounded-xl border border-surface-300 bg-white px-3 focus:border-accent-600 focus:outline-none dark:border-surface-600 dark:bg-surface-950" />
				<button type="submit" disabled={!available || busy} class="mt-2 min-h-11 rounded-full bg-accent-selected px-5 font-semibold text-on-accent disabled:opacity-50">{busy ? 'Signing in…' : 'Sign in'}</button>
			</form>
			{#if !available}<button type="button" onclick={refresh} class="mt-3 min-h-11 text-sm font-semibold text-accent-700 underline dark:text-accent-300">Retry identity connection</button>{/if}
		{/if}
		<AppearancePreferences {apiUrl} {authPath} identity={appearanceIdentity} visible={step === 'complete'} />
		{#if error}<p class="mt-4 text-sm text-red-700 dark:text-red-300" role="alert">{error}</p>{/if}
	</div>
{/if}
