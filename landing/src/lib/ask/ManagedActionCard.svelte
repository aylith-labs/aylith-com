<script lang="ts">
 import {actionLabel,type ManagedAction} from './managed-actions';
 let {action,onAccept,onDismiss}:{action:ManagedAction;onAccept:()=>void;onDismiss:()=>void}=$props();
</script>
<div class="mx-auto my-3 flex max-w-lg items-center gap-3 rounded-2xl border border-surface-200 bg-white/90 p-3 text-sm dark:border-surface-700 dark:bg-surface-900" role="group" aria-label="Ayla suggested action">
 <span class="min-w-0 flex-1">{actionLabel(action)}</span>
 <button onclick={onAccept} class="min-h-11 rounded-full bg-accent-100 px-4 font-medium text-accent-800 dark:bg-accent-900 dark:text-accent-200">{action.type==='show_login'?'Sign in':'Open'}</button>
 <button onclick={onDismiss} class="min-h-11 rounded-full px-3 text-surface-600 dark:text-surface-300" aria-label="Dismiss suggested action">Dismiss</button>
</div>
