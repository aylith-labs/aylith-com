class ManagedPcmCapture extends AudioWorkletProcessor {
 constructor(){super();this.pending=new Int16Array(1600);this.length=0;this.weight=0;this.sum=0;this.ratio=sampleRate/16000;}
 emit(){const bytes=new ArrayBuffer(this.length*2),view=new DataView(bytes);for(let i=0;i<this.length;i++)view.setInt16(i*2,this.pending[i],true);this.port.postMessage(bytes,[bytes]);this.length=0;}
 process(inputs){const channel=inputs[0]?.[0];if(!channel)return true;
  for(const value of channel){let left=1;const sample=Number.isFinite(value)?Math.max(-1,Math.min(1,value)):0;
   while(left>0){const part=Math.min(left,this.ratio-this.weight);this.sum+=sample*part;this.weight+=part;left-=part;
    if(this.weight>=this.ratio-1e-9){const average=this.sum/this.ratio;this.pending[this.length++]=average<0?average*32768:average*32767;this.weight=0;this.sum=0;if(this.length===1600)this.emit();}
   }
  }return true;
 }
}
registerProcessor('ayla-managed-pcm16',ManagedPcmCapture);
