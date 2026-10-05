import{afterEach,expect,it,vi}from 'vitest';import{ManagedSpeech}from './managed-speech';

afterEach(()=>vi.unstubAllGlobals());
it('Stop during pending microphone permission closes late tracks and preserves selected language/voice and typed request',async()=>{
 let permission!:()=>void,grant!: (stream:MediaStream)=>void;const requested=new Promise<void>(resolve=>permission=resolve);
 const mic=vi.fn(()=>{permission();return new Promise<MediaStream>(resolve=>grant=resolve);});vi.stubGlobal('navigator',{mediaDevices:{getUserMedia:mic}});
 class Socket{static OPEN=1;readyState=1;onmessage:((event:{data:string})=>void)|null=null;onerror:()=>void=()=>{};onclose:()=>void=()=>{};send=vi.fn();close=vi.fn();constructor(){queueMicrotask(()=>this.onmessage?.({data:JSON.stringify({type:'ready',sampleRate:16000})}));}}
 vi.stubGlobal('WebSocket',Socket);vi.stubGlobal('AudioContext',class{resume=async()=>{};close=async()=>{};});const fetcher=vi.fn(async(_input:string,_init?:RequestInit)=>new Response(JSON.stringify({url:'wss://ai.example.test/api/voice/agent/ws?grant=opaque',maxSeconds:30,sampleRate:16000})));vi.stubGlobal('fetch',fetcher);
 const speech=new ManagedSpeech('https://ai.example.test',{onState:()=>{},onTranscript:()=>{}}),request={language:'hu',voiceId:'native-hu',prompt:'What changed?',context:'Current public product page'};
 const starting=speech.start(request);await requested;expect(JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body))).toEqual(request);
 await speech.stop();const stop=vi.fn();grant({getTracks:()=>[{stop}]}as unknown as MediaStream);await starting;expect(stop).toHaveBeenCalledTimes(1);
});
it('actual duplex client sends PCM only after ready, clears scheduled playback on barge-in and fences late frames after Stop',async()=>{
 const stopped=vi.fn(),trackStop=vi.fn(),sent:string[]=[];let socket!:Socket,capture!:Capture;const transcripts=vi.fn();
 class Socket{static OPEN=1;readyState=1;bufferedAmount=0;onmessage:((event:{data:string})=>void)|null=null;onerror:(()=>void)|null=null;onclose:(()=>void)|null=null;send=(data:string)=>sent.push(data);close=vi.fn();constructor(){socket=this;queueMicrotask(()=>this.emit({type:'ready'}));}emit(data:unknown){this.onmessage?.({data:JSON.stringify(data)});}}
 class Audio{currentTime=0;sampleRate=48000;destination={};audioWorklet={addModule:async()=>{}};resume=async()=>{};close=async()=>{};createMediaStreamSource(){return{connect:()=>{}};}createGain(){return{gain:{value:0},connect:()=>({connect:()=>{}})};}createBuffer(_channels:number,length:number,rate:number){return{duration:length/rate,getChannelData:()=>new Float32Array(length)};}createBufferSource(){return{buffer:null,connect:()=>{},onended:null,start:vi.fn(),stop:stopped};}}
 class Capture{port:{onmessage:((event:{data:ArrayBuffer})=>void)|null}={onmessage:null};constructor(){capture=this;}connect(){return{connect:()=>{}};}disconnect=vi.fn();}
 vi.stubGlobal('WebSocket',Socket);vi.stubGlobal('AudioContext',Audio);vi.stubGlobal('AudioWorkletNode',Capture);vi.stubGlobal('navigator',{mediaDevices:{getUserMedia:async()=>({getTracks:()=>[{stop:trackStop}]})}});vi.stubGlobal('fetch',async()=>new Response(JSON.stringify({url:'wss://ai.example.test/api/voice/agent/ws?grant=opaque',maxSeconds:30,sampleRate:16000})));
 const speech=new ManagedSpeech('https://ai.example.test',{onState:()=>{},onTranscript:transcripts});await speech.start({language:'hu',voiceId:'native-hu'});
 capture.port.onmessage?.({data:new Uint8Array([0,128,255,127]).buffer});expect(JSON.parse(sent[0])).toEqual({type:'audio_input',audio:'AID/fw=='});
 socket.emit({type:'audio',sampleRate:16000,audio:btoa('\0\0'.repeat(160))});socket.emit({type:'audio.clear'});expect(stopped).toHaveBeenCalledTimes(1);
 const late=socket.onmessage;if(!late)throw new Error('No active socket handler');await speech.stop();late({data:JSON.stringify({type:'transcript',role:'assistant',text:'late',final:true})});expect(transcripts).not.toHaveBeenCalled();expect(trackStop).toHaveBeenCalledTimes(1);expect(JSON.parse(sent.at(-1)??'')).toEqual({type:'stop'});
});
it('agent greeting plays while microphone permission is pending instead of being silently discarded',async()=>{
 let socket!:Socket,grant!:(stream:MediaStream)=>void,permission!:()=>void;const requested=new Promise<void>(resolve=>permission=resolve),played=vi.fn();
 class Socket{static OPEN=1;readyState=1;bufferedAmount=0;onmessage:((event:{data:string})=>void)|null=null;onerror=null;onclose=null;send=vi.fn();close=vi.fn();constructor(){socket=this;queueMicrotask(()=>this.emit({type:'ready'}));}emit(message:unknown){this.onmessage?.({data:JSON.stringify(message)});}}
 class Audio{currentTime=0;destination={};resume=async()=>{};close=async()=>{};createBuffer(_channels:number,length:number,rate:number){return{duration:length/rate,getChannelData:()=>new Float32Array(length)};}createBufferSource(){return{buffer:null,connect:()=>{},onended:null,start:played,stop:()=>{}};}}
 vi.stubGlobal('WebSocket',Socket);vi.stubGlobal('AudioContext',Audio);vi.stubGlobal('navigator',{mediaDevices:{getUserMedia:()=>{permission();return new Promise<MediaStream>(resolve=>grant=resolve);}}});vi.stubGlobal('fetch',async()=>new Response(JSON.stringify({url:'wss://ai.example.test/api/voice/agent/ws?grant=opaque',maxSeconds:30,sampleRate:16000})));
 const speech=new ManagedSpeech('https://ai.example.test',{onState:()=>{},onTranscript:()=>{}});const starting=speech.start({language:'hu',voiceId:'native-hu'});await requested;
 try{socket.emit({type:'audio',sampleRate:16000,audio:btoa('\0\0'.repeat(160))});expect(played).toHaveBeenCalledTimes(1);}finally{await speech.stop();grant({getTracks:()=>[{stop:()=>{}}]}as unknown as MediaStream);await starting;}
});
it('a delayed old AudioContext close cannot let an older Start overwrite the newer session',async()=>{
 let releaseClose!:()=>void,closed!:()=>void;const closing=new Promise<void>(resolve=>closed=resolve),waitClose=new Promise<void>(resolve=>releaseClose=resolve);let contexts=0,mics=0,requested!:()=>void;const secondPermission=new Promise<void>(resolve=>requested=resolve);const permissions:((stream:MediaStream)=>void)[]=[];
 class Audio{first=contexts++===0;resume=async()=>{};close=()=>{if(this.first){closed();return waitClose;}return Promise.resolve();};}
 class Socket{static OPEN=1;readyState=1;bufferedAmount=0;onmessage:((event:{data:string})=>void)|null=null;onerror=null;onclose=null;send=vi.fn();close=vi.fn();constructor(){queueMicrotask(()=>this.onmessage?.({data:JSON.stringify({type:'ready'})}));}}
 vi.stubGlobal('AudioContext',Audio);vi.stubGlobal('WebSocket',Socket);vi.stubGlobal('navigator',{mediaDevices:{getUserMedia:()=>{if(++mics===2)requested();return new Promise<MediaStream>(resolve=>permissions.push(resolve));}}});const fetcher=vi.fn(async()=>new Response(JSON.stringify({url:'wss://ai.example.test/api/voice/agent/ws?grant=opaque',maxSeconds:30,sampleRate:16000})));vi.stubGlobal('fetch',fetcher);
 const speech=new ManagedSpeech('https://ai.example.test',{onState:()=>{},onTranscript:()=>{}}),request={language:'hu',voiceId:'native-hu'};const first=speech.start(request);while(!mics)await new Promise(resolve=>setTimeout(resolve,0));
 const older=speech.start(request);await closing;const newer=speech.start(request);await secondPermission;releaseClose();await Promise.race([older,new Promise(resolve=>setTimeout(resolve,5))]);
 try{expect(fetcher).toHaveBeenCalledTimes(2);}finally{await speech.stop();for(const resolve of permissions)resolve({getTracks:()=>[{stop:()=>{}}]}as unknown as MediaStream);await Promise.all([first,newer,older]);}
});
