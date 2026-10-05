import {type ManagedAction, managedAction} from './managed-actions';

export class ManagedVoiceLimit extends Error { constructor(){super('This voice is busy or has reached its session limit.');} }

export function ownedAdmissionFallback(cause:unknown,mode:string,ready:boolean,language:string,voices:{id:string;locale:string}[]) {
 if(!(cause instanceof ManagedVoiceLimit)||mode!=='owned'||!ready)return undefined;
 return voices.find(voice=>voice.locale.split('-')[0]===language);
}

type Callbacks={onState:(state:'idle'|'connecting'|'listening'|'thinking'|'speaking'|'error',detail?:string)=>void;onTranscript:(role:'user'|'assistant',text:string,requestId?:string)=>void;onRequest?:(requestId:string)=>void;onSummary?:(summary:string,requestId:string)=>void;onAction?:(action:ManagedAction,requestId:string)=>void};
type Session={epoch:number;abort:AbortController;socket?:WebSocket;stream?:MediaStream;input?:AudioContext;output?:AudioContext;capture?:AudioWorkletNode;playing:Set<AudioBufferSourceNode>;next:number;reject?:()=>void;timer?:ReturnType<typeof setTimeout>};
/** Duplex managed transport. It is separate from OwnedSpeech's turn protocol. */
export class ManagedSpeech {
 private epoch=0;private session?:Session;
 constructor(private apiUrl:string,private callbacks:Callbacks){}
 async start(request:{language:string;voiceId:string;prompt?:string;context?:string},identityCurrent:()=>boolean=()=>true){
  const cleanup=this.stop(),epoch=this.epoch;await cleanup;if(epoch!==this.epoch||!identityCurrent())return;const session:Session={epoch,abort:new AbortController(),playing:new Set(),next:0};this.session=session;this.callbacks.onState('connecting');
  const current=()=>this.session===session&&this.epoch===epoch&&identityCurrent();
  try{
   const response=await fetch(`${this.apiUrl}/api/auth/voice-agent/session`,{method:'POST',credentials:'include',signal:session.abort.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify(request)});
   if(!current())return;if(!response.ok){if(response.status===429){const failure=await response.json().catch(()=>null);if(!current())return;if(failure?.error==='rate_limited')throw new ManagedVoiceLimit();}throw new Error('This voice is unavailable. Try another voice.');}
   const grant=await response.json() as {url:string;maxSeconds:number;sampleRate:number};if(!current())return;
   const url=new URL(grant.url),api=new URL(this.apiUrl);if(url.protocol!=='wss:'||url.host!==api.host||url.pathname!=='/api/voice/agent/ws'||grant.sampleRate!==16000||!Number.isInteger(grant.maxSeconds)||grant.maxSeconds<15||grant.maxSeconds>120)throw new Error('Voice connection is unavailable.');
   session.output=new AudioContext({sampleRate:16000});await session.output.resume();if(!current())return;
   const socket=new WebSocket(url);session.socket=socket;
   await new Promise<void>((resolve,reject)=>{
    session.reject=()=>reject(new Error('Voice ended.'));
    const timer=setTimeout(()=>reject(new Error('Voice connection timed out.')),10000);
    socket.onerror=()=>{clearTimeout(timer);reject(new Error('Voice connection failed.'));};
    socket.onclose=()=>{clearTimeout(timer);if(current())void this.stop();reject(new Error('Voice ended.'));};
    socket.onmessage=event=>{
     if(!current())return;let message:Record<string,unknown>;try{message=JSON.parse(String(event.data));}catch{return;}
     if(message.type==='ready'){if(typeof message.requestId==='string')this.callbacks.onRequest?.(message.requestId);clearTimeout(timer);session.reject=undefined;resolve();return;}
     if(message.type==='request.summary'&&typeof message.summary==='string'&&message.summary.trim()&&message.summary.length<=180&&typeof message.requestId==='string')this.callbacks.onSummary?.(message.summary,message.requestId);
     if(message.type==='tool.action'){const action=managedAction(message.action);if(action&&typeof message.requestId==='string')this.callbacks.onAction?.(action,message.requestId);}
     if(message.type==='audio.clear'){this.clear(session);this.callbacks.onState('listening');}
     if(message.type==='audio'&&typeof message.audio==='string'&&message.sampleRate===16000)this.play(session,message.audio);
     if(message.type==='transcript'&&message.final===true&&typeof message.text==='string'&&(message.role==='user'||message.role==='assistant')){this.callbacks.onTranscript(message.role,message.text,typeof message.requestId==='string'?message.requestId:undefined);if(message.role==='user')this.callbacks.onState('thinking');}
     if(message.type==='ended')void this.stop();
    };
   });
   if(!current())return;
   const stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true}});
   if(!current()){stream.getTracks().forEach(track=>{track.stop();});return;}session.stream=stream;
   const input=new AudioContext({sampleRate:16000});session.input=input;
   await input.resume();if(!current())return;
   await input.audioWorklet.addModule('/managed-voice-capture-worklet.js');if(!current())return;
   const capture=new AudioWorkletNode(input,'ayla-managed-pcm16');session.capture=capture;
   capture.port.onmessage=event=>{
    if(!current()||!(event.data instanceof ArrayBuffer)||socket.readyState!==WebSocket.OPEN)return;
    if(socket.bufferedAmount>64000){void this.stop();return;}
    const bytes=new Uint8Array(event.data);for(let offset=0;offset<bytes.length;offset+=3200){const part=bytes.subarray(offset,offset+3200);let raw='';for(const byte of part)raw+=String.fromCharCode(byte);socket.send(JSON.stringify({type:'audio_input',audio:btoa(raw)}));}
   };
   const source=input.createMediaStreamSource(stream),silent=input.createGain();silent.gain.value=0;source.connect(capture);capture.connect(silent).connect(input.destination);
   session.timer=setTimeout(()=>void this.stop(),grant.maxSeconds*1000);this.callbacks.onState('listening');
  }catch(error){if(current()){const cleanup=this.stop(),cleanupEpoch=this.epoch;await cleanup;if(this.epoch===cleanupEpoch&&!this.session&&identityCurrent()){this.callbacks.onState('error',error instanceof Error?error.message:'Voice could not start.');throw error;}}}
 }
 private clear(session:Session){for(const source of session.playing){try{source.stop();}catch{/* already ended */}}session.playing.clear();session.next=0;}
 private play(session:Session,audio:string){
  const output=session.output;if(!output)return;let raw:string;try{raw=atob(audio);}catch{void this.stop();return;}
  if(!raw.length||raw.length%2||raw.length>24000||session.next-output.currentTime>2){void this.stop();return;}
  const buffer=output.createBuffer(1,raw.length/2,16000),samples=buffer.getChannelData(0);for(let i=0;i<samples.length;i++){const value=raw.charCodeAt(i*2)|(raw.charCodeAt(i*2+1)<<8);samples[i]=(value>=32768?value-65536:value)/32768;}
  const source=output.createBufferSource();source.buffer=buffer;source.connect(output.destination);source.onended=()=>session.playing.delete(source);
  const start=Math.max(output.currentTime+.02,session.next);source.start(start);session.next=start+buffer.duration;session.playing.add(source);this.callbacks.onState('speaking');
 }
 async stop(){
  this.epoch++;const session=this.session;this.session=undefined;if(!session)return;
  session.abort.abort();session.reject?.();if(session.timer)clearTimeout(session.timer);session.capture?.disconnect();session.stream?.getTracks().forEach(track=>{track.stop();});this.clear(session);
  if(session.socket){session.socket.onmessage=null;session.socket.onclose=null;session.socket.onerror=null;if(session.socket.readyState===WebSocket.OPEN)session.socket.send(JSON.stringify({type:'stop'}));session.socket.close();}
  await Promise.allSettled([session.input?.close(),session.output?.close()]);if(!this.session)this.callbacks.onState('idle');
 }
}
