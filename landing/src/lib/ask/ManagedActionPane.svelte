<script lang="ts">
 import {onDestroy} from 'svelte';
 import ManagedActionCard from './ManagedActionCard.svelte';
 import type {ManagedAction} from './managed-actions';
 import {resolveAylaAction} from '../explore/navigation';
 let {action,catalogSlugs,requestedSignIn=false,stopVoice,onSignIn,onNavigate,onDismiss}:{action:ManagedAction;catalogSlugs:string[];requestedSignIn?:boolean;stopVoice:()=>Promise<unknown>;onSignIn:()=>void;onNavigate:(action:ManagedAction)=>void;onDismiss:()=>void}=$props();
 let automaticAction:ManagedAction|undefined;
 $effect(()=>{if(action.type==='show_login'&&requestedSignIn&&automaticAction!==action){automaticAction=action;void accept();}});
 let disposed=false;let accepting=$state(false);
 onDestroy(()=>{disposed=true;});
 async function accept(){if(accepting)return;accepting=true;const captured=action;try{await stopVoice();if(disposed||action!==captured)return;if(captured.type==='show_login')onSignIn();else if(resolveAylaAction(captured,catalogSlugs))onNavigate(captured);onDismiss();}finally{if(!disposed)accepting=false;}}
</script>
<div aria-busy={accepting}>{#if !(action.type==='show_login'&&requestedSignIn)}<ManagedActionCard {action} onAccept={()=>void accept()} {onDismiss}/>{/if}</div>
